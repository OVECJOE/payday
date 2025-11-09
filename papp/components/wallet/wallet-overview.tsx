import { requireAuth } from '@/lib/auth';
import { WalletOverviewClient } from './wallet-overview-client';

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

function formatCardNumber(id: string): string {
  const cleaned = id.replace(/-/g, '').slice(0, 16);
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

export async function WalletOverview({ balance, wallet }: WalletOverviewProps) {
  const { user } = await requireAuth();
  const cardNumber = wallet ? formatCardNumber(wallet.id) : '0000 0000 0000 0000';
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 5);
  const formattedExpiry = `${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${String(expiryDate.getFullYear()).slice(-2)}`;

  return (
    <WalletOverviewClient
      balance={balance}
      wallet={wallet}
      user={user}
      cardNumber={cardNumber}
      formattedExpiry={formattedExpiry}
    />
  );
}
