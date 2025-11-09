import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { IsNumber, IsEmail, Min } from 'class-validator';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Wallet } from './entities/wallet.entity';
import { PaystackProvider } from '../payment/providers/paystack.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentProvider,
} from '../transaction/entities/transaction.entity';
import { EncryptionService } from '@common/services/encryption.service';
import { User } from '../user/entities/user.entity';

class FundWalletDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsEmail()
  email: string;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private walletService: WalletService,
    @Inject(forwardRef(() => PaystackProvider))
    private paystackProvider: PaystackProvider,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private encryptionService: EncryptionService,
  ) {}

  @Get()
  async getWallet(@CurrentUser('id') userId: string): Promise<Wallet> {
    return this.walletService.getWalletByUserId(userId);
  }

  @Get('balance')
  async getBalance(
    @CurrentUser('id') userId: string,
  ): Promise<{ total: number; available: number; locked: number }> {
    return this.walletService.getBalance(userId);
  }

  @Post('fund')
  async fundWallet(
    @CurrentUser('id') userId: string,
    @Body() dto: FundWalletDto,
  ): Promise<{ authorizationUrl: string; reference: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const idempotencyKey = this.encryptionService.generateIdempotencyKey();
    const reference = idempotencyKey;

    const transaction = this.transactionRepository.create({
      idempotencyKey,
      userId,
      scheduleId: idempotencyKey,
      amount: dto.amount,
      fee: 0,
      type: TransactionType.WALLET_FUNDING,
      status: TransactionStatus.PENDING,
      provider: PaymentProvider.PAYSTACK,
      description: 'Wallet funding',
      metadata: { source: 'user_funding' },
    });

    await this.transactionRepository.save(transaction);

    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/wallet?funding=success`;

    const paymentResult =
      await this.paystackProvider.initializePaymentCollection({
        amount: dto.amount,
        email: dto.email || user.email,
        reference,
        metadata: {
          userId,
          transactionId: transaction.id,
          type: 'wallet_funding',
        },
        callbackUrl,
      });

    if (!paymentResult.success) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = paymentResult.message;
      await this.transactionRepository.save(transaction);
      throw new Error(paymentResult.message || 'Failed to initialize payment');
    }

    transaction.providerReference = paymentResult.reference;
    await this.transactionRepository.save(transaction);

    return {
      authorizationUrl: paymentResult.authorizationUrl,
      reference: paymentResult.reference,
    };
  }
}
