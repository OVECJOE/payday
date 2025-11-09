'use server'

import { api } from '@/lib/api'

export async function getWalletBalance() {
  try {
    const balance = await api.wallet.balance()
    return { success: true, data: balance }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getScheduleStats() {
  try {
    const stats = await api.schedules.stats()
    return { success: true, data: stats }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getRecentTransactions() {
  try {
    const { transactions } = await api.transactions.list(5, 0) as { transactions: unknown }
    return { success: true, data: transactions }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getActiveSchedules() {
  try {
    const schedules = await api.schedules.list('active')
    return { success: true, data: schedules }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
