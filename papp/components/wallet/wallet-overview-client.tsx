'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { FundWalletDialog } from './fund-wallet-dialog';
import { toast } from 'sonner';
import type { User } from '@/lib/auth';
import { EyeIcon, EyeOffIcon, PlusIcon, LockIcon, UnlockIcon, WalletIcon } from 'lucide-react';
import {
  lockFundsAction,
  unlockFundsAction,
  withdrawFundsAction,
} from '@/app/actions/wallet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface WalletOverviewClientProps {
  balance: {
    total: number;
    available: number;
    locked: number;
  };
  wallet: {
    id: string;
    userId: string;
    balance: number;
    lockedBalance: number;
    currency: string;
  } | null;
  user: User;
  cardNumber: string;
  formattedExpiry: string;
}

export function WalletOverviewClient({
  balance,
  wallet,
  user,
  cardNumber,
  formattedExpiry,
}: WalletOverviewClientProps) {
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [lockAmount, setLockAmount] = useState('');
  const [unlockAmount, setUnlockAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();

  const availablePercentage =
    balance.total > 0 ? (balance.available / balance.total) * 100 : 0;

  const maskedCurrency = (value: number) =>
    showDetails ? formatCurrency(value) : '••••••';

  const displayCardNumber = showDetails ? cardNumber : '•••• •••• •••• ••••';
  const displayCardholder = showDetails
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`.slice(0, 20)
      : user.email?.split('@')[0].toUpperCase().slice(0, 20) || 'CARDHOLDER'
    : '••••••••';
  const displayExpiry = showDetails ? formattedExpiry : '••/••';

  useEffect(() => {
    if (searchParams.get('funding') === 'success') {
      toast.success('Wallet funded successfully!');
      window.history.replaceState({}, '', '/dashboard/wallet');
    }
  }, [searchParams]);

  const handleAction = (
    action: (formData: FormData) => Promise<{ success?: boolean; error?: string } | undefined>,
    amount: string,
    onSuccess: () => void,
  ) => {
    if (!amount.trim()) {
      toast.error('Enter an amount to proceed');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('amount', amount);
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      onSuccess();
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your payment wallet</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? (
              <>
                <EyeOffIcon className="mr-2 size-4" />
                Hide Details
              </>
            ) : (
              <>
                <EyeIcon className="mr-2 size-4" />
                Show Details
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLockDialogOpen(true)}
          >
            <LockIcon className="mr-2 size-4" />
            Lock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUnlockDialogOpen(true)}
            disabled={balance.locked <= 0}
          >
            <UnlockIcon className="mr-2 size-4" />
            Unlock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWithdrawDialogOpen(true)}
            disabled={balance.available <= 0}
          >
            <WalletIcon className="mr-2 size-4" />
            Withdraw
          </Button>
          <Button size="sm" onClick={() => setIsFundDialogOpen(true)}>
            Fund Wallet
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl" />
            <CardContent className="p-8 relative z-10">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-90">Payday</div>
                  <div className="text-sm font-medium opacity-90">{wallet?.currency || 'NGN'}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm opacity-75">Card Number</div>
                  <div className="text-2xl font-mono tracking-wider font-semibold">
                    {displayCardNumber}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="text-xs opacity-75">Cardholder Name</div>
                    <div className="text-lg font-semibold uppercase">
                      {displayCardholder}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs opacity-75">Expires</div>
                    <div className="text-lg font-semibold">{displayExpiry}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="text-sm opacity-75 mb-2">Available Balance</div>
                  <div className="text-4xl font-bold">
                    {maskedCurrency(balance.available)}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 flex md:hidden items-center p-2 bg-muted/50 rounded-b-lg">
              <Button variant="ghost" size="icon-sm" onClick={() => setIsFundDialogOpen(true)}>
                <PlusIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowDetails((prev) => !prev)}
                className="block md:hidden"
              >
                {showDetails ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total Balance</div>
                  <div className="text-2xl font-bold">
                    {maskedCurrency(balance.total)}
                  </div>
                  <div className="text-xs text-muted-foreground">All funds</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Locked Balance</div>
                  <div className="text-2xl font-bold">
                    {maskedCurrency(balance.locked)}
                  </div>
                  <div className="text-xs text-muted-foreground">Reserved for schedules</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available Funds</span>
                  <span className="font-semibold">
                    {maskedCurrency(balance.available)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: showDetails ? `${availablePercentage}%` : '0%',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Locked: {maskedCurrency(balance.locked)}
                  </span>
                  <span className="text-muted-foreground">
                    {showDetails
                      ? balance.total > 0
                        ? `${availablePercentage.toFixed(1)}% available`
                        : '0% available'
                      : '••% available'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Wallet Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium">{wallet?.currency || 'NGN'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-medium">Payment Wallet</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FundWalletDialog
        open={isFundDialogOpen}
        onOpenChange={setIsFundDialogOpen}
        userEmail={user.email}
      />

      <AmountDialog
        title="Lock Funds"
        description="Reserve a portion of your available balance for upcoming schedules."
        confirmLabel="Lock Funds"
        amount={lockAmount}
        setAmount={setLockAmount}
        open={isLockDialogOpen}
        onOpenChange={setIsLockDialogOpen}
        isPending={isPending}
        onSubmit={() =>
          handleAction(lockFundsAction, lockAmount, () => {
            toast.success('Funds locked successfully');
            setIsLockDialogOpen(false);
            setLockAmount('');
          })
        }
      />

      <AmountDialog
        title="Unlock Funds"
        description="Release previously locked funds back into your available balance."
        confirmLabel="Unlock Funds"
        amount={unlockAmount}
        setAmount={setUnlockAmount}
        open={isUnlockDialogOpen}
        onOpenChange={setIsUnlockDialogOpen}
        isPending={isPending}
        onSubmit={() =>
          handleAction(unlockFundsAction, unlockAmount, () => {
            toast.success('Funds unlocked successfully');
            setIsUnlockDialogOpen(false);
            setUnlockAmount('');
          })
        }
      />

      <AmountDialog
        title="Withdraw Funds"
        description="Move funds out of your available balance."
        confirmLabel="Withdraw"
        amount={withdrawAmount}
        setAmount={setWithdrawAmount}
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
        isPending={isPending}
        onSubmit={() =>
          handleAction(withdrawFundsAction, withdrawAmount, () => {
            toast.success('Funds withdrawn successfully');
            setIsWithdrawDialogOpen(false);
            setWithdrawAmount('');
          })
        }
      />
    </div>
  );
}

interface AmountDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  amount: string;
  setAmount: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isPending: boolean;
}

function AmountDialog({
  title,
  description,
  confirmLabel,
  amount,
  setAmount,
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AmountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`${title}-amount`}>Amount (NGN)</Label>
            <Input
              id={`${title}-amount`}
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending || !amount.trim()}>
            {isPending ? 'Processing…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

