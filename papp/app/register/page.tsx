'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerAction } from '@/app/actions/auth'
import { useAuthStore, User } from '@/lib/stores/auth-store'

interface RegisterResult {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
  error?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = (await registerAction(formData)) as RegisterResult

    if (result.success && result.data) {
      setAuth(result.data.user, result.data.accessToken, result.data.refreshToken)
      router.push('/dashboard')
    } else {
      setError(result.error || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Payday
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mt-8">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Start automating your recurring payments today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="08012345678"
                required
                autoComplete="tel"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-8">
        <div className="max-w-md space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            Join thousands automating their payments
          </h2>
          <p className="text-lg text-muted-foreground">
            From parents sending allowance to their children, to business owners paying employees — Payday makes it effortless.
          </p>
        </div>
      </div>
    </div>
  )
}
