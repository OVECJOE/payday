'use client'

import {useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'

export function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
  
    useEffect(() => {
      if (!token) {
        setError('Invalid or missing reset token')
      }
    }, [token])
  
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      if (!token) return
  
      setLoading(true)
      setError('')
  
      const formData = new FormData(e.currentTarget)
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string
  
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
  
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }
  
      const result = await resetPasswordAction(token, password)
  
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setError(result.error || 'Failed to reset password')
        setLoading(false)
      }
    }
  
    if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mx-auto">
                ✓
              </div>
              <h1 className="text-2xl font-bold">Password reset successful</h1>
              <p className="text-muted-foreground">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </div>
          </div>
        </div>
      )
    }
  
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Payday
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mt-8">
              Set new password
            </h1>
            <p className="text-muted-foreground">
              Choose a strong password for your account
            </p>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading || !token}
                minLength={8}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={loading || !token}
                minLength={8}
              />
            </div>
  
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
  
            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
  
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    )
  }