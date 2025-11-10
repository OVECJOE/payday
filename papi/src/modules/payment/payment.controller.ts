import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsNumber, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentProcessorService } from './payment-processor.service';

class FeeEstimateDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsIn(['transfer', 'collection'])
  type?: 'transfer' | 'collection';
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private paymentProcessorService: PaymentProcessorService) {}

  @Post('estimate-fee')
  estimateFee(@Body() dto: FeeEstimateDto): {
    provider: string;
    providerFee: number;
    platformFee: number;
    totalFee: number;
  } {
    const type = dto.type ?? 'transfer';
    if (type === 'collection') {
      return this.paymentProcessorService.estimateCollectionFee(dto.amount);
    }

    return this.paymentProcessorService.estimateTransferFee(dto.amount);
  }
}
