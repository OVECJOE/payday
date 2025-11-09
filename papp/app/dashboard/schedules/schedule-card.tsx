'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { pauseSchedule, resumeSchedule, cancelSchedule } from '@/app/actions/schedules'

export interface Schedule {
  id: string
  recipient: {
    name: string
  }
  amount: number
  frequency: string
  nextRunDate: string
  status: string
  description: string
  successfulRuns: number
  failedRuns: number
}

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePause() {
    setLoading(true)
    const result = await pauseSchedule(schedule.id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  async function handleResume() {
    setLoading(true)
    const result = await resumeSchedule(schedule.id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  async function handleCancel() {
    if (!confirm('Cancel this schedule? This cannot be undone.')) return
    
    setLoading(true)
    const result = await cancelSchedule(schedule.id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{schedule.recipient?.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[schedule.status as keyof typeof statusColors]}`}>
              {schedule.status}
            </span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(schedule.amount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground mb-1">Frequency</div>
          <div className="font-medium capitalize">{schedule.frequency}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Next payment</div>
          <div className="font-medium">
            {schedule.status === 'active' 
              ? new Date(schedule.nextRunDate).toLocaleDateString()
              : '—'}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Success rate</div>
          <div className="font-medium">
            {schedule.successfulRuns + schedule.failedRuns > 0
              ? `${Math.round((schedule.successfulRuns / (schedule.successfulRuns + schedule.failedRuns)) * 100)}%`
              : '—'}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Total runs</div>
          <div className="font-medium">{schedule.successfulRuns + schedule.failedRuns}</div>
        </div>
      </div>

      {schedule.description && (
        <p className="text-sm text-muted-foreground border-t pt-4">
          {schedule.description}
        </p>
      )}

      <div className="flex gap-2 pt-2 border-t">
        <Link href={`/dashboard/schedules/${schedule.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View details
          </Button>
        </Link>
        
        {schedule.status === 'active' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePause}
            disabled={loading}
          >
            Pause
          </Button>
        )}
        
        {schedule.status === 'paused' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResume}
              disabled={loading}
            >
              Resume
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
