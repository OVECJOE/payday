import { requireAuth } from '@/lib/auth';
import { getBalanceAction } from '@/app/actions/wallet';
import { getScheduleStatsAction } from '@/app/actions/schedules';
import { getTransactionsAction } from '@/app/actions/transactions';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

export const metadata = {
  title: 'Dashboard - Payday',
  description: 'Your Payday dashboard',
};

export default async function DashboardPage() {
  await requireAuth();
  
  const [balance, stats, transactions] = await Promise.all([
    getBalanceAction().catch(() => ({ total: 0, available: 0, locked: 0 })),
    getScheduleStatsAction().catch(() => ({ total: 0, active: 0, paused: 0, totalAmountScheduled: 0, successRate: 0 })),
    getTransactionsAction(5, 0).catch(() => ({ transactions: [], total: 0 })),
  ]);

  return (
    <DashboardOverview
      balance={balance}
      stats={stats}
      recentTransactions={transactions.transactions}
    />
  );
}

