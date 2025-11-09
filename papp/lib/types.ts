export interface Recipient {
  id: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  type: string;
  verified: boolean;
  status: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface Schedule {
  id: string;
  recipientId: string;
  amount: number;
  frequency: string;
  hour: number;
  minute: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  customIntervalDays?: number;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  lastRunDate?: string;
  status: string;
  successfulRuns: number;
  failedRuns: number;
  description?: string;
  recipient?: { name: string; bankName: string };
}

export interface Transaction {
  id: string;
  amount: number;
  fee: number;
  type: string;
  status: string;
  provider: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  recipient?: { name: string; bankName: string };
}

