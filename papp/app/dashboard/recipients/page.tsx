import { requireAuth } from '@/lib/auth';
import { getRecipientsAction } from '@/app/actions/recipients';
import { RecipientsList } from '@/components/recipients/recipients-list';

export const metadata = {
  title: 'Recipients - Payday',
  description: 'Manage your payment recipients',
};

export default async function RecipientsPage() {
  await requireAuth('/dashboard/recipients');
  
  const recipients = await getRecipientsAction().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipients</h1>
          <p className="text-muted-foreground">Manage your payment recipients</p>
        </div>
      </div>
      <RecipientsList initialRecipients={recipients} />
    </div>
  );
}

