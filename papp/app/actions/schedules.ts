'use server'

import { api } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function getSchedules(status?: string) {
  try {
    const schedules = await api.schedules.list(status)
    return { success: true, data: schedules }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getSchedule(id: string) {
  try {
    const schedule = await api.schedules.get(id)
    return { success: true, data: schedule }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function createSchedule(data: {
  recipientId: string
  amount: number
  frequency: string
  startDate: string
  endDate?: string
  hour: number
  minute: number
  dayOfWeek?: number
  dayOfMonth?: number
  customIntervalDays?: number
  description?: string
}) {
  try {
    const schedule = await api.schedules.create({
      ...data,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    
    revalidatePath('/dashboard/schedules')
    return { success: true, data: schedule }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function pauseSchedule(id: string, reason?: string) {
  try {
    const schedule = await api.schedules.pause(id, reason)
    revalidatePath('/dashboard/schedules')
    return { success: true, data: schedule }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function resumeSchedule(id: string) {
  try {
    const schedule = await api.schedules.resume(id)
    revalidatePath('/dashboard/schedules')
    return { success: true, data: schedule }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function cancelSchedule(id: string) {
  try {
    const schedule = await api.schedules.cancel(id)
    revalidatePath('/dashboard/schedules')
    return { success: true, data: schedule }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
