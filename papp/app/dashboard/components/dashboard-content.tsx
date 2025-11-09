import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { getRecentTransactions, getActiveSchedules } from '@/app/actions/dashboard'

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

async function RecentTransactionsList() {
  const transactionsResult = await getRecentTransactions()
  const transactions = transactionsResult.success ? (transactionsResult.data as RecentTransactions[]) : []

  return (
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
  )
}

async function ActiveSchedulesList() {
  const schedulesResult = await getActiveSchedules()
  const schedules = schedulesResult.success ? (schedulesResult.data as ActiveSchedules[]) : []

  return (
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
  )
}

function RecentTransactionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        <Button variant="ghost" size="sm" disabled>
          View all
        </Button>
      </div>
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Loading...
      </div>
    </div>
  )
}

function ActiveSchedulesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Active Schedules</h2>
        <Button variant="ghost" size="sm" disabled>
          View all
        </Button>
      </div>
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Loading...
      </div>
    </div>
  )
}

export function DashboardContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <Suspense fallback={<RecentTransactionsSkeleton />}>
        <RecentTransactionsList />
      </Suspense>
      <Suspense fallback={<ActiveSchedulesSkeleton />}>
        <ActiveSchedulesList />
      </Suspense>
    </div>
  )
}

