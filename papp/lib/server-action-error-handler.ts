import { ApiError } from '@/lib/api';
import { getRefreshToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function handleServerActionError(
  error: unknown,
  returnTo?: string,
): Promise<never> {
  if (error instanceof ApiError && error.isUnauthorized()) {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      const redirectPath = returnTo || '/dashboard';
      redirect(`/refresh-token?returnTo=${encodeURIComponent(redirectPath)}`);
    }
    redirect('/login');
  }
  throw error;
}
