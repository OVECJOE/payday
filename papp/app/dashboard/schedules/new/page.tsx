import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getRecipientsAction } from '@/app/actions/recipients';
import { CreateScheduleForm } from '@/components/schedules/create-schedule-form';

export const metadata = {
  title: 'Create Schedule - Payday',
  description: 'Set up a new automated payment schedule',
};

export default async function NewSchedulePage() {
  await requireAuth('/dashboard/schedules/new');
  const recipients = await getRecipientsAction().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Schedule</h1>
          <p className="text-muted-foreground">
            Configure who gets paid, how much, and how often. You can review and adjust before saving.
          </p>
        </div>
        <Link className="text-sm text-primary hover:underline" href="/dashboard/schedules">
          Back to schedules
        </Link>
      </div>

      {recipients.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">No recipients yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You need at least one recipient before you can create a schedule.
          </p>
          <div className="mt-4">
            <Link href="/dashboard/recipients" className="text-sm text-primary hover:underline">
              Add recipients first
            </Link>
          </div>
        </div>
      ) : (
        <CreateScheduleForm recipients={recipients} />
      )}
    </div>
  );
}
