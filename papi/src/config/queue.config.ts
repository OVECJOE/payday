import { QueueOptions } from 'bullmq';
import { ConfigService } from '@nestjs/config';

export const getQueueConfig = (configService: ConfigService): QueueOptions => ({
  connection: {
    host: configService.get<string>('REDIS_HOST'),
    port: configService.get<number>('REDIS_PORT'),
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 86400, // 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // 7 days
    },
  },
});

export enum QueueName {
  PAYMENT = 'payment',
  SCHEDULE_CHECK = 'schedule-check',
  WEBHOOK = 'webhook',
  NOTIFICATION = 'notification',
}

export enum JobName {
  PROCESS_PAYMENT = 'process-payment',
  CHECK_DUE_SCHEDULES = 'check-due-schedules',
  VERIFY_PAYMENT = 'verify-payment',
  PROCESS_WEBHOOK = 'process-webhook',
  SEND_EMAIL = 'send-email',
  SEND_SMS = 'send-sms',
  SEND_PUSH = 'send-push',
}
