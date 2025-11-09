'use server'

import { cookies } from 'next/headers'
import { api } from '@/lib/api'

export async function updateTokensAction(accessToken: string, refreshToken?: string) {
  try {
    const cookieStore = await cookies()
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    if (refreshToken) {
      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function registerAction(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const result = await api.auth.register({
      email,
      phone,
      password,
      firstName,
      lastName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })

    if (result && typeof result === 'object' && 'accessToken' in result) {
      const cookieStore = await cookies()
      const accessToken = (result as { accessToken: string }).accessToken
      const refreshToken = (result as { refreshToken?: string }).refreshToken

      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      if (refreshToken) {
        cookieStore.set('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        })
      }
    }

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await api.auth.login(email, password)

    if (result && typeof result === 'object' && 'accessToken' in result) {
      const cookieStore = await cookies()
      const accessToken = (result as { accessToken: string }).accessToken
      const refreshToken = (result as { refreshToken?: string }).refreshToken

      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      if (refreshToken) {
        cookieStore.set('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        })
      }
    }

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function logoutAction() {
  try {
    await api.auth.logout()
    const cookieStore = await cookies()
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}


export async function requestPasswordResetAction(formData: FormData) {
  try {
    const email = formData.get('email') as string
    await api.auth.requestPasswordReset(email)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    await api.auth.resetPassword(token, newPassword)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  try {
    await api.auth.changePassword(currentPassword, newPassword)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
