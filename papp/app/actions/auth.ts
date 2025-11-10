'use server';

import { api } from '@/lib/api';
import { setAuthTokens, clearAuthTokens, requireAuth, getRefreshToken, getUser, type User } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string | null;
  const lastName = formData.get('lastName') as string | null;
  const timezone = formData.get('timezone') as string | null;

  try {
    const response = await api.auth.register({
      email,
      phone,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      timezone: timezone || undefined,
    });

    await setAuthTokens(
      response.accessToken,
      response.refreshToken,
      response.user as User,
    );

    revalidatePath('/');
    redirect('/dashboard');
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Registration failed' };
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const response = await api.auth.login({ email, password });

    await setAuthTokens(
      response.accessToken,
      response.refreshToken,
      response.user as User,
    );

    revalidatePath('/');
    redirect('/dashboard');
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Login failed' };
  }
}

export async function logoutAction() {
  try {
    const { token } = await requireAuth();
    await api.auth.logout(token);
  } catch {
  } finally {
    await clearAuthTokens();
    revalidatePath('/');
    redirect('/login');
  }
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  try {
    const { token } = await requireAuth();
    await api.auth.changePassword({ currentPassword, newPassword }, token);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Password change failed' };
  }
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get('email') as string;

  try {
    await api.auth.requestPasswordReset(email);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Request failed' };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get('token') as string;
  const newPassword = formData.get('newPassword') as string;

  try {
    await api.auth.resetPassword({ token, newPassword });
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Password reset failed' };
  }
}

export async function refreshTokenWithPasswordAction(formData: FormData) {
  const password = formData.get('password') as string;
  const refreshToken = await getRefreshToken();
  const user = await getUser();

  if (!refreshToken || !user) {
    return { error: 'No refresh token available. Please log in again.' };
  }

  try {
    const response = await api.auth.refreshWithPassword({
      refreshToken,
      password,
    });

    await setAuthTokens(
      response.accessToken,
      response.refreshToken,
      response.user as User,
    );

    return { success: true };
  } catch {
    await clearAuthTokens();
    redirect('/login');
  }
}
