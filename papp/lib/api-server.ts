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

async function refreshAccessTokenServer(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return null
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      cookieStore.delete('accessToken')
      cookieStore.delete('refreshToken')
      return null
    }

    const data = await response.json()
    const newAccessToken = data.accessToken
    const newRefreshToken = data.refreshToken

    if (newAccessToken) {
      cookieStore.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      if (newRefreshToken) {
        cookieStore.set('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        })
      }
    }

    return newAccessToken
  } catch {
    const cookieStore = await cookies()
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')
    return null
  }
}

async function fetchApiServer<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && !endpoint.includes('auth') ? { Authorization: `Bearer ${token}` } : {}),
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 401 && retry && !endpoint.includes('auth')) {
    const newToken = await refreshAccessTokenServer()
    
    if (newToken) {
      headers = {
        ...headers,
        Authorization: `Bearer ${newToken}`
      }
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
        cache: 'no-store',
      })
    } else {
      throw new ApiError(401, 'Authentication required')
    }
  }

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
    getBanks: () => fetchApiServer('/recipients/banks/list'),
  },
}

