'use client'

import { useState } from 'react'
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

export function MobileNav() {
  const [open, setOpen] = useState(false)
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
    <div className="lg:hidden border-b bg-background sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="text-xl font-bold">
          Payday
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="p-2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </Button>
      </div>

      {open && (
        <div className="border-t bg-background">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
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
        </div>
      )}
    </div>
  )
}
