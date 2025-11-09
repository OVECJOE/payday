import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { PaymentModule } from '../payment/payment.module';
import { Transaction } from '../transaction/entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { EncryptionService } from '@common/services/encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction, User]),
    PaymentModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, EncryptionService],
  exports: [WalletService],
})
export class WalletModule {}
