import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
} from '../transaction/entities/transaction.entity';
import { PaystackProvider } from '../payment/providers/paystack.provider';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private paystackProvider: PaystackProvider,
    private walletService: WalletService,
  ) {}

  async handlePaystackWebhook(payload: any, signature: string): Promise<void> {
    const isValid = this.paystackProvider.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const { event, data } = payload as {
      event: string;
      data: Record<string, any>;
    };

    this.logger.log(`Processing Paystack webhook event: ${event}`);

    switch (event) {
      case 'transfer.success':
        await this.handleTransferSuccess(data);
        break;
      case 'transfer.failed':
        await this.handleTransferFailed(data);
        break;
      case 'transfer.reversed':
        await this.handleTransferReversed(data);
        break;
      default:
        this.logger.log(`Unhandled Paystack event: ${event}`);
    }
  }

  private async handleTransferSuccess(
    data: Record<string, any>,
  ): Promise<void> {
    const transaction = await this.findTransactionByReference(
      data.reference as string,
    );

    if (!transaction) {
      this.logger.warn(
        `Transaction not found for reference: ${data.reference}`,
      );
      return;
    }

    if (transaction.isSuccessful()) {
      this.logger.log(
        `Transaction ${transaction.id} already marked as successful`,
      );
      return;
    }

    if (transaction.status === TransactionStatus.PROCESSING) {
      await this.walletService.debitWallet(
        transaction.userId,
        Number(transaction.amount),
        true,
      );
    }

    transaction.status = TransactionStatus.SUCCESS;
    transaction.completedAt = new Date();
    transaction.providerResponse = data;

    await this.transactionRepository.save(transaction);
    this.logger.log(`Transaction ${transaction.id} marked as successful`);
  }

  private async handleTransferFailed(data: Record<string, any>): Promise<void> {
    const transaction = await this.findTransactionByReference(
      data.reference as string,
    );

    if (!transaction) {
      this.logger.warn(
        `Transaction not found for reference: ${data.reference}`,
      );
      return;
    }

    if (transaction.isFailed()) {
      this.logger.log(`Transaction ${transaction.id} already marked as failed`);
      return;
    }

    transaction.status = TransactionStatus.FAILED;
    transaction.failureReason =
      (data as { message?: string }).message || 'Transfer failed';
    transaction.providerResponse = data;

    await this.transactionRepository.save(transaction);

    await this.walletService.unlockFunds(
      transaction.userId,
      Number(transaction.amount),
    );

    this.logger.log(`Transaction ${transaction.id} marked as failed`);
  }

  private async handleTransferReversed(
    data: Record<string, any>,
  ): Promise<void> {
    const transaction = await this.findTransactionByReference(
      data.reference as string,
    );

    if (!transaction) {
      this.logger.warn(
        `Transaction not found for reference: ${data.reference}`,
      );
      return;
    }

    transaction.status = TransactionStatus.REVERSED;
    transaction.providerResponse = data;

    await this.transactionRepository.save(transaction);

    await this.walletService.creditWallet(
      transaction.userId,
      Number(transaction.amount),
    );

    this.logger.log(`Transaction ${transaction.id} reversed and refunded`);
  }

  private async findTransactionByReference(
    reference: string,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { id: reference },
    });
  }
}
