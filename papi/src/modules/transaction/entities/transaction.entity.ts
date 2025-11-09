import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Recipient } from '../../recipient/entities/recipient.entity';
import { RecurringSchedule } from '../../schedule/entities/recurring-schedule.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export enum TransactionType {
  SCHEDULED_PAYMENT = 'scheduled_payment',
  MANUAL_PAYMENT = 'manual_payment',
  WALLET_FUNDING = 'wallet_funding',
  REFUND = 'refund',
}

export enum PaymentProvider {
  PAYSTACK = 'paystack',
  FLUTTERWAVE = 'flutterwave',
  MANUAL = 'manual',
}

@Entity('transactions')
@Index(['userId', 'status', 'createdAt'])
@Index(['scheduleId', 'status'])
@Index(['providerReference'])
@Index(['idempotencyKey'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  idempotencyKey: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  scheduleId?: string;

  @ManyToOne(() => RecurringSchedule, { onDelete: 'NO ACTION', nullable: true })
  @JoinColumn({ name: 'scheduleId' })
  schedule?: RecurringSchedule;

  @Column({ type: 'uuid', nullable: true })
  recipientId?: string;

  @ManyToOne(() => Recipient, { onDelete: 'NO ACTION', nullable: true })
  @JoinColumn({ name: 'recipientId' })
  recipient?: Recipient;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  fee: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  @Index()
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider: PaymentProvider;

  @Column({ nullable: true })
  providerReference?: string;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  providerResponse?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isSuccessful(): boolean {
    return this.status === TransactionStatus.SUCCESS;
  }

  isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  isPending(): boolean {
    return (
      this.status === TransactionStatus.PENDING ||
      this.status === TransactionStatus.PROCESSING
    );
  }

  canRetry(): boolean {
    return this.isFailed() && this.retryCount < 3;
  }

  getTotalAmount(): number {
    return Number(this.amount) + Number(this.fee);
  }
}
