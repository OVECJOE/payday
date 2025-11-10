import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  PaymentProvider,
} from '../transaction/entities/transaction.entity';
import { RecurringSchedule } from '../schedule/entities/recurring-schedule.entity';
import { PaymentOrchestratorService } from './payment-orchestrator.service';
import { WalletService } from '../wallet/wallet.service';
import { EncryptionService } from '@common/services/encryption.service';
import { ScheduleService } from '../schedule/schedule.service';

export interface PaymentContext {
  schedule: RecurringSchedule;
  idempotencyKey: string;
}

export interface PaymentResult {
  success: boolean;
  transaction: Transaction;
  message?: string;
}

@Injectable()
export class PaymentProcessorService {
  private readonly logger = new Logger(PaymentProcessorService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private paymentOrchestrator: PaymentOrchestratorService,
    private walletService: WalletService,
    private scheduleService: ScheduleService,
    private encryptionService: EncryptionService,
  ) {}

  private readonly platformFeeRate = 0.003; // 0.3%
  private readonly platformFeeCap = 50;
  private readonly paystackTransferFlatFee = 10;
  private readonly paystackCardRate = 0.015;
  private readonly paystackCardFlat = 100;
  private readonly paystackCardFlatThreshold = 2500;
  private readonly paystackCardFeeCap = 2000;

  private async createPendingTransaction(
    schedule: RecurringSchedule,
    idempotencyKey: string,
  ): Promise<Transaction> {
    const feeBreakdown = this.calculateTransferFee(Number(schedule.amount));
    const transaction = this.transactionRepository.create({
      idempotencyKey,
      userId: schedule.userId,
      scheduleId: schedule.id,
      recipientId: schedule.recipientId,
      amount: schedule.amount,
      fee: feeBreakdown.totalFee,
      type: TransactionType.SCHEDULED_PAYMENT,
      status: TransactionStatus.PENDING,
      provider: PaymentProvider.PAYSTACK,
      description: schedule.description,
      metadata: {
        ...(schedule.metadata || {}),
        feeBreakdown,
      },
    });

    return this.transactionRepository.save(transaction);
  }

  private async createFailedTransaction(
    schedule: RecurringSchedule,
    idempotencyKey: string,
    reason: string,
  ): Promise<Transaction> {
    const feeBreakdown = this.calculateTransferFee(Number(schedule.amount));
    const transaction = this.transactionRepository.create({
      idempotencyKey,
      userId: schedule.userId,
      scheduleId: schedule.id,
      recipientId: schedule.recipientId,
      amount: schedule.amount,
      fee: feeBreakdown.totalFee,
      type: TransactionType.SCHEDULED_PAYMENT,
      status: TransactionStatus.FAILED,
      provider: PaymentProvider.PAYSTACK,
      failureReason: reason,
      description: schedule.description,
      metadata: {
        ...(schedule.metadata || {}),
        feeBreakdown,
      },
    });

    return this.transactionRepository.save(transaction);
  }

  async processScheduledPayment(
    context: PaymentContext,
  ): Promise<PaymentResult> {
    const { schedule, idempotencyKey } = context;

    const existingTransaction = await this.transactionRepository.findOne({
      where: { idempotencyKey },
    });

    if (existingTransaction) {
      this.logger.warn(`Duplicate payment attempt detected: ${idempotencyKey}`);
      return {
        success: existingTransaction.isSuccessful(),
        transaction: existingTransaction,
        message: 'Payment already processed',
      };
    }

    const lockResult = await this.walletService.lockFunds(
      schedule.userId,
      Number(schedule.amount),
    );

    if (!lockResult.success) {
      const transaction = await this.createFailedTransaction(
        schedule,
        idempotencyKey,
        'Insufficient balance',
      );

      await this.scheduleService.markScheduleAsRun(schedule.id, false);

      return {
        success: false,
        transaction,
        message: 'Insufficient balance',
      };
    }

    let transaction = await this.createPendingTransaction(
      schedule,
      idempotencyKey,
    );

    try {
      const paymentResult = await this.paymentOrchestrator.initiatePayment({
        amount: Number(schedule.amount),
        recipientAccount: schedule.recipient.accountNumber,
        recipientBank: schedule.recipient.bankCode,
        recipientName: schedule.recipient.name,
        reference: transaction.id,
        narration: schedule.description || 'Payday scheduled payment',
        metadata: {
          scheduleId: schedule.id,
          userId: schedule.userId,
        },
      });

      transaction.providerReference = paymentResult.providerReference;
      transaction.providerResponse = paymentResult.data as Record<string, any>;

      if (paymentResult.success) {
        const feeBreakdown = this.calculateTransferFee(
          Number(schedule.amount),
          paymentResult.data as Record<string, any>,
        );
        transaction.fee = feeBreakdown.totalFee;
        transaction.metadata = {
          ...(transaction.metadata ?? {}),
          feeBreakdown,
        };

        transaction.status =
          paymentResult.status === 'success'
            ? TransactionStatus.SUCCESS
            : TransactionStatus.PROCESSING;

        if (paymentResult.status === 'success') {
          await this.walletService.debitWallet(
            schedule.userId,
            Number(schedule.amount),
            true,
          );
          transaction.completedAt = new Date();
        }
      } else {
        transaction.status = TransactionStatus.FAILED;
        transaction.failureReason =
          paymentResult.message || 'Payment initiation failed';
        await this.walletService.unlockFunds(
          schedule.userId,
          Number(schedule.amount),
        );
      }

      transaction = await this.transactionRepository.save(transaction);

      await this.scheduleService.markScheduleAsRun(
        schedule.id,
        transaction.isSuccessful(),
      );

      return {
        success: paymentResult.success,
        transaction,
        message: paymentResult.message,
      };
    } catch (error) {
      this.logger.error('Payment processing error', error);

      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = (error as Error).message;
      await this.transactionRepository.save(transaction);

      await this.walletService.unlockFunds(
        schedule.userId,
        Number(schedule.amount),
      );

      await this.scheduleService.markScheduleAsRun(schedule.id, false);

      return {
        success: false,
        transaction,
        message: (error as Error).message,
      };
    }
  }

