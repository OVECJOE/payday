import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueName, JobName } from '@config/queue.config';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QueueName.SCHEDULE_CHECK) private scheduleCheckQueue: Queue,
    @InjectQueue(QueueName.PAYMENT) private paymentQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.setupRecurringJobs();
  }

  private async setupRecurringJobs(): Promise<void> {
    await this.scheduleCheckQueue.add(
      JobName.CHECK_DUE_SCHEDULES,
      {},
      {
        repeat: {
          pattern: '* * * * *',
        },
        jobId: JobName.CHECK_DUE_SCHEDULES,
      },
    );

    this.logger.log(
      'Recurring job setup complete: check due schedules every minute',
    );
  }

  async addPaymentVerificationJob(
    transactionId: string,
    delayMs = 60000,
  ): Promise<void> {
    await this.paymentQueue.add(
      JobName.VERIFY_PAYMENT,
      { transactionId },
      {
        delay: delayMs,
        jobId: `verify-${transactionId}`,
      },
    );

    this.logger.log(
      `Added payment verification job for transaction ${transactionId}`,
    );
  }

  async getQueueStats(): Promise<any> {
    const scheduleCheckStats = {
      waiting: await this.scheduleCheckQueue.getWaitingCount(),
      active: await this.scheduleCheckQueue.getActiveCount(),
      completed: await this.scheduleCheckQueue.getCompletedCount(),
      failed: await this.scheduleCheckQueue.getFailedCount(),
      delayed: await this.scheduleCheckQueue.getDelayedCount(),
    };

    const paymentStats = {
      waiting: await this.paymentQueue.getWaitingCount(),
      active: await this.paymentQueue.getActiveCount(),
      completed: await this.paymentQueue.getCompletedCount(),
      failed: await this.paymentQueue.getFailedCount(),
      delayed: await this.paymentQueue.getDelayedCount(),
    };

    return {
      scheduleCheck: scheduleCheckStats,
      payment: paymentStats,
    };
  }

  async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    this.logger.warn(`Queue ${queueName} paused`);
  }

  async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    this.logger.log(`Queue ${queueName} resumed`);
  }

  private getQueue(queueName: QueueName): Queue {
    switch (queueName) {
      case QueueName.SCHEDULE_CHECK:
        return this.scheduleCheckQueue;
      case QueueName.PAYMENT:
        return this.paymentQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }
}
