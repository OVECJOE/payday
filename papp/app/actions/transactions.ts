'use server';

import { api } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { handleServerActionError } from '@/lib/server-action-error-handler';

export async function getTransactionsAction(limit = 50, offset = 0) {
  try {
    const { token } = await requireAuth();
    return await api.transactions.list(token, limit, offset);
  } catch (error) {
    await handleServerActionError(error, '/dashboard/transactions');
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch transactions');
  }
}

export async function getTransactionAction(id: string) {
  try {
    const { token } = await requireAuth();
    return await api.transactions.get(id, token);
  } catch (error) {
    await handleServerActionError(error, '/dashboard/transactions');
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch transaction');
  }
}
