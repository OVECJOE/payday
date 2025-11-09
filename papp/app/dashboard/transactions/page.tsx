import { requireAuth } from '@/lib/auth';
import { getTransactionsAction } from '@/app/actions/transactions';
import { TransactionsList } from '@/components/transactions/transactions-list';

export const metadata = {
  title: 'Transactions - Payday',
  description: 'View your transaction history',
};

export default async function TransactionsPage() {
  await requireAuth();
  
  const transactionsData = await getTransactionsAction(50, 0).catch(() => ({
    transactions: [],
    total: 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View your payment transaction history</p>
      </div>
      <TransactionsList initialTransactions={transactionsData.transactions} total={transactionsData.total} />
    </div>
  );
}

