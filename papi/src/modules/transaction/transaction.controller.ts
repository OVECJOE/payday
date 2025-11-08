import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PaymentProcessorService } from '../payment/payment-processor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Transaction } from './entities/transaction.entity';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private paymentProcessorService: PaymentProcessorService) {}

  @Get()
  async getTransactionHistory(
    @CurrentUser('id') userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    return this.paymentProcessorService.getTransactionHistory(
      userId,
      limit,
      offset,
    );
  }

  @Get(':id')
  async getTransactionById(
    @CurrentUser('id') userId: string,
    @Param('id') transactionId: string,
  ): Promise<Transaction> {
    return this.paymentProcessorService.getTransactionById(
      transactionId,
      userId,
    );
  }
}
