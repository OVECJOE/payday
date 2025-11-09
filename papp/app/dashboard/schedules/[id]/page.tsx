import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSchedule } from '@/app/actions/schedules'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Schedule {
  id: string
  recipient: {
    name: string
    bankName: string
  }
  amount: number
  frequency: string
  nextRunDate: string
  status?: string
  description?: string
  successfulRuns: number
  failedRuns: number
  dayOfWeek: number
  dayOfMonth: number
  customIntervalDays: number
  hour: number
  minute: number
  startDate: Date
  endDate?: Date
  consecutiveFailures: number
  pauseReason?: string
  createdAt: Date
}

export default async function ScheduleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getSchedule(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const schedule = result.data as Schedule

  const frequencyDisplay = {
    daily: 'Every day',
    weekly: `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek || 0]}`,
    monthly: `Every month on the ${schedule.dayOfMonth}${getOrdinalSuffix(schedule.dayOfMonth || 1)}`,
    custom: `Every ${schedule.customIntervalDays} days`,
  }[schedule.frequency]

  const timeDisplay = `${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/schedules"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to schedules
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Details</h1>
        </div>
      </div>

      <div className="border rounded-lg p-8 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{schedule.recipient?.name}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[schedule.status as keyof typeof statusColors]}`}>
                {schedule.status}
              </span>
            </div>
            <p className="text-muted-foreground">{schedule.recipient?.bankName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatCurrency(schedule.amount)}</div>
            <div className="text-sm text-muted-foreground">per payment</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
          <div className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Frequency</div>
              <div className="text-lg font-medium">{frequencyDisplay}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Time</div>
              <div className="text-lg font-medium">{timeDisplay}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Start Date</div>
              <div className="text-lg">{new Date(schedule.startDate).toLocaleDateString()}</div>
            </div>

            {schedule.endDate && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">End Date</div>
                <div className="text-lg">{new Date(schedule.endDate).toLocaleDateString()}</div>
              </div>
            )}

            {schedule.status === 'active' && schedule.nextRunDate && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Next Payment</div>
                <div className="text-lg font-medium text-primary">
                  {formatDate(schedule.nextRunDate)}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Runs</div>
              <div className="text-lg">{schedule.successfulRuns + schedule.failedRuns}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Successful</div>
              <div className="text-lg text-green-600">{schedule.successfulRuns}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Failed</div>
              <div className="text-lg text-red-600">{schedule.failedRuns}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
              <div className="text-lg font-medium">
                {schedule.successfulRuns + schedule.failedRuns > 0
                  ? `${Math.round((schedule.successfulRuns / (schedule.successfulRuns + schedule.failedRuns)) * 100)}%`
                  : 'No runs yet'}
              </div>
            </div>

            {schedule.consecutiveFailures > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Consecutive Failures</div>
                <div className="text-lg text-red-600">{schedule.consecutiveFailures}</div>
              </div>
            )}
          </div>
        </div>

        {schedule.description && (
          <div className="pt-8 border-t">
            <div className="text-sm text-muted-foreground mb-2">Description</div>
            <div className="text-lg">{schedule.description}</div>
          </div>
        )}

        {schedule.pauseReason && (
          <div className="pt-8 border-t">
            <div className="text-sm text-muted-foreground mb-2">Pause Reason</div>
            <div className="text-lg">{schedule.pauseReason}</div>
          </div>
        )}

        <div className="pt-8 border-t">
          <div className="text-sm text-muted-foreground mb-1">Created</div>
          <div>{formatDate(schedule.createdAt)}</div>
        </div>
      </div>
    </div>
  )
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}
