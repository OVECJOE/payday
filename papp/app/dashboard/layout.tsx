'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/actions/auth'
import { getInitials } from '@/lib/utils'

const navigation = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Recipients', href: '/dashboard/recipients' },
  { name: 'Schedules', href: '/dashboard/schedules' },
  { name: 'Transactions', href: '/dashboard/transactions' },
  { name: 'Wallet', href: '/dashboard/wallet' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  async function handleLogout() {
    await logoutAction()
    clearAuth()
    router.push('/')
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const userInitials = getInitials(
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email
  )

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r flex flex-col">
        <div className="p-6 border-b">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
            Payday
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
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
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
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

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
