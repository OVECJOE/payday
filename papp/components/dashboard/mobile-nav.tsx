'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/recipients', label: 'Recipients' },
  { href: '/dashboard/schedules', label: 'Schedules' },
  { href: '/dashboard/transactions', label: 'Transactions' },
  { href: '/dashboard/wallet', label: 'Wallet' },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentItem = navItems.find(
    (item) => item.href === pathname || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  );

  return (
    <div className="lg:hidden">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {currentItem?.label || 'Menu'}
            <span>▼</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[calc(100vw-2rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'w-full',
                    isActive && 'bg-accent'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

