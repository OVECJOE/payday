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

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refreshToken') 
      : null

    if (!refreshToken) {
      return null
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const newAccessToken = data.accessToken

    if (newAccessToken && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newAccessToken)
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
    }

    return newAccessToken
  } catch {
    return null
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') 
    : null

  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && !endpoint.includes('auth') ? { Authorization: `Bearer ${token}` } : {}),
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && retry && !endpoint.includes('auth')) {
    const newToken = await refreshAccessToken()
    
    if (newToken) {
        headers = {
            ...headers,
            Authorization: `Bearer ${newToken}`
        }
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      })
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
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

export const api = {
  auth: {
    register: (data: {
      email: string
      phone: string
      password: string
      firstName?: string
      lastName?: string
      timezone?: string
    }) => fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    login: (email: string, password: string) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    refresh: (refreshToken: string) =>
      fetchApi<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),

    logout: () => fetchApi('/auth/logout', { method: 'POST' }),

    changePassword: (currentPassword: string, newPassword: string) =>
      fetchApi('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),

    requestPasswordReset: (email: string) =>
      fetchApi('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, newPassword: string) =>
      fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
  },

  recipients: {
    list: () => fetchApi('/recipients'),
    get: (id: string) => fetchApi(`/recipients/${id}`),
    create: (data: {
      name: string
      accountNumber: string
      bankCode: string
      type?: string
      email?: string
      phone?: string
      notes?: string
    }) => fetchApi('/recipients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<{
      name: string
      email: string
      phone: string
      notes: string
      status: string
    }>) => fetchApi(`/recipients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi(`/recipients/${id}`, { method: 'DELETE' }),
    validateAccount: (accountNumber: string, bankCode: string) =>
      fetchApi('/recipients/validate-account', {
        method: 'POST',
        body: JSON.stringify({ accountNumber, bankCode }),
      }),
    getBanks: () => fetchApi('/recipients/banks/list'),
  },

  schedules: {
    list: (status?: string) => {
      const query = status ? `?status=${status}` : ''
      return fetchApi(`/schedules${query}`)
    },
    get: (id: string) => fetchApi(`/schedules/${id}`),
    stats: () => fetchApi('/schedules/stats'),
    create: (data: {
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
      userTimezone?: string
    }) => fetchApi('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<{
      amount: number
      frequency: string
      hour: number
      minute: number
      dayOfWeek: number
      dayOfMonth: number
      customIntervalDays: number
      description: string
      endDate: string
    }>) => fetchApi(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    pause: (id: string, reason?: string) =>
      fetchApi(`/schedules/${id}/pause`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    resume: (id: string) => fetchApi(`/schedules/${id}/resume`, { method: 'POST' }),
    cancel: (id: string) => fetchApi(`/schedules/${id}/cancel`, { method: 'POST' }),
  },

  wallet: {
    get: () => fetchApi('/wallet'),
    balance: () => fetchApi('/wallet/balance'),
  },

  transactions: {
    list: (limit = 50, offset = 0) =>
      fetchApi(`/transactions?limit=${limit}&offset=${offset}`),
    get: (id: string) => fetchApi(`/transactions/${id}`),
  },
}

