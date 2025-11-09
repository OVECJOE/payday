'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createRecipientAction, getBanksAction, validateBankAccountAction } from '@/app/actions/recipients';
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
import type { Recipient } from '@/lib/types';

const recipientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits'),
  bankCode: z.string().min(1, 'Bank is required'),
  bankName: z.string().min(1, 'Bank is required'),
  type: z.enum(['individual', 'business']),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().optional(),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

interface CreateRecipientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (recipient: Recipient) => void;
}

export function CreateRecipientDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateRecipientDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([]);
  const [accountName, setAccountName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RecipientFormData>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      type: 'individual',
    },
  });

  const accountNumber = watch('accountNumber');
  const bankCode = watch('bankCode');

  useEffect(() => {
    if (open) {
      getBanksAction()
        .then(setBanks)
        .catch(() => {
          toast.error('Failed to load banks');
        });
    }
  }, [open]);

  useEffect(() => {
    if (accountNumber && bankCode && accountNumber.length >= 10) {
      const timeoutId = setTimeout(async () => {
        setIsValidating(true);
        try {
          const result = await validateBankAccountAction(accountNumber, bankCode);
          if (result.valid && result.accountName) {
            setAccountName(result.accountName);
            toast.success(`Account verified: ${result.accountName}`);
          } else {
            setAccountName(null);
            toast.error('Account validation failed');
          }
        } catch {
          setAccountName(null);
        } finally {
          setIsValidating(false);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
      setAccountName(null);
    }
  }, [accountNumber, bankCode]);

  const onSubmit = async (data: RecipientFormData) => {
    if (!accountName) {
      toast.error('Please validate the account number first');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('accountNumber', data.accountNumber);
    formData.append('bankCode', data.bankCode);
    formData.append('bankName', data.bankName);
    formData.append('type', data.type);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.notes) formData.append('notes', data.notes);

    const result = await createRecipientAction(formData);
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.data) {
      toast.success('Recipient created successfully');
      reset();
      setAccountName(null);
      onSuccess(result.data as Recipient);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Recipient</DialogTitle>
          <DialogDescription>
            Add a new payment recipient. The account will be validated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankCode">Bank</Label>
              <Select
                onValueChange={(value) => {
                  const bank = banks.find((b) => b.code === value);
                  setValue('bankCode', value);
                  setValue('bankName', bank?.name || '');
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankCode && (
                <p className="text-sm text-destructive">{errors.bankCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="0000000000"
                {...register('accountNumber')}
                disabled={isLoading || isValidating}
              />
              {isValidating && (
                <p className="text-sm text-muted-foreground">Validating account...</p>
              )}
              {accountName && (
                <p className="text-sm text-green-600">Account name: {accountName}</p>
              )}
              {errors.accountNumber && (
                <p className="text-sm text-destructive">{errors.accountNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                onValueChange={(value) => setValue('type', value as 'individual' | 'business')}
                defaultValue="individual"
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                {...register('email')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                {...register('phone')}
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
            <Button type="submit" disabled={isLoading || !accountName}>
              {isLoading ? 'Creating...' : 'Create Recipient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