  async retryFailedPayment(transactionId: string): Promise<PaymentResult> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['schedule', 'schedule.recipient'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!transaction.canRetry()) {
      throw new BadRequestException('Payment cannot be retried');
    }

    if (!transaction.schedule) {
      throw new BadRequestException('Transaction has no associated schedule');
    }

    transaction.retryCount += 1;
    transaction.status = TransactionStatus.PENDING;
    await this.transactionRepository.save(transaction);

    return this.processScheduledPayment({
      schedule: transaction.schedule,
      idempotencyKey: this.encryptionService.generateIdempotencyKey(),
    });
  }

  async verifyPendingTransaction(transactionId: string): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction || !transaction.isPending()) {
      return;
    }

    try {
      const verificationResult = await this.paymentOrchestrator.verifyPayment(
        transaction.id,
        transaction.provider,
      );

      if (
        verificationResult.success &&
        verificationResult.status === 'success'
      ) {
        transaction.status = TransactionStatus.SUCCESS;
        transaction.completedAt = new Date();

        await this.walletService.debitWallet(
          transaction.userId,
          Number(transaction.amount),
          true,
        );
      } else if (verificationResult.status === 'failed') {
        transaction.status = TransactionStatus.FAILED;
        transaction.failureReason =
          verificationResult.message || 'Payment verification failed';

        await this.walletService.unlockFunds(
          transaction.userId,
          Number(transaction.amount),
        );
      }

      await this.transactionRepository.save(transaction);
    } catch (error) {
      this.logger.error('Payment verification error', error);
    }
  }

  async getTransactionHistory(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: { userId },
        relations: ['recipient', 'schedule'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      },
    );

    return { transactions, total };
  }

  async getTransactionById(
    transactionId: string,
    userId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
      relations: ['recipient', 'schedule'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  estimateTransferFee(amount: number): {
    provider: string;
    providerFee: number;
    platformFee: number;
    totalFee: number;
  } {
    const { providerFee, platformFee, totalFee } =
      this.calculateTransferFee(amount);
    return {
      provider: this.paymentOrchestrator.getProviderName(),
      providerFee,
      platformFee,
      totalFee,
    };
  }

  estimateCollectionFee(amount: number): {
    provider: string;
    providerFee: number;
    platformFee: number;
    totalFee: number;
  } {
    const { providerFee, platformFee, totalFee } =
      this.calculateCollectionFee(amount);
    return {
      provider: this.paymentOrchestrator.getProviderName(),
      providerFee,
      platformFee,
      totalFee,
    };
  }

  private calculateTransferFee(
    amount: number,
    providerData?: Record<string, any>,
  ): { providerFee: number; platformFee: number; totalFee: number } {
    const providerFee = this.calculateTransferProviderFee(amount, providerData);
    const platformFee = this.calculatePlatformFee(amount);
    const totalFee = this.roundCurrency(providerFee + platformFee);

    return {
      providerFee,
      platformFee,
      totalFee,
    };
  }

  private calculateCollectionFee(
    amount: number,
    providerData?: Record<string, any>,
  ): { providerFee: number; platformFee: number; totalFee: number } {
    const providerFee = this.calculateCollectionProviderFee(
      amount,
      providerData,
    );
    const platformFee = this.calculatePlatformFee(amount);
    const totalFee = this.roundCurrency(providerFee + platformFee);

    return {
      providerFee,
      platformFee,
      totalFee,
    };
  }

  private calculateTransferProviderFee(
    _amount: number,
    providerData?: Record<string, any>,
  ): number {
    const extracted = this.extractProviderFee(providerData);
    if (extracted !== null) {
      return extracted;
    }

    return this.paystackTransferFlatFee;
  }

  private calculateCollectionProviderFee(
    amount: number,
    providerData?: Record<string, any>,
  ): number {
    const extracted = this.extractProviderFee(providerData);
    if (extracted !== null) {
      return extracted;
    }

    const percentageFee = amount * this.paystackCardRate;
    const flatFee =
      amount > this.paystackCardFlatThreshold ? this.paystackCardFlat : 0;
    const total = percentageFee + flatFee;

    return this.roundCurrency(Math.min(total, this.paystackCardFeeCap));
  }

  private calculatePlatformFee(amount: number): number {
    if (amount <= 0) {
      return 0;
    }
    return this.roundCurrency(
      Math.min(amount * this.platformFeeRate, this.platformFeeCap),
    );
  }

  private extractProviderFee(data?: Record<string, any>): number | null {
    if (!data) {
      return null;
    }

    const candidates = [
      data.fee,
      data.fees,
      data.transfer_fee,
      data.charged_fee,
      data.charged_amount,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'number') {
        return this.normalizeProviderFee(candidate);
      }
    }

    if (typeof data.data === 'object' && data.data !== null) {
      const nested = this.extractProviderFee(data.data as Record<string, any>);
      if (nested !== null) {
        return nested;
      }
    }

    return null;
  }

  private normalizeProviderFee(rawFee: number): number {
    if (Number.isNaN(rawFee)) {
      return 0;
    }

    if (rawFee > 1000) {
      return this.roundCurrency(rawFee / 100);
    }

    return this.roundCurrency(rawFee);
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
