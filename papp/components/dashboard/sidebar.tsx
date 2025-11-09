'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { logoutAction } from '@/app/actions/auth'
import { getInitials } from '@/lib/utils'

const navigation = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Recipients', href: '/dashboard/recipients' },
  { name: 'Schedules', href: '/dashboard/schedules' },
  { name: 'Transactions', href: '/dashboard/transactions' },
  { name: 'Wallet', href: '/dashboard/wallet' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, clearAuth } = useAuthStore()

  async function handleLogout() {
    await logoutAction()
    clearAuth()
    window.location.href = '/'
  }

  if (!user) return null

  const userInitials = getInitials(
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email
  )

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
          Payday
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user.firstName || user.email}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </div>
    </aside>
  )
}
