const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorData: unknown;

    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorMessage;
      errorData = errorJson;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    return await fetchApi<T>(endpoint, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        const returnTo = encodeURIComponent(currentPath);
        window.location.href = `/refresh-token?returnTo=${returnTo}`;
      }
      throw error;
    }
    throw error;
  }
}

export const api = {
  auth: {
    register: (data: {
      email: string;
      phone: string;
      password: string;
      firstName?: string;
      lastName?: string;
      timezone?: string;
    }) => fetchApi<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    login: (data: { email: string; password: string }) =>
      fetchApi<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    refresh: (refreshToken: string) =>
      fetchApi<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),

    refreshWithPassword: (data: { refreshToken: string; password: string }) =>
      fetchApi<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/refresh-with-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    logout: (token: string) =>
      fetchWithAuth<void>('/auth/logout', { method: 'POST' }, token),

    changePassword: (data: { currentPassword: string; newPassword: string }, token: string) =>
      fetchWithAuth<void>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),

    requestPasswordReset: (email: string) =>
      fetchApi<void>('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (data: { token: string; newPassword: string }) =>
      fetchApi<void>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  recipients: {
    list: (token: string, status?: string) =>
      fetchWithAuth<Array<{
        id: string;
        name: string;
        accountNumber: string;
        bankCode: string;
        bankName: string;
        type: string;
        verified: boolean;
        status: string;
        email?: string;
        phone?: string;
        notes?: string;
      }>>(`/recipients${status ? `?status=${status}` : ''}`, { method: 'GET' }, token),

    get: (id: string, token: string) =>
      fetchWithAuth<{
        id: string;
        name: string;
        accountNumber: string;
        bankCode: string;
        bankName: string;
        type: string;
        verified: boolean;
        status: string;
        email?: string;
        phone?: string;
        notes?: string;
      }>(`/recipients/${id}`, { method: 'GET' }, token),

    create: (data: {
      name: string;
      accountNumber: string;
      bankCode: string;
      bankName: string;
      type?: string;
      email?: string;
      phone?: string;
      notes?: string;
    }, token: string) =>
      fetchWithAuth<{
        id: string;
        name: string;
        accountNumber: string;
        bankCode: string;
        bankName: string;
        type: string;
        verified: boolean;
        status: string;
      }>('/recipients', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),

    update: (id: string, data: {
      name?: string;
      email?: string;
      phone?: string;
      notes?: string;
    }, token: string) =>
      fetchWithAuth<{
        id: string;
        name: string;
        accountNumber: string;
        bankCode: string;
        bankName: string;
        type: string;
        verified: boolean;
        status: string;
      }>(`/recipients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, token),

    delete: (id: string, token: string) =>
      fetchWithAuth<void>(`/recipients/${id}`, { method: 'DELETE' }, token),

    validateAccount: (data: { accountNumber: string; bankCode: string }, token: string) =>
      fetchWithAuth<{ valid: boolean; accountName?: string }>('/recipients/validate-account', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),

    getBanks: (token: string) =>
      fetchWithAuth<Array<{ code: string; name: string }>>('/recipients/banks/list', { method: 'GET' }, token),
  },

  schedules: {
    list: (token: string, status?: string) =>
      fetchWithAuth<Array<{
        id: string;
        recipientId: string;
        amount: number;
        frequency: string;
        hour: number;
        minute: number;
        dayOfWeek?: number;
        dayOfMonth?: number;
        customIntervalDays?: number;
        startDate: string;
        endDate?: string;
        nextRunDate: string;
        lastRunDate?: string;
        status: string;
        successfulRuns: number;
        failedRuns: number;
        description?: string;
        recipient?: { name: string; bankName: string };
      }>>(`/schedules${status ? `?status=${status}` : ''}`, { method: 'GET' }, token),

    get: (id: string, token: string) =>
      fetchWithAuth<{
        id: string;
        recipientId: string;
        amount: number;
        frequency: string;
        hour: number;
        minute: number;
        dayOfWeek?: number;
        dayOfMonth?: number;
        customIntervalDays?: number;
        startDate: string;
        endDate?: string;
        nextRunDate: string;
        lastRunDate?: string;
        status: string;
        successfulRuns: number;
        failedRuns: number;
        description?: string;
        recipient?: { name: string; bankName: string };
      }>(`/schedules/${id}`, { method: 'GET' }, token),

    create: (data: {
      recipientId: string;
      amount: number;
      frequency: string;
      startDate: string;
      endDate?: string;
      hour: number;
      minute: number;
      dayOfWeek?: number;
      dayOfMonth?: number;
      customIntervalDays?: number;
      description?: string;
      userTimezone?: string;
    }, token: string) =>
      fetchWithAuth<{
        id: string;
        recipientId: string;
        amount: number;
        frequency: string;
        status: string;
      }>('/schedules', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),

    update: (id: string, data: {
      amount?: number;
      frequency?: string;
      hour?: number;
      minute?: number;
      dayOfWeek?: number;
      dayOfMonth?: number;
      customIntervalDays?: number;
      description?: string;
      endDate?: string;
    }, token: string) =>
      fetchWithAuth<{
        id: string;
        recipientId: string;
        amount: number;
        frequency: string;
        status: string;
      }>(`/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, token),

    pause: (id: string, reason?: string, token?: string) =>
      fetchWithAuth<{ id: string; status: string }>(`/schedules/${id}/pause`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }, token),

    resume: (id: string, token?: string) =>
      fetchWithAuth<{ id: string; status: string }>(`/schedules/${id}/resume`, {
        method: 'POST',
      }, token),

    cancel: (id: string, token?: string) =>
      fetchWithAuth<{ id: string; status: string }>(`/schedules/${id}/cancel`, {
        method: 'POST',
      }, token),

    delete: (id: string, token: string) =>
      fetchWithAuth<void>(`/schedules/${id}`, { method: 'DELETE' }, token),

    stats: (token: string) =>
      fetchWithAuth<{
        total: number;
        active: number;
        paused: number;
        totalAmountScheduled: number;
        successRate: number;
      }>('/schedules/stats', { method: 'GET' }, token),
  },

  wallet: {
    get: (token: string) =>
      fetchWithAuth<{
        id: string;
        userId: string;
        balance: number;
        lockedBalance: number;
        currency: string;
      }>('/wallet', { method: 'GET' }, token),

    getBalance: (token: string) =>
      fetchWithAuth<{
        total: number;
        available: number;
        locked: number;
      }>('/wallet/balance', { method: 'GET' }, token),

    fund: (token: string, data: { amount: number; email: string }) =>
      fetchWithAuth<{
        authorizationUrl: string;
        reference: string;
      }>('/wallet/fund', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),
  },

  transactions: {
    list: (token: string, limit = 50, offset = 0) =>
      fetchWithAuth<{
        transactions: Array<{
          id: string;
          amount: number;
          fee: number;
          type: string;
          status: string;
          provider: string;
          description?: string;
          createdAt: string;
          completedAt?: string;
          recipient?: { name: string; bankName: string };
        }>;
        total: number;
      }>(`/transactions?limit=${limit}&offset=${offset}`, { method: 'GET' }, token),

    get: (id: string, token: string) =>
      fetchWithAuth<{
        id: string;
        amount: number;
        fee: number;
        type: string;
        status: string;
        provider: string;
        description?: string;
        createdAt: string;
        completedAt?: string;
        failureReason?: string;
        recipient?: { name: string; bankName: string };
      }>(`/transactions/${id}`, { method: 'GET' }, token),
  },
};

