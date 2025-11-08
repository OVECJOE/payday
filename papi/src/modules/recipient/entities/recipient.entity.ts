import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum RecipientType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum RecipientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('recipients')
@Index(['userId', 'accountNumber', 'bankCode'], { unique: true })
export class Recipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.recipients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column()
  accountNumber: string;

  @Column()
  bankCode: string;

  @Column()
  bankName: string;

  @Column({
    type: 'enum',
    enum: RecipientType,
    default: RecipientType.INDIVIDUAL,
  })
  type: RecipientType;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({
    type: 'enum',
    enum: RecipientStatus,
    default: RecipientStatus.ACTIVE,
  })
  status: RecipientStatus;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isActive(): boolean {
    return this.status === RecipientStatus.ACTIVE && this.verified;
  }

  getDisplayName(): string {
    return `${this.name} (${this.bankName})`;
  }
}
