import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

interface DashboardOverviewProps {
  balance: {
    total: number;
    available: number;
    locked: number;
  };
  stats: {
    total: number;
    active: number;
    paused: number;
    totalAmountScheduled: number;
    successRate: number;
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    status: string;
    type: string;
    createdAt: string;
    recipient?: { name: string; bankName: string };
  }>;
}

export function DashboardOverview({ balance, stats, recentTransactions }: DashboardOverviewProps) {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your overview.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/wallet" className="block">
          <Card className="h-full cursor-pointer transition hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance.available)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(balance.locked)} locked
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/schedules" className="block">
          <Card className="h-full cursor-pointer transition hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total} total schedules
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/schedules" className="block">
          <Card className="h-full cursor-pointer transition hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmountScheduled)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.successRate.toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/wallet" className="block">
          <Card className="h-full cursor-pointer transition hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance.total)}</div>
              <p className="text-xs text-muted-foreground">
                All funds
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest payment activity</CardDescription>
              </div>
              <Link
                href="/dashboard/transactions"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <Link
                    key={transaction.id}
                    href={`/dashboard/transactions/${transaction.id}`}
                    className="flex items-center justify-between rounded-md border p-4 transition hover:bg-muted/60"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {transaction.recipient?.name || 'Payment'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p
                        className={`text-xs ${transaction.status === 'success'
                            ? 'text-green-600'
                            : transaction.status === 'failed'
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}
                      >
                        {transaction.status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/dashboard/schedules" className="block">
          <Card className="h-max cursor-pointer transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Schedule Status</CardTitle>
              <CardDescription>Overview of your payment schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="text-sm font-medium">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Paused</span>
                  <span className="text-sm font-medium">{stats.paused}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-sm font-medium">{stats.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

