'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/stores/auth-store'
import { changePasswordAction } from '@/app/actions/auth'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess(false)

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      setPasswordLoading(false)
      return
    }

    const result = await changePasswordAction(currentPassword, newPassword)

    if (result.success) {
      setPasswordSuccess(true)
      e.currentTarget.reset()
      setTimeout(() => setPasswordSuccess(false), 5000)
    } else {
      setPasswordError(result.error || 'Failed to change password')
    }
    
    setPasswordLoading(false)
  }

  if (!user) return null

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Profile Information</h2>
            <p className="text-sm text-muted-foreground">
              Your basic account details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={user.firstName || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={user.lastName || ''} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user.email} disabled />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={user.phone} disabled />
            <p className="text-xs text-muted-foreground">
              Contact support to change your phone number
            </p>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={user.timezone} disabled />
            <p className="text-xs text-muted-foreground">
              Your timezone is used to schedule payments accurately
            </p>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Change Password</h2>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                disabled={passwordLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                disabled={passwordLoading}
                minLength={8}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={passwordLoading}
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {passwordError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                Password changed successfully!
              </div>
            )}

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </div>

        <div className="border border-destructive/50 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-destructive mb-1">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">
              Irreversible actions
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Delete Account</div>
              <div className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </div>
            </div>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Contact support to request account deletion
          </p>
        </div>
      </div>
    </div>
  )
}
