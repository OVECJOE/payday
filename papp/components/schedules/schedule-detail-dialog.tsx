'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/format';
import type { Schedule } from '@/lib/types';

interface ScheduleDetailDialogProps {
  schedule: Schedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const dayOfWeekLabels: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export function ScheduleDetailDialog({
  schedule,
  open,
  onOpenChange,
}: ScheduleDetailDialogProps) {
  if (!schedule) return null;

  const getFrequencyDescription = () => {
    if (schedule.frequency === 'daily') {
      return 'Runs every day';
    }
    if (schedule.frequency === 'weekly' && schedule.dayOfWeek !== undefined) {
      return `Runs every ${dayOfWeekLabels[schedule.dayOfWeek]}`;
    }
    if (schedule.frequency === 'monthly' && schedule.dayOfMonth !== undefined) {
      return `Runs on day ${schedule.dayOfMonth} of every month`;
    }
    if (schedule.frequency === 'custom' && schedule.customIntervalDays !== undefined) {
      return `Runs every ${schedule.customIntervalDays} day${schedule.customIntervalDays > 1 ? 's' : ''}`;
    }
    return frequencyLabels[schedule.frequency] || schedule.frequency;
  };

  const timeString = `${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Details</DialogTitle>
          <DialogDescription>
            Complete information about this payment schedule
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Recipient</p>
              <p className="text-base font-semibold">
                {schedule.recipient?.name || 'Unknown'}
              </p>
              {schedule.recipient?.bankName && (
                <p className="text-sm text-muted-foreground">
                  {schedule.recipient.bankName}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(schedule.amount)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Frequency</p>
              <p className="text-base">{getFrequencyDescription()}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <p className="text-base">{timeString}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              <p className="text-base">
                {schedule.startDate && !isNaN(new Date(schedule.startDate).getTime())
                  ? format(new Date(schedule.startDate), 'MMM d, yyyy')
                  : 'Not set'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">End Date</p>
              <p className="text-base">
                {schedule.endDate && !isNaN(new Date(schedule.endDate).getTime())
                  ? format(new Date(schedule.endDate), 'MMM d, yyyy')
                  : 'No end date'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Next Run</p>
              <p className="text-base">
                {schedule.nextRunDate && !isNaN(new Date(schedule.nextRunDate).getTime())
                  ? format(new Date(schedule.nextRunDate), 'MMM d, yyyy HH:mm')
                  : 'Not scheduled'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last Run</p>
              <p className="text-base">
                {schedule.lastRunDate && !isNaN(new Date(schedule.lastRunDate).getTime())
                  ? format(new Date(schedule.lastRunDate), 'MMM d, yyyy HH:mm')
                  : 'Never'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  schedule.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : schedule.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : schedule.status === 'cancelled'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}
              >
                {statusLabels[schedule.status] || schedule.status}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <p className="text-base">
                {schedule.successfulRuns + schedule.failedRuns > 0
                  ? `${((schedule.successfulRuns / (schedule.successfulRuns + schedule.failedRuns)) * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Successful Runs</p>
              <p className="text-base font-semibold text-green-600 dark:text-green-400">
                {schedule.successfulRuns}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Failed Runs</p>
              <p className="text-base font-semibold text-red-600 dark:text-red-400">
                {schedule.failedRuns}
              </p>
            </div>
          </div>

          {schedule.description && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-base">{schedule.description}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="grid gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Schedule ID:</span>
                <span className="font-mono">{schedule.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Recipient ID:</span>
                <span className="font-mono">{schedule.recipientId}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
