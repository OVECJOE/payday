'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateScheduleDialog } from './create-schedule-dialog';
import { ScheduleCard } from './schedule-card';
import type { Schedule } from '@/lib/types';

interface SchedulesListProps {
  initialSchedules: Schedule[];
}

export function SchedulesList({ initialSchedules }: SchedulesListProps) {
  const [schedules] = useState(initialSchedules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleScheduleUpdated = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>Create Schedule</Button>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No schedules</CardTitle>
            <CardDescription>
              Create your first recurring payment schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsDialogOpen(true)}>Create Schedule</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onUpdated={handleScheduleUpdated}
            />
          ))}
        </div>
      )}

      <CreateScheduleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

