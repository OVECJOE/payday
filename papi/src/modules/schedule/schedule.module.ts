import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleQueueProcessor } from './processors/schedule.processor';
import { RecurringSchedule } from './entities/recurring-schedule.entity';
import { TimeService } from '@common/services/time.service';
import { EncryptionService } from '@common/services/encryption.service';
import { WalletModule } from '../wallet/wallet.module';
import { QueueName } from '@config/queue.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringSchedule]),
    BullModule.registerQueue(
      { name: QueueName.SCHEDULE_CHECK },
      { name: QueueName.PAYMENT },
    ),
    WalletModule,
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    ScheduleQueueProcessor,
    TimeService,
    EncryptionService,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
