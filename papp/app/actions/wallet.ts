'use server';

import { api } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { handleServerActionError } from '@/lib/server-action-error-handler';

export async function getWalletAction() {
  try {
    const { token } = await requireAuth();
    return await api.wallet.get(token);
  } catch (error) {
    await handleServerActionError(error, '/dashboard/wallet');
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch wallet');
  }
}

export async function getBalanceAction() {
  try {
    const { token } = await requireAuth();
    return await api.wallet.getBalance(token);
  } catch (error) {
    await handleServerActionError(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch balance');
  }
}

export async function fundWalletAction(formData: FormData) {
  try {
    const { token } = await requireAuth();
    const amount = parseFloat(formData.get('amount') as string);
    const email = formData.get('email') as string;

    const result = await api.wallet.fund(token, { amount, email });
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to initialize wallet funding' };
  }
}
