import { requireAuth } from '@/lib/auth';
import { getSchedulesAction } from '@/app/actions/schedules';
import { SchedulesList } from '@/components/schedules/schedules-list';

export const metadata = {
  title: 'Schedules - Payday',
  description: 'Manage your payment schedules',
};

export default async function SchedulesPage() {
  await requireAuth();
  
  const schedules = await getSchedulesAction().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground">Manage your recurring payment schedules</p>
        </div>
      </div>
      <SchedulesList initialSchedules={schedules} />
    </div>
  );
}

