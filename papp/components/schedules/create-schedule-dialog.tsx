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
import { Checkbox } from '@/components/ui/checkbox';
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
import type { Recipient } from '@/lib/types';

const scheduleSchema = z.object({
  recipientIds: z.array(z.string()).min(1, 'At least one recipient is required'),
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
}

export function CreateScheduleDialog({
  open,
  onOpenChange,
}: CreateScheduleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string>('daily');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      recipientIds: [],
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
    } else {
      setSelectedRecipients([]);
      reset();
    }
  }, [open, reset]);

  const toggleRecipient = (recipientId: string) => {
    const newSelection = selectedRecipients.includes(recipientId)
      ? selectedRecipients.filter((id) => id !== recipientId)
      : [...selectedRecipients, recipientId];
    setSelectedRecipients(newSelection);
    setValue('recipientIds', newSelection, { shouldValidate: true });
  };

  const selectAll = () => {
    const allIds = recipients.map((r) => r.id);
    setSelectedRecipients(allIds);
    setValue('recipientIds', allIds, { shouldValidate: true });
  };

  const deselectAll = () => {
    setSelectedRecipients([]);
    setValue('recipientIds', [], { shouldValidate: true });
  };

  const onSubmit = async (data: ScheduleFormData) => {
    if (data.recipientIds.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      await Promise.all(
        data.recipientIds.map(async (recipientId) => {
          const formData = new FormData();
          formData.append('recipientId', recipientId);
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
          if (result?.error) {
            errorCount++;
          } else {
            successCount++;
          }
        })
      );

      if (successCount > 0) {
        toast.success(
          `Successfully created ${successCount} schedule${successCount > 1 ? 's' : ''}${
            errorCount > 0 ? ` (${errorCount} failed)` : ''
          }`
        );
        reset();
        setSelectedRecipients([]);
        onOpenChange(false);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast.error('Failed to create schedules');
      }
    } catch {
      toast.error('An error occurred while creating schedules');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Payment Schedule</DialogTitle>
          <DialogDescription>
            Set up recurring payment schedules for one or more recipients
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Recipients</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    disabled={isLoading || recipients.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={deselectAll}
                    disabled={isLoading || selectedRecipients.length === 0}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                {recipients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recipients available. Please add recipients first.
                  </p>
                ) : (
                  recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`recipient-${recipient.id}`}
                        checked={selectedRecipients.includes(recipient.id)}
                        onCheckedChange={() => toggleRecipient(recipient.id)}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={`recipient-${recipient.id}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{recipient.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {recipient.bankName}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {recipient.accountNumber}
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
              {errors.recipientIds && (
                <p className="text-sm text-destructive">{errors.recipientIds.message}</p>
              )}
              {selectedRecipients.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedRecipients.length} recipient{selectedRecipients.length > 1 ? 's' : ''}{' '}
                  selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount per Recipient (NGN)</Label>
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
              {selectedRecipients.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  Total amount: {formatCurrency(parseFloat(watch('amount') || '0') * selectedRecipients.length)}
                </p>
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
            <Button type="submit" disabled={isLoading || selectedRecipients.length === 0}>
              {isLoading
                ? 'Creating...'
                : `Create ${selectedRecipients.length > 1 ? `${selectedRecipients.length} ` : ''}Schedule${selectedRecipients.length > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
