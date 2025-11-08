import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), PaymentModule],
  controllers: [TransactionController],
})
export class TransactionModule {}
