'use server';

import { api } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

export async function getWalletAction() {
  try {
    const { token } = await requireAuth();
    return await api.wallet.get(token);
  } catch (error) {
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
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch balance');
  }
}

