'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRecipient, getBanks, validateBankAccount } from '@/app/actions/recipients'

interface Bank {
  code: string
  name: string
}

interface ValidateBankAccountResult {
  valid: boolean
  accountName?: string
}

export default function NewRecipientPage() {
  const router = useRouter()
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')
  const [validatedName, setValidatedName] = useState('')
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankCode: '',
  })

  useEffect(() => {
    async function loadBanks() {
      const result = await getBanks()
      if (result.success) {
        setBanks(result.data as Bank[])
      }
    }
    loadBanks()
  }, [])

  async function handleValidate() {
    if (!formData.accountNumber || !formData.bankCode) return

    setValidating(true)
    setError('')
    setValidatedName('')

    const result = await validateBankAccount(formData.accountNumber, formData.bankCode)
    setValidating(false)

    if (result.success && (result.data as ValidateBankAccountResult).valid) {
      setValidatedName((result.data as ValidateBankAccountResult).accountName || '')
    } else {
      setError('Could not validate account. Please check the details.')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const result = await createRecipient(form)

    if (result.success) {
      router.push('/dashboard/recipients')
    } else {
      setError(result.error || 'Failed to add recipient')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="space-y-2 mb-8">
        <Link href="/dashboard/recipients" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to recipients
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add recipient</h1>
        <p className="text-muted-foreground">
          Add a new person or business to send money to
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 p-6 border rounded-lg">
          <h3 className="font-semibold">Bank details</h3>

          <div className="space-y-2">
            <Label htmlFor="bankCode">Bank</Label>
            <select
              id="bankCode"
              name="bankCode"
              required
              disabled={loading}
              value={formData.bankCode}
              onChange={(e) => {
                setFormData({ ...formData, bankCode: e.target.value })
                setValidatedName('')
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account number</Label>
            <div className="flex gap-2">
              <Input
                id="accountNumber"
                name="accountNumber"
                required
                disabled={loading}
                maxLength={10}
                value={formData.accountNumber}
                onChange={(e) => {
                  setFormData({ ...formData, accountNumber: e.target.value })
                  setValidatedName('')
                }}
                placeholder="0123456789"
              />
              <Button
                type="button"
                onClick={handleValidate}
                disabled={!formData.accountNumber || !formData.bankCode || validating}
                variant="outline"
              >
                {validating ? 'Validating...' : 'Validate'}
              </Button>
            </div>
            {validatedName && (
              <p className="text-sm text-green-600">✓ {validatedName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Recipient name</Label>
            <Input
              id="name"
              name="name"
              required
              disabled={loading}
              defaultValue={validatedName}
              key={validatedName}
            />
          </div>
        </div>

        <div className="space-y-4 p-6 border rounded-lg">
          <h3 className="font-semibold">Additional details (optional)</h3>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              disabled={loading}
              placeholder="recipient@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              disabled={loading}
              placeholder="08012345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              disabled={loading}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any notes about this recipient..."
            />
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || !validatedName}>
            {loading ? 'Adding...' : 'Add recipient'}
          </Button>
          <Link href="/dashboard/recipients">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
