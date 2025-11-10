'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  createScheduleAction,
  estimateScheduleFeeAction,
} from '@/app/actions/schedules';
import type { Recipient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { XIcon, UsersIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/format';

const scheduleSchema = z.object({
  recipientIds: z.array(z.string()).min(1, 'Select at least one recipient'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => Number(val) > 0, 'Amount must be greater than 0'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  hour: z.string().refine((val) => {
    const num = Number(val);
    return Number.isInteger(num) && num >= 0 && num <= 23;
  }, 'Hour must be between 0 and 23'),
  minute: z.string().refine((val) => {
    const num = Number(val);
    return Number.isInteger(num) && num >= 0 && num <= 59;
  }, 'Minute must be between 0 and 59'),
  dayOfWeek: z.string().optional(),
  dayOfMonth: z.string().optional(),
  customIntervalDays: z.string().optional(),
  description: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface CreateScheduleFormProps {
  recipients: Recipient[];
}

export function CreateScheduleForm({ recipients }: CreateScheduleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFeePending, startFeeTransition] = useTransition();
  const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [feeEstimate, setFeeEstimate] = useState<{
    provider: string;
    providerFee: number;
    platformFee: number;
    totalFee: number;
  } | null>(null);
  const [feeError, setFeeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      recipientIds: [],
      amount: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().slice(0, 16),
      hour: '9',
      minute: '0',
    },
  });

  const frequency = watch('frequency');
  const amountValue = Number(watch('amount') || 0);
  const recipientCount = selectedRecipientIds.length;

  const filteredRecipients = useMemo(() => {
    if (!searchTerm.trim()) return recipients;
    return recipients.filter((recipient) => {
      const query = searchTerm.toLowerCase();
      return (
        recipient.name.toLowerCase().includes(query) ||
        recipient.accountNumber.toLowerCase().includes(query) ||
        recipient.bankName.toLowerCase().includes(query) ||
        recipient.email?.toLowerCase().includes(query) ||
        recipient.phone?.toLowerCase().includes(query)
      );
    });
  }, [recipients, searchTerm]);

  const providerFeePerRecipient = feeEstimate?.providerFee ?? 0;
  const platformFeePerRecipient = feeEstimate?.platformFee ?? 0;
  const providerFeeTotal = providerFeePerRecipient * recipientCount;
  const platformFeeTotal = platformFeePerRecipient * recipientCount;
  const totalFeeAllRecipients = providerFeeTotal + platformFeeTotal;
  const totalBaseAmount = amountValue * recipientCount;
  const totalAmountPerRun = totalBaseAmount + totalFeeAllRecipients;
  const providerLabel = feeEstimate
    ? `${feeEstimate.provider.charAt(0).toUpperCase()}${feeEstimate.provider.slice(
        1,
      )}`
    : null;

  useEffect(() => {
    if (!amountValue || amountValue <= 0) {
      setFeeEstimate(null);
      setFeeError(null);
      return;
    }

    startFeeTransition(async () => {
      try {
        const result = await estimateScheduleFeeAction(amountValue);
        if (result) {
          setFeeEstimate(result);
          setFeeError(null);
        } else {
          setFeeEstimate(null);
        }
      } catch (error) {
        console.error(error);
        setFeeEstimate(null);
        setFeeError('Unable to estimate fees right now. Please try again.');
      }
    });
  }, [amountValue]);

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipientIds((prev) => {
      const next = prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId];
      setValue('recipientIds', next, { shouldValidate: true });
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = recipients.map((recipient) => recipient.id);
    setSelectedRecipientIds(allIds);
    setValue('recipientIds', allIds, { shouldValidate: true });
  };

  const handleClearSelection = () => {
    setSelectedRecipientIds([]);
    setValue('recipientIds', [], { shouldValidate: true });
  };

  const onSubmit = (values: ScheduleFormValues) => {
    startTransition(async () => {
      const { recipientIds, ...rest } = values;
      const results = await Promise.all(
        recipientIds.map(async (recipientId) => {
          const formData = new FormData();
          formData.append('recipientId', recipientId);
          formData.append('amount', rest.amount);
          formData.append('frequency', rest.frequency);
          formData.append('startDate', rest.startDate);
          if (rest.endDate) formData.append('endDate', rest.endDate);
          formData.append('hour', rest.hour);
          formData.append('minute', rest.minute);
          if (rest.dayOfWeek) formData.append('dayOfWeek', rest.dayOfWeek);
          if (rest.dayOfMonth) formData.append('dayOfMonth', rest.dayOfMonth);
          if (rest.customIntervalDays) {
            formData.append('customIntervalDays', rest.customIntervalDays);
          }
          if (rest.description) formData.append('description', rest.description);

          return createScheduleAction(formData);
        }),
      );

      const successCount = results.filter((result) => result?.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          `Created ${successCount} schedule${successCount > 1 ? 's' : ''}${
            failureCount > 0 ? ` (${failureCount} failed)` : ''
          }`,
        );
        reset();
        handleClearSelection();
        router.push('/dashboard/schedules');
        router.refresh();
      } else {
        toast.error('Failed to create schedules. Please try again.');
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <section className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Recipients</h2>
            <p className="text-sm text-muted-foreground">
              Choose one or more recipients. You can search by name, account number, bank, email, or phone.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            <UsersIcon className="mr-1 size-3.5" />
            {recipientCount}
          </Badge>
        </div>

        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-between',
            recipientCount === 0 && 'text-muted-foreground',
          )}
          onClick={() => setIsRecipientDialogOpen(true)}
        >
          {recipientCount === 0
            ? 'Select recipients'
            : `${recipientCount} recipient${recipientCount > 1 ? 's' : ''} selected`}
        </Button>
        <Dialog open={isRecipientDialogOpen} onOpenChange={setIsRecipientDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Select recipients</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search by name, account number, bank, email or phone..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <div className="max-h-96 space-y-1 overflow-y-auto rounded-md border">
                {filteredRecipients.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No recipients found.</p>
                ) : (
                  filteredRecipients.map((recipient) => {
                    const isSelected = selectedRecipientIds.includes(recipient.id);
                    return (
                      <button
                        key={recipient.id}
                        type="button"
                        onClick={() => toggleRecipient(recipient.id)}
                        className={cn(
                          'flex w-full items-start gap-3 border-b px-4 py-3 text-left text-sm transition hover:bg-muted',
                          isSelected && 'bg-muted/80',
                        )}
                      >
                        <Checkbox checked={isSelected} className="mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{recipient.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto text-right">
                              {recipient.bankName}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {recipient.accountNumber}
                            {recipient.email ? ` • ${recipient.email}` : ''}
                            {recipient.phone ? ` • ${recipient.phone}` : ''}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <DialogFooter className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSelectAll}
                  disabled={recipients.length === 0}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearSelection}
                  disabled={recipientCount === 0}
                >
                  Clear selection
                </Button>
              </div>
              <Button type="button" onClick={() => setIsRecipientDialogOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {errors.recipientIds && (
          <p className="text-sm text-destructive">{errors.recipientIds.message}</p>
        )}

        {recipientCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedRecipientIds.map((recipientId) => {
              const recipient = recipients.find((r) => r.id === recipientId);
              if (!recipient) return null;
              return (
                <Badge
                  key={recipientId}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {recipient.name}
                  <button
                    type="button"
                    onClick={() => toggleRecipient(recipientId)}
                    className="rounded-full p-0.5 hover:bg-secondary-foreground/10"
                    aria-label={`Remove ${recipient.name}`}
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-lg border p-6">
        <div>
          <h2 className="text-lg font-semibold">Payment details</h2>
          <p className="text-sm text-muted-foreground">
            Set how much you want to send to each recipient every cycle.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount per recipient (NGN)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              defaultValue="monthly"
              onValueChange={(value) => {
                setValue('frequency', value as ScheduleFormValues['frequency'], {
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom interval</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">First run</Label>
            <Input id="startDate" type="datetime-local" {...register('startDate')} />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End date (optional)</Label>
            <Input id="endDate" type="datetime-local" {...register('endDate')} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hour">Preferred hour (0 - 23)</Label>
            <Input id="hour" type="number" min="0" max="23" {...register('hour')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minute">Preferred minute (0 - 59)</Label>
            <Input id="minute" type="number" min="0" max="59" {...register('minute')} />
          </div>
        </div>

        {frequency === 'weekly' && (
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Day of the week (0 = Sunday, 6 = Saturday)</Label>
            <Input id="dayOfWeek" type="number" min="0" max="6" {...register('dayOfWeek')} />
          </div>
        )}

        {frequency === 'monthly' && (
          <div className="space-y-2">
            <Label htmlFor="dayOfMonth">Day of the month (1 - 31)</Label>
            <Input id="dayOfMonth" type="number" min="1" max="31" {...register('dayOfMonth')} />
          </div>
        )}

        {frequency === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="customIntervalDays">Custom interval (days)</Label>
            <Input id="customIntervalDays" type="number" min="1" {...register('customIntervalDays')} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <textarea
            id="description"
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="e.g. Payroll for the core engineering team"
            {...register('description')}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Fee breakdown</h3>
          <p className="text-sm text-muted-foreground">
            Fees come directly from {providerLabel ?? 'our provider'} plus Payday&apos;s 0.3% service fee (capped at ₦50 per recipient). Figures refresh automatically as you adjust the amount.
          </p>
          <div className="rounded-md border bg-muted/30">
            <dl className="divide-y text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <dt>Recipients selected</dt>
                <dd className="font-medium">{recipientCount}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt>Base amount per run</dt>
                <dd className="font-medium">
                  {formatCurrency(totalBaseAmount || 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt>
                  {feeEstimate
                    ? `${providerLabel} fee per run`
                    : 'Provider fee per run'}
                </dt>
                <dd className="font-medium">
                  {isFeePending
                    ? 'Calculating…'
                    : formatCurrency(providerFeeTotal || 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt>Payday service fee per run</dt>
                <dd className="font-medium">
                  {isFeePending
                    ? 'Calculating…'
                    : formatCurrency(platformFeeTotal || 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt>Total fees per run</dt>
                <dd className="font-medium">
                  {isFeePending
                    ? 'Calculating…'
                    : formatCurrency(totalFeeAllRecipients || 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 font-semibold">
                <dt>Total cost per run</dt>
                <dd>
                  {isFeePending
                    ? 'Calculating…'
                    : formatCurrency(totalAmountPerRun || 0)}
                </dd>
              </div>
            </dl>
          </div>
          {feeError && (
            <p className="text-sm text-destructive">{feeError}</p>
          )}
        </div>

        <div className="space-y-3 rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Schedule checklist</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Ensure your wallet has at least{' '}
              <span className="font-medium">
                {isFeePending
                  ? 'Calculating…'
                  : formatCurrency(totalAmountPerRun || 0)}
              </span>{' '}
              before each run.
            </li>
            <li>• Funds move automatically at the start time you selected.</li>
            <li>• You can pause or cancel a schedule at any time.</li>
          </ul>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset();
            handleClearSelection();
          }}
          disabled={isPending}
        >
          Reset form
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? 'Creating schedules...'
            : recipientCount > 1
            ? `Create ${recipientCount} schedules`
            : 'Create schedule'}
        </Button>
      </div>
    </form>
  );
}
