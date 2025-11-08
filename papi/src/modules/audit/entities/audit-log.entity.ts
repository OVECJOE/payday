import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  SCHEDULE_CREATED = 'schedule_created',
  SCHEDULE_PAUSED = 'schedule_paused',
  SCHEDULE_RESUMED = 'schedule_resumed',
  SCHEDULE_CANCELLED = 'schedule_cancelled',
}

export enum ResourceType {
  USER = 'user',
  RECIPIENT = 'recipient',
  SCHEDULE = 'schedule',
  TRANSACTION = 'transaction',
  WALLET = 'wallet',
}

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['resourceType', 'resourceId'])
@Index(['action', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: ResourceType })
  resourceType: ResourceType;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
