'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/recipients', label: 'Recipients' },
  { href: '/dashboard/schedules', label: 'Schedules' },
  { href: '/dashboard/transactions', label: 'Transactions' },
  { href: '/dashboard/wallet', label: 'Wallet' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
      <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
        <Link href="/dashboard" className="flex items-center flex-shrink-0 px-6 mb-8">
          <h2 className="text-2xl font-bold">Payday</h2>
        </Link>
        <div className="mt-6 flex-1 flex flex-col px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

