import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

interface WalletOverviewProps {
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
}

export function WalletOverview({ balance, wallet }: WalletOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">View your wallet balance and details</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>All funds in your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balance.total)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Funds available for use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balance.available)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locked Balance</CardTitle>
            <CardDescription>Funds reserved for scheduled payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balance.locked)}</div>
          </CardContent>
        </Card>
      </div>

      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Details</CardTitle>
            <CardDescription>Additional wallet information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Currency:</span> {wallet.currency}
              </div>
              <div>
                <span className="text-muted-foreground">Wallet ID:</span>{' '}
                <span className="font-mono text-xs">{wallet.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

