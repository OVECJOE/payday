'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BankSelector } from './bank-selector'
import { createRecipient, validateBankAccount } from '@/app/actions/recipients'

interface ValidateBankAccountResult {
  valid: boolean
  accountName?: string
}

export function RecipientForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')
  const [validatedName, setValidatedName] = useState('')
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankCode: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  async function handleValidate() {
    if (!formData.accountNumber || !formData.bankCode) return

    setValidating(true)
    setError('')
    setValidatedName('')

    const result = await validateBankAccount(formData.accountNumber, formData.bankCode)
    setValidating(false)

    if (result.success && (result.data as ValidateBankAccountResult).valid) {
      const accountName = (result.data as ValidateBankAccountResult).accountName || ''
      setValidatedName(accountName)
      setFormData((prev) => ({ ...prev, name: accountName }))
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 p-4 sm:p-6 border rounded-lg">
        <h3 className="font-semibold text-base sm:text-lg">Bank details</h3>

        <BankSelector
          id="bankCode"
          name="bankCode"
          value={formData.bankCode}
          onChange={(value) => {
            setFormData({ ...formData, bankCode: value })
            setValidatedName('')
          }}
          disabled={loading}
          required
        />

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
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleValidate}
              disabled={!formData.accountNumber || !formData.bankCode || validating || loading}
              variant="outline"
              className="whitespace-nowrap"
            >
              {validating ? 'Validating...' : 'Validate'}
            </Button>
          </div>
          {validatedName && (
            <p className="text-sm text-green-600 font-medium">{validatedName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Recipient name</Label>
          <Input
            id="name"
            name="name"
            required
            disabled={loading}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter recipient name"
          />
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6 border rounded-lg">
        <h3 className="font-semibold text-base sm:text-lg">Additional details (optional)</h3>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            disabled={loading}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="Any notes about this recipient..."
          />
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" disabled={loading || !validatedName} className="flex-1 sm:flex-none">
          {loading ? 'Adding...' : 'Add recipient'}
        </Button>
        <Link href="/dashboard/recipients" className="flex-1 sm:flex-none">
          <Button type="button" variant="outline" disabled={loading} className="w-full">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
