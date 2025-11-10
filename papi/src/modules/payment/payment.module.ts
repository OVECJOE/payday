import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PaymentOrchestratorService } from './payment-orchestrator.service';
import { PaymentProcessorService } from './payment-processor.service';
import { PaystackProvider } from './providers/paystack.provider';
import { PaymentQueueProcessor } from './processors/payment.processor';
import { Transaction } from '../transaction/entities/transaction.entity';
import { RecurringSchedule } from '../schedule/entities/recurring-schedule.entity';
import { EncryptionService } from '@common/services/encryption.service';
import { WalletModule } from '../wallet/wallet.module';
import { QueueName } from '@config/queue.config';
import { ScheduleService } from '../schedule/schedule.service';
import { TimeService } from '@common/services/time.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, RecurringSchedule]),
    BullModule.registerQueue({ name: QueueName.PAYMENT }),
    forwardRef(() => WalletModule),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentOrchestratorService,
    PaymentProcessorService,
    PaystackProvider,
    PaymentQueueProcessor,
    EncryptionService,
    ScheduleService,
    TimeService,
  ],
  exports: [
    PaymentOrchestratorService,
    PaymentProcessorService,
    PaystackProvider,
  ],
})
export class PaymentModule {}
