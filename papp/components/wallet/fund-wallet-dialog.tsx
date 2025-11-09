'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fundWalletAction } from '@/app/actions/wallet';
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
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';

const fundWalletSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return num > 0 && num >= 100;
  }, 'Amount must be at least ₦100'),
  email: z.string().email('Invalid email address'),
});

type FundWalletFormData = z.infer<typeof fundWalletSchema>;

interface FundWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
}

export function FundWalletDialog({
  open,
  onOpenChange,
  userEmail,
}: FundWalletDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FundWalletFormData>({
    resolver: zodResolver(fundWalletSchema),
    defaultValues: {
      email: userEmail || '',
    },
  });

  const onSubmit = async (data: FundWalletFormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('amount', data.amount);
    formData.append('email', data.email);

    const result = await fundWalletAction(formData);
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.data) {
      toast.success('Redirecting to payment...');
      window.location.href = result.data.authorizationUrl;
    }
  };

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Fund Wallet</DialogTitle>
          <DialogDescription>
            Add funds to your wallet using Paystack
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="100"
                placeholder="0.00"
                {...register('amount')}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const amountInput = document.getElementById('amount') as HTMLInputElement;
                      if (amountInput) {
                        amountInput.value = amount.toString();
                      }
                    }}
                    disabled={isLoading}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

