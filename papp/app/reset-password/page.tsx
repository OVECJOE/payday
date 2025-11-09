import { Suspense } from 'react'
import Link from 'next/link'
import { ResetPasswordForm } from './reset-pass-form'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Payday
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mt-8">
              Set new password
            </h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}