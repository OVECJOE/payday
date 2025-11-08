import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { QueueName } from '@config/queue.config';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueName.SCHEDULE_CHECK },
      { name: QueueName.PAYMENT },
    ),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
