import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ScheduleService } from '../schedule.service';
import { EncryptionService } from '@common/services/encryption.service';
import { QueueName, JobName } from '@config/queue.config';

@Processor(QueueName.SCHEDULE_CHECK)
export class ScheduleQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduleQueueProcessor.name);

  constructor(
    private scheduleService: ScheduleService,
    private encryptionService: EncryptionService,
    @InjectQueue(QueueName.PAYMENT) private paymentQueue: Queue,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job ${job.name} with id ${job.id}`);

    switch (job.name as JobName) {
      case JobName.CHECK_DUE_SCHEDULES:
        return this.checkDueSchedules();
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async checkDueSchedules(): Promise<void> {
    this.logger.log('Checking for due payment schedules');

    try {
      const { schedules: dueSchedules, total } =
        await this.scheduleService.getDueSchedules();

      if (total === 0) {
        this.logger.log('No due schedules found');
        return;
      }

      this.logger.log(`Found ${total} due schedules`);

      const queuePromises = dueSchedules.map(async (schedule) => {
        const idempotencyKey = this.encryptionService.generateIdempotencyKey();
        return this.paymentQueue.add(
          JobName.PROCESS_PAYMENT,
          {
            schedule,
            idempotencyKey,
          },
          {
            jobId: `payment-${schedule.id}-${Date.now()}`,
            removeOnComplete: true,
            removeOnFail: false,
          },
        );
      });

      await Promise.all(queuePromises);
      this.logger.log(`Queued ${dueSchedules.length} payment for processing`);
    } catch (error) {
      this.logger.error('Error checking due schedules', error);
      throw error;
    }
  }
}
