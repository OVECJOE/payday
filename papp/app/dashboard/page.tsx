import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import {
  getWalletBalance,
  getScheduleStats,
  getRecentTransactions,
  getActiveSchedules,
} from '@/app/actions/dashboard'

interface WalletBalance {
  available: number
}

interface ScheduleStats {
  active: number
  totalAmountScheduled: number
  successRate: number
}

interface RecentTransactions {
  id: string
  recipient: {
    name: string
  }
  amount: number
  status: string
  createdAt: string
}

interface ActiveSchedules {
  id: string
  recipient: {
    name: string
  }
  amount: number
  frequency: string
  nextRunDate: string
}

export default async function DashboardPage() {
  const [balanceResult, statsResult, transactionsResult, schedulesResult] =
    await Promise.all([
      getWalletBalance(),
      getScheduleStats(),
      getRecentTransactions(),
      getActiveSchedules(),
    ])

  const balance = balanceResult.success ? (balanceResult.data as WalletBalance) : null
  const stats = statsResult.success ? (statsResult.data as ScheduleStats) : null
  const transactions = transactionsResult.success ? (transactionsResult.data as RecentTransactions[]) : []
  const schedules = schedulesResult.success ? (schedulesResult.data as ActiveSchedules[]) : []

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Your payment automation dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-6 space-y-2">
          <div className="text-sm text-muted-foreground">Available Balance</div>
          <div className="text-3xl font-bold">
            {balance ? formatCurrency(balance.available) : '—'}
          </div>
          <Link href="/dashboard/wallet">
            <Button variant="link" className="px-0 h-auto">
              Manage wallet →
            </Button>
          </Link>
        </div>

        <div className="border rounded-lg p-6 space-y-2">
          <div className="text-sm text-muted-foreground">Active Schedules</div>
          <div className="text-3xl font-bold">{stats?.active || 0}</div>
          <Link href="/dashboard/schedules">
            <Button variant="link" className="px-0 h-auto">
              View all →
            </Button>
          </Link>
        </div>

        <div className="border rounded-lg p-6 space-y-2">
          <div className="text-sm text-muted-foreground">Total Scheduled</div>
          <div className="text-3xl font-bold">
            {stats ? formatCurrency(stats.totalAmountScheduled) : '—'}
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-2">
          <div className="text-sm text-muted-foreground">Success Rate</div>
          <div className="text-3xl font-bold">
            {stats ? `${Math.round(stats.successRate)}%` : '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>

          <div className="border rounded-lg">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((transaction: RecentTransactions) => (
                  <div key={transaction.id} className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {transaction.recipient?.name || 'Payment'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatRelativeTime(transaction.createdAt)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className={`text-xs ${
                        transaction.status === 'success'
                          ? 'text-green-600'
                          : transaction.status === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Schedules</h2>
            <Link href="/dashboard/schedules">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>

          <div className="border rounded-lg">
            {schedules.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <p className="text-muted-foreground">
                  No active schedules yet
                </p>
                <Link href="/dashboard/schedules/new">
                  <Button>Create your first schedule</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {schedules.slice(0, 5).map((schedule: ActiveSchedules) => (
                  <div key={schedule.id} className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {schedule.recipient?.name}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {schedule.frequency} • Next: {new Date(schedule.nextRunDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(schedule.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {schedules.length === 0 && transactions.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
          <h3 className="text-lg font-semibold">Get started with Payday</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add recipients and create your first payment schedule to automate your recurring payments
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/recipients/new">
              <Button>Add recipient</Button>
            </Link>
            <Link href="/dashboard/schedules/new">
              <Button variant="outline">Create schedule</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
