import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApiServer<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && !endpoint.includes('auth') ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new ApiError(response.status, error.message || 'Request failed', error)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const apiServer = {
  wallet: {
    get: () => fetchApiServer('/wallet'),
    balance: () => fetchApiServer('/wallet/balance'),
  },
  transactions: {
    list: (limit = 50, offset = 0) =>
      fetchApiServer(`/transactions?limit=${limit}&offset=${offset}`),
    get: (id: string) => fetchApiServer(`/transactions/${id}`),
  },
  schedules: {
    list: (status?: string) => {
      const query = status ? `?status=${status}` : ''
      return fetchApiServer(`/schedules${query}`)
    },
    get: (id: string) => fetchApiServer(`/schedules/${id}`),
    stats: () => fetchApiServer('/schedules/stats'),
  },
  recipients: {
    list: () => fetchApiServer('/recipients'),
    get: (id: string) => fetchApiServer(`/recipients/${id}`),
  },
}

