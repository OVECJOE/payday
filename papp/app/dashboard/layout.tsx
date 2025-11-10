import { requireAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { BackgroundIllustration } from '@/components/dashboard/background-illustration';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/dashboard';
  
  const { token, user } = await requireAuth(pathname);
  try {
    await api.wallet.getBalance(token);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized()) {
      redirect(`/refresh-token?returnTo=${encodeURIComponent(pathname)}`);
    }
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundIllustration />
      <div className="flex h-screen overflow-hidden relative z-10">
        <DashboardNav />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <DashboardHeader user={user} />
          <div className="lg:hidden p-4 border-b">
            <MobileNav />
          </div>
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 lg:p-8 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
