'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { pauseScheduleAction, resumeScheduleAction, cancelScheduleAction } from '@/app/actions/schedules';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';
import type { Schedule } from '@/lib/types';

interface ScheduleCardProps {
  schedule: Schedule;
  onUpdated: () => void;
}

export function ScheduleCard({ schedule, onUpdated }: ScheduleCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePause = async () => {
    setIsLoading(true);
    const result = await pauseScheduleAction(schedule.id);
    setIsLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Schedule paused');
      onUpdated();
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    const result = await resumeScheduleAction(schedule.id);
    setIsLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Schedule resumed');
      onUpdated();
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this schedule?')) {
      return;
    }
    setIsLoading(true);
    const result = await cancelScheduleAction(schedule.id);
    setIsLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Schedule cancelled');
      onUpdated();
    }
  };

  const frequencyLabels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    custom: 'Custom',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {schedule.recipient?.name || 'Recipient'}
            </CardTitle>
            <CardDescription>
              {formatCurrency(schedule.amount)} • {frequencyLabels[schedule.frequency] || schedule.frequency}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isLoading}>•••</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {schedule.status === 'active' ? (
                <DropdownMenuItem onClick={handlePause} disabled={isLoading}>
                  Pause
                </DropdownMenuItem>
              ) : schedule.status === 'paused' ? (
                <DropdownMenuItem onClick={handleResume} disabled={isLoading}>
                  Resume
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={handleCancel} disabled={isLoading}>
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Next run:</span>{' '}
            {schedule.nextRunDate && !isNaN(new Date(schedule.nextRunDate).getTime()) ? (
              format(new Date(schedule.nextRunDate), 'MMM d, yyyy HH:mm')
            ) : (
              <span className="text-muted-foreground">Not scheduled</span>
            )}
          </div>
          {schedule.lastRunDate && !isNaN(new Date(schedule.lastRunDate).getTime()) && (
            <div>
              <span className="text-muted-foreground">Last run:</span>{' '}
              {format(new Date(schedule.lastRunDate), 'MMM d, yyyy')}
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Success rate:</span>{' '}
            {schedule.successfulRuns + schedule.failedRuns > 0
              ? `${((schedule.successfulRuns / (schedule.successfulRuns + schedule.failedRuns)) * 100).toFixed(1)}%`
              : 'N/A'}
          </div>
          <div className="pt-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                schedule.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : schedule.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}
            >
              {schedule.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

