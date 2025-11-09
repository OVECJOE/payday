import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getSchedules } from '@/app/actions/schedules'
import { ScheduleCard, Schedule } from './schedule-card'

export const dynamic = 'force-dynamic'

export default async function SchedulesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const result = await getSchedules(searchParams.status)
  const schedules = result.success ? (result.data as Schedule[]) : []

  const tabs = [
    { label: 'All', value: undefined },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Completed', value: 'completed' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Schedules</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your recurring payment schedules
          </p>
        </div>
        <Link href="/dashboard/schedules/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create schedule</Button>
        </Link>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const isActive = searchParams.status === tab.value
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/dashboard/schedules?status=${tab.value}` : '/dashboard/schedules'}
              className={`px-4 py-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {schedules.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">No schedules found</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            {searchParams.status
              ? `You don't have any ${searchParams.status} schedules.`
              : 'Create your first payment schedule to start automating.'}
          </p>
          <Link href="/dashboard/schedules/new" className="inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Create your first schedule</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {schedules.map((schedule: Schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  )
}