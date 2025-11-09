import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ACCESS_TOKEN_KEY = 'payday_access_token';
const REFRESH_TOKEN_KEY = 'payday_refresh_token';
const USER_KEY = 'payday_user';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  status: string;
  kycStatus: string;
  timezone: string;
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value || null;
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_KEY)?.value;
  if (!userCookie) return null;
  
  try {
    return JSON.parse(userCookie) as User;
  } catch {
    return null;
  }
}

export async function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  user: User,
): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  cookieStore.set(USER_KEY, JSON.stringify(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearAuthTokens(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
  cookieStore.delete(USER_KEY);
}

export async function requireAuth(returnTo?: string): Promise<{ token: string; user: User }> {
  const token = await getAccessToken();
  const user = await getUser();
  const refreshToken = await getRefreshToken();

  if (!token || !user) {
    if (refreshToken) {
      const redirectPath = returnTo || '/dashboard';
      redirect(`/refresh-token?returnTo=${encodeURIComponent(redirectPath)}`);
    }
    redirect('/login');
  }

  return { token, user };
}

export async function requireGuest(): Promise<void> {
  const token = await getAccessToken();
  if (token) {
    redirect('/dashboard');
  }
}

