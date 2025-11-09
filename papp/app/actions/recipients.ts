'use server';

import { api } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getRecipientsAction(status?: string) {
  try {
    const { token } = await requireAuth();
    return await api.recipients.list(token, status);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch recipients');
  }
}

export async function getRecipientAction(id: string) {
  try {
    const { token } = await requireAuth();
    return await api.recipients.get(id, token);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch recipient');
  }
}

export async function createRecipientAction(formData: FormData) {
  try {
    const { token } = await requireAuth();
    
    const recipient = await api.recipients.create({
      name: formData.get('name') as string,
      accountNumber: formData.get('accountNumber') as string,
      bankCode: formData.get('bankCode') as string,
      bankName: formData.get('bankName') as string,
      type: formData.get('type') as string || 'individual',
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    }, token);

    revalidatePath('/dashboard/recipients');
    return { success: true, data: recipient };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create recipient' };
  }
}

export async function updateRecipientAction(id: string, formData: FormData) {
  try {
    const { token } = await requireAuth();
    
    const recipient = await api.recipients.update(id, {
      name: formData.get('name') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    }, token);

    revalidatePath('/dashboard/recipients');
    return { success: true, data: recipient };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update recipient' };
  }
}

export async function deleteRecipientAction(id: string) {
  try {
    const { token } = await requireAuth();
    await api.recipients.delete(id, token);
    revalidatePath('/dashboard/recipients');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to delete recipient' };
  }
}

export async function validateBankAccountAction(accountNumber: string, bankCode: string) {
  try {
    const { token } = await requireAuth();
    return await api.recipients.validateAccount({ accountNumber, bankCode }, token);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to validate account');
  }
}

export async function getBanksAction() {
  try {
    const { token } = await requireAuth();
    return await api.recipients.getBanks(token);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch banks');
  }
}

