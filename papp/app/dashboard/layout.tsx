import { requireAuth } from '@/lib/auth';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { BackgroundIllustration } from '@/components/dashboard/background-illustration';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth();

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustration />
      <div className="flex h-screen overflow-hidden relative z-10">
        <DashboardNav />
        <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
          <DashboardHeader user={user} />
          <div className="md:hidden p-4 border-b">
            <MobileNav />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
