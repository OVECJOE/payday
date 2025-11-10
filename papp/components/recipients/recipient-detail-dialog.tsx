'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Recipient } from '@/lib/types';

interface RecipientDetailDialogProps {
  recipient: Recipient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipientDetailDialog({
  recipient,
  open,
  onOpenChange,
}: RecipientDetailDialogProps) {
  if (!recipient) {
    return null;
  }

  const infoRows: Array<{ label: string; value: string | undefined }> = [
    { label: 'Account Number', value: recipient.accountNumber },
    { label: 'Bank Name', value: recipient.bankName },
    { label: 'Bank Code', value: recipient.bankCode },
    { label: 'Type', value: recipient.type },
    { label: 'Status', value: recipient.status },
    { label: 'Email', value: recipient.email },
    { label: 'Phone', value: recipient.phone },
    { label: 'Notes', value: recipient.notes },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{recipient.name}</DialogTitle>
          <DialogDescription>
            Detailed information about this payment recipient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verification</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  recipient.verified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {recipient.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {infoRows.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-right break-all">
                  {value && value.trim().length > 0 ? value : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
