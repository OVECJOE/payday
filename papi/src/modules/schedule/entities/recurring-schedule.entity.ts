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

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum ScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('recurring_schedules')
@Index(['status', 'nextRunDate'])
@Index(['userId', 'status'])
export class RecurringSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  recipientId: string;

  @ManyToOne(() => Recipient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recipientId' })
  recipient: Recipient;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ScheduleFrequency,
  })
  frequency: ScheduleFrequency;

  @Column({ type: 'int', nullable: true })
  dayOfWeek?: number;

  @Column({ type: 'int', nullable: true })
  dayOfMonth?: number;

  @Column({ type: 'int', nullable: true })
  customIntervalDays?: number;

  @Column({ type: 'int' })
  hour?: number;

  @Column({ type: 'int' })
  minute?: number;

  @Column({ type: 'timestamp' })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'timestamp' })
  @Index()
  nextRunDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRunDate?: Date;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.ACTIVE,
  })
  @Index()
  status: ScheduleStatus;

  @Column({ type: 'int', default: 0 })
  successfulRuns: number;

  @Column({ type: 'int', default: 0 })
  failedRuns: number;

  @Column({ type: 'int', default: 0 })
  consecutiveFailures: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  pauseReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isActive(): boolean {
    return this.status === ScheduleStatus.ACTIVE;
  }

  shouldRun(currentDate: Date): boolean {
    if (!this.isActive()) {
      return false;
    }

    if (this.endDate && currentDate > this.endDate) {
      return false;
    }

    return currentDate >= this.nextRunDate;
  }

  hasReachedMaxFailures(maxFailures = 3): boolean {
    return this.consecutiveFailures >= maxFailures;
  }

  getTotalRuns(): number {
    return this.successfulRuns + this.failedRuns;
  }

  getSuccessRate(): number {
    const total = this.getTotalRuns();
    if (total === 0) return 100;
    return (this.successfulRuns / total) * 100;
  }
}
