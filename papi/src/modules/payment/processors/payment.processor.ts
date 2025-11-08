import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  PaymentProcessorService,
  PaymentContext,
  PaymentResult,
} from '../payment-processor.service';
import { QueueName, JobName } from '@config/queue.config';

@Processor(QueueName.PAYMENT)
export class PaymentQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentQueueProcessor.name);

  constructor(private paymentProcessorService: PaymentProcessorService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job ${job.name} with id ${job.id}`);

    switch (job.name as JobName) {
      case JobName.PROCESS_PAYMENT:
        return this.processPayment(job as Job<PaymentContext>);
      case JobName.VERIFY_PAYMENT:
        return this.verifyPayment(job as Job<{ transactionId: string }>);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async processPayment(
    job: Job<PaymentContext>,
  ): Promise<PaymentResult> {
    const { schedule, idempotencyKey } = job.data;

    this.logger.log(
      `Processing scheduled payment for schedule ${schedule.id}, user ${schedule.userId}`,
    );

    try {
      const result = await this.paymentProcessorService.processScheduledPayment(
        {
          schedule,
          idempotencyKey,
        },
      );

      if (result.success) {
        this.logger.log(
          `Payment successful for schedule ${schedule.id}, transaction ${result.transaction.id}`,
        );
      } else {
        this.logger.error(
          `Payment failed for schedule ${schedule.id}: ${result.message}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error processing payment for schedule ${schedule.id}`,
        error,
      );
      throw error;
    }
  }

  private async verifyPayment(
    job: Job<{ transactionId: string }>,
  ): Promise<void> {
    const { transactionId } = job.data;

    this.logger.log(`Verifying transaction ${transactionId}`);

    try {
      await this.paymentProcessorService.verifyPendingTransaction(
        transactionId,
      );
      this.logger.log(`Transaction ${transactionId} verified`);
    } catch (error) {
      this.logger.error(`Error verifying transaction ${transactionId}`, error);
      throw error;
    }
  }
}
