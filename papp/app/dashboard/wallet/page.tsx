import { requireAuth } from '@/lib/auth';
import { getBalanceAction, getWalletAction } from '@/app/actions/wallet';
import { WalletOverview } from '@/components/wallet/wallet-overview';

export const metadata = {
  title: 'Wallet - Payday',
  description: 'View your wallet balance and details',
};

export default async function WalletPage() {
  await requireAuth('/dashboard/wallet');
  
  const [balance, wallet] = await Promise.all([
    getBalanceAction().catch(() => ({ total: 0, available: 0, locked: 0 })),
    getWalletAction().catch(() => null),
  ]);

  return <WalletOverview balance={balance} wallet={wallet} />;
}

