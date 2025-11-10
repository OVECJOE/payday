'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { FundWalletDialog } from './fund-wallet-dialog';
import { toast } from 'sonner';
import type { User } from '@/lib/auth';

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
  const [showDetails, setShowDetails] = useState(false);
  const searchParams = useSearchParams();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your payment wallet</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <Button onClick={() => setIsFundDialogOpen(true)}>Fund Wallet</Button>
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
    </div>
  );
}

