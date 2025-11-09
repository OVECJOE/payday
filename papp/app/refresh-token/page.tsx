import { RefreshTokenForm } from '@/components/auth/refresh-token-form';
import { getRefreshToken, getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Refresh Session - Payday',
  description: 'Confirm your identity to refresh your session',
};

export default async function RefreshTokenPage() {
  const refreshToken = await getRefreshToken();
  const user = await getUser();

  if (!refreshToken || !user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Session Expired</h1>
          <p className="mt-2 text-muted-foreground">
            Your session has expired. Please confirm your identity to continue.
          </p>
        </div>
        <RefreshTokenForm userEmail={user.email} />
      </div>
    </div>
  );
}
