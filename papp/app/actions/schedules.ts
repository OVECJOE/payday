'use server';

import { api } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { handleServerActionError } from '@/lib/server-action-error-handler';

export async function getSchedulesAction(status?: string) {
  try {
    const { token } = await requireAuth();
    return await api.schedules.list(token, status);
  } catch (error) {
    await handleServerActionError(error, '/dashboard/schedules');
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch schedules');
  }
}

export async function getScheduleAction(id: string) {
  try {
    const { token } = await requireAuth();
    return await api.schedules.get(id, token);
  } catch (error) {
    await handleServerActionError(error, '/dashboard/schedules');
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch schedule');
  }
}

export async function createScheduleAction(formData: FormData) {
  try {
    const { token } = await requireAuth();
    
    const schedule = await api.schedules.create({
      recipientId: formData.get('recipientId') as string,
      amount: parseFloat(formData.get('amount') as string),
      frequency: formData.get('frequency') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || undefined,
      hour: parseInt(formData.get('hour') as string, 10),
      minute: parseInt(formData.get('minute') as string, 10),
      dayOfWeek: formData.get('dayOfWeek') ? parseInt(formData.get('dayOfWeek') as string, 10) : undefined,
      dayOfMonth: formData.get('dayOfMonth') ? parseInt(formData.get('dayOfMonth') as string, 10) : undefined,
      customIntervalDays: formData.get('customIntervalDays') ? parseInt(formData.get('customIntervalDays') as string, 10) : undefined,
      description: formData.get('description') as string || undefined,
      userTimezone: formData.get('userTimezone') as string || undefined,
    }, token);

    revalidatePath('/dashboard/schedules');
    return { success: true, data: schedule };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create schedule' };
  }
}

export async function updateScheduleAction(id: string, formData: FormData) {
  try {
    const { token } = await requireAuth();
    
    const schedule = await api.schedules.update(id, {
      amount: formData.get('amount') ? parseFloat(formData.get('amount') as string) : undefined,
      frequency: formData.get('frequency') as string || undefined,
      hour: formData.get('hour') ? parseInt(formData.get('hour') as string, 10) : undefined,
      minute: formData.get('minute') ? parseInt(formData.get('minute') as string, 10) : undefined,
      dayOfWeek: formData.get('dayOfWeek') ? parseInt(formData.get('dayOfWeek') as string, 10) : undefined,
      dayOfMonth: formData.get('dayOfMonth') ? parseInt(formData.get('dayOfMonth') as string, 10) : undefined,
      customIntervalDays: formData.get('customIntervalDays') ? parseInt(formData.get('customIntervalDays') as string, 10) : undefined,
      description: formData.get('description') as string || undefined,
      endDate: formData.get('endDate') as string || undefined,
    }, token);

    revalidatePath('/dashboard/schedules');
    return { success: true, data: schedule };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update schedule' };
  }
}

export async function pauseScheduleAction(id: string, reason?: string) {
  try {
    const { token } = await requireAuth();
    await api.schedules.pause(id, reason, token);
    revalidatePath('/dashboard/schedules');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to pause schedule' };
  }
}

export async function resumeScheduleAction(id: string) {
  try {
    const { token } = await requireAuth();
    await api.schedules.resume(id, token);
    revalidatePath('/dashboard/schedules');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to resume schedule' };
  }
}

export async function cancelScheduleAction(id: string) {
  try {
    const { token } = await requireAuth();
    await api.schedules.cancel(id, token);
    revalidatePath('/dashboard/schedules');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to cancel schedule' };
  }
}

export async function getScheduleStatsAction() {
  try {
    const { token } = await requireAuth();
    return await api.schedules.stats(token);
  } catch (error) {
    await handleServerActionError(error, '/dashboard');
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch schedule stats');
  }
}

export async function deleteScheduleAction(id: string) {
  try {
    const { token } = await requireAuth();
    await api.schedules.delete(id, token);
    revalidatePath('/dashboard/schedules');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to delete schedule' };
  }
}
