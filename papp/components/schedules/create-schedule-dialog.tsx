'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createScheduleAction } from '@/app/actions/schedules';
import { getRecipientsAction } from '@/app/actions/recipients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Schedule } from '@/lib/types';
import type { Recipient } from '@/lib/types';

const scheduleSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  amount: z.string().refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  hour: z.string().refine((val) => {
    const num = parseInt(val, 10);
    return num >= 0 && num <= 23;
  }, 'Hour must be between 0 and 23'),
  minute: z.string().refine((val) => {
    const num = parseInt(val, 10);
    return num >= 0 && num <= 59;
  }, 'Minute must be between 0 and 59'),
  dayOfWeek: z.string().optional(),
  dayOfMonth: z.string().optional(),
  customIntervalDays: z.string().optional(),
  description: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (schedule: Schedule) => void;
}

export function CreateScheduleDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateScheduleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [frequency, setFrequency] = useState<string>('daily');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      frequency: 'daily',
      hour: '9',
      minute: '0',
    },
  });

  useEffect(() => {
    if (open) {
      getRecipientsAction()
        .then(setRecipients)
        .catch(() => {
          toast.error('Failed to load recipients');
        });
    }
  }, [open]);

  const onSubmit = async (data: ScheduleFormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('recipientId', data.recipientId);
    formData.append('amount', data.amount);
    formData.append('frequency', data.frequency);
    formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    formData.append('hour', data.hour);
    formData.append('minute', data.minute);
    if (data.dayOfWeek) formData.append('dayOfWeek', data.dayOfWeek);
    if (data.dayOfMonth) formData.append('dayOfMonth', data.dayOfMonth);
    if (data.customIntervalDays) formData.append('customIntervalDays', data.customIntervalDays);
    if (data.description) formData.append('description', data.description);

    const result = await createScheduleAction(formData);
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.data) {
      toast.success('Schedule created successfully');
      reset();
      onSuccess(result.data as Schedule);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
          <DialogDescription>
            Set up a new recurring payment schedule
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient</Label>
              <Select
                onValueChange={(value) => setValue('recipientId', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.name} ({recipient.bankName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.recipientId && (
                <p className="text-sm text-destructive">{errors.recipientId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                onValueChange={(value) => {
                  setFrequency(value);
                  setValue('frequency', value as 'daily' | 'weekly' | 'monthly' | 'custom');
                }}
                defaultValue="daily"
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === 'weekly' && (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week (0=Sunday, 6=Saturday)</Label>
                <Input
                  id="dayOfWeek"
                  type="number"
                  min="0"
                  max="6"
                  {...register('dayOfWeek')}
                  disabled={isLoading}
                />
              </div>
            )}

            {frequency === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">Day of Month (1-31)</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  {...register('dayOfMonth')}
                  disabled={isLoading}
                />
              </div>
            )}

            {frequency === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customIntervalDays">Interval (days)</Label>
                <Input
                  id="customIntervalDays"
                  type="number"
                  min="1"
                  {...register('customIntervalDays')}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hour">Hour (0-23)</Label>
                <Input
                  id="hour"
                  type="number"
                  min="0"
                  max="23"
                  {...register('hour')}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minute">Minute (0-59)</Label>
                <Input
                  id="minute"
                  type="number"
                  min="0"
                  max="59"
                  {...register('minute')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register('startDate')}
                disabled={isLoading}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (optional)</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register('endDate')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Payment description"
                {...register('description')}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

