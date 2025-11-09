'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSchedule } from '@/app/actions/schedules'
import { getRecipients } from '@/app/actions/recipients'
import { formatCurrency } from '@/lib/utils'

interface Recipient {
  id: string
  name: string
  bankName: string
}

interface CreateScheduleData {
  recipientId: string
  amount: number
  frequency: string
  startDate: string
  hour: number
  minute: number
  dayOfWeek?: number
  dayOfMonth?: number
  customIntervalDays?: number
  description?: string
}

export default function NewSchedulePage() {
  const router = useRouter()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [frequency, setFrequency] = useState('weekly')
  const [formData, setFormData] = useState({
    recipientId: '',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    hour: '9',
    minute: '0',
    dayOfWeek: '1',
    dayOfMonth: '1',
    customIntervalDays: '7',
    description: '',
  })

  useEffect(() => {
    async function loadRecipients() {
      const result = await getRecipients()
      if (result.success) {
        setRecipients(result.data as Recipient[])
      }
    }
    loadRecipients()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data: CreateScheduleData = {
      recipientId: formData.recipientId,
      amount: parseFloat(formData.amount),
      frequency,
      startDate: new Date(formData.startDate).toISOString(),
      hour: parseInt(formData.hour),
      minute: parseInt(formData.minute),
      description: formData.description || undefined,
    }

    if (frequency === 'weekly') {
      data.dayOfWeek = parseInt(formData.dayOfWeek)
    } else if (frequency === 'monthly') {
      data.dayOfMonth = parseInt(formData.dayOfMonth)
    } else if (frequency === 'custom') {
      data.customIntervalDays = parseInt(formData.customIntervalDays)
    }

    const result = await createSchedule(data)

    if (result.success) {
      router.push('/dashboard/schedules')
    } else {
      setError(result.error || 'Failed to create schedule')
      setLoading(false)
    }
  }

  if (recipients.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">No recipients yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            You need to add at least one recipient before creating a schedule.
          </p>
          <Link href="/dashboard/recipients/new" className="inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Add recipient first</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="space-y-2 mb-6 sm:mb-8">
        <Link href="/dashboard/schedules" className="text-sm text-muted-foreground hover:text-foreground inline-block">
          ← Back to schedules
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create schedule</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Set up a recurring payment schedule
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-4 p-4 sm:p-6 border rounded-lg">
          <h3 className="font-semibold text-base sm:text-lg">Payment details</h3>

          <div className="space-y-2">
            <Label htmlFor="recipientId">Recipient</Label>
            <Select
              value={formData.recipientId}
              onValueChange={(value) => setFormData({ ...formData, recipientId: value })}
              disabled={loading}
              required
            >
              <SelectTrigger id="recipientId" className="w-full">
                <SelectValue placeholder="Select a recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.name} ({recipient.bankName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              required
              disabled={loading}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="5000"
              min="100"
              step="0.01"
            />
            {formData.amount && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(parseFloat(formData.amount))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              disabled={loading}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Weekly allowance"
            />
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6 border rounded-lg">
          <h3 className="font-semibold text-base sm:text-lg">Schedule</h3>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={setFrequency}
              disabled={loading}
              required
            >
              <SelectTrigger id="frequency" className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom interval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of week</Label>
              <Select
                value={formData.dayOfWeek}
                onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                disabled={loading}
                required
              >
                <SelectTrigger id="dayOfWeek" className="w-full">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === 'monthly' && (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Day of month</Label>
              <Input
                id="dayOfMonth"
                type="number"
                required
                disabled={loading}
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                min="1"
                max="31"
              />
            </div>
          )}

          {frequency === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customIntervalDays">Every N days</Label>
              <Input
                id="customIntervalDays"
                type="number"
                required
                disabled={loading}
                value={formData.customIntervalDays}
                onChange={(e) => setFormData({ ...formData, customIntervalDays: e.target.value })}
                min="1"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hour">Hour (24h)</Label>
              <Input
                id="hour"
                type="number"
                required
                disabled={loading}
                value={formData.hour}
                onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                min="0"
                max="23"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minute">Minute</Label>
              <Input
                id="minute"
                type="number"
                required
                disabled={loading}
                value={formData.minute}
                onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                min="0"
                max="59"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              required
              disabled={loading}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? 'Creating...' : 'Create schedule'}
          </Button>
          <Link href="/dashboard/schedules" className="flex-1 sm:flex-none">
            <Button type="button" variant="outline" disabled={loading} className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
