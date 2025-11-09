import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getWalletBalance, getScheduleStats } from '@/app/actions/dashboard'

interface WalletBalance {
  available: number
}

interface ScheduleStats {
  active: number
  totalAmountScheduled: number
  successRate: number
}

async function BalanceCard() {
  const balanceResult = await getWalletBalance()
  const balance = balanceResult.success ? (balanceResult.data as WalletBalance) : null

  return (
    <div className="border rounded-lg p-4 sm:p-6 space-y-2">
      <div className="text-xs sm:text-sm text-muted-foreground">Available Balance</div>
      <div className="text-2xl sm:text-3xl font-bold">
        {balance ? formatCurrency(balance.available) : '—'}
      </div>
      <Link href="/dashboard/wallet">
        <Button variant="link" className="px-0 h-auto text-xs sm:text-sm">
          Manage wallet →
        </Button>
      </Link>
    </div>
  )
}

async function StatsCards() {
  const statsResult = await getScheduleStats()
  const stats = statsResult.success ? (statsResult.data as ScheduleStats) : null

  return (
    <>
      <div className="border rounded-lg p-4 sm:p-6 space-y-2">
        <div className="text-xs sm:text-sm text-muted-foreground">Active Schedules</div>
        <div className="text-2xl sm:text-3xl font-bold">{stats?.active || 0}</div>
        <Link href="/dashboard/schedules">
          <Button variant="link" className="px-0 h-auto text-xs sm:text-sm">
            View all →
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg p-4 sm:p-6 space-y-2">
        <div className="text-xs sm:text-sm text-muted-foreground">Total Scheduled</div>
        <div className="text-2xl sm:text-3xl font-bold">
          {stats ? formatCurrency(stats.totalAmountScheduled) : '—'}
        </div>
      </div>

      <div className="border rounded-lg p-4 sm:p-6 space-y-2">
        <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
        <div className="text-2xl sm:text-3xl font-bold">
          {stats ? `${Math.round(stats.successRate)}%` : '—'}
        </div>
      </div>
    </>
  )
}

function StatsCardsSkeleton() {
  return (
    <>
      <div className="border rounded-lg p-4 sm:p-6 space-y-2">
        <div className="text-xs sm:text-sm text-muted-foreground">Active Schedules</div>
        <div className="text-2xl sm:text-3xl font-bold">—</div>
      </div>
      <div className="border rounded-lg p-4 sm:p-6 space-y-2">
        <div className="text-xs sm:text-sm text-muted-foreground">Total Scheduled</div>
        <div className="text-2xl sm:text-3xl font-bold">—</div>
      </div>
      <div className="border rounded-lg p-4 sm:p-6 space-y-2">
        <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
        <div className="text-2xl sm:text-3xl font-bold">—</div>
      </div>
    </>
  )
}

function BalanceCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 sm:p-6 space-y-2">
      <div className="text-xs sm:text-sm text-muted-foreground">Available Balance</div>
      <div className="text-2xl sm:text-3xl font-bold">—</div>
    </div>
  )
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Suspense fallback={<BalanceCardSkeleton />}>
        <BalanceCard />
      </Suspense>
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>
    </div>
  )
}

