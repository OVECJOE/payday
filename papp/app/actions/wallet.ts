'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export async function fundWallet(amount: number) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    if (!amount || amount < 100) {
      return { success: false, error: 'Minimum funding amount is ₦100' }
    }

    const response = await fetch(`${API_URL}/wallet/fund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      cache: 'no-store',
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Funding failed' }))
      return { success: false, error: error.message || 'Funding failed' }
    }

    const data = await response.json()
    revalidatePath('/dashboard/wallet')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: (error as Error).message || 'Failed to initialize funding' }
  }
}

