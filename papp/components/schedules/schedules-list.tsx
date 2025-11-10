'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduleCard } from './schedule-card';
import { ScheduleDetailDialog } from './schedule-detail-dialog';
import { getScheduleAction } from '@/app/actions/schedules';
import type { Schedule } from '@/lib/types';

interface SchedulesListProps {
  initialSchedules: Schedule[];
}

export function SchedulesList({ initialSchedules }: SchedulesListProps) {
  const [schedules] = useState(initialSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleScheduleUpdated = () => {
    window.location.reload();
  };

  const handleViewDetails = async (schedule: Schedule) => {
    setIsLoadingDetails(true);
    try {
      const fullSchedule = await getScheduleAction(schedule.id);
      setSelectedSchedule(fullSchedule as Schedule);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Failed to load schedule details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button asChild>
          <Link href="/dashboard/schedules/new">Create Schedule</Link>
        </Button>
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
            <Button asChild>
              <Link href="/dashboard/schedules/new">Create Schedule</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onUpdated={handleScheduleUpdated}
              onViewDetails={isLoadingDetails ? () => {} : handleViewDetails}
            />
          ))}
        </div>
      )}

      <ScheduleDetailDialog
        schedule={selectedSchedule}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </>
  );
}

