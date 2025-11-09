'use client'

import { useState, useEffect } from 'react'
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
  const [validationError, setValidationError] = useState('')
  const [validatedName, setValidatedName] = useState('')
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankCode: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    if (formData.accountNumber.length === 10 && formData.bankCode) {
      const timeoutId = setTimeout(() => {
        handleValidate()
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setValidatedName('')
      setValidationError('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.accountNumber, formData.bankCode])

  async function handleValidate() {
    if (!formData.accountNumber || !formData.bankCode) {
      setValidationError('Please enter both account number and bank')
      return
    }

    if (formData.accountNumber.length !== 10) {
      setValidationError('Account number must be 10 digits')
      return
    }

    setValidating(true)
    setError('')
    setValidationError('')
    setValidatedName('')

    const result = await validateBankAccount(formData.accountNumber, formData.bankCode)
    setValidating(false)

    if (result.success && (result.data as ValidateBankAccountResult).valid) {
      const accountName = (result.data as ValidateBankAccountResult).accountName || ''
      setValidatedName(accountName)
      setFormData((prev) => ({ ...prev, name: accountName }))
      setValidationError('')
    } else {
      setValidationError('Could not validate account. Please check the account number and bank.')
      setValidatedName('')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setValidationError('')

    if (!formData.accountNumber || !formData.bankCode) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (!validatedName) {
      setError('Please validate the account number first')
      setLoading(false)
      return
    }

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
            setValidationError('')
          }}
          disabled={loading}
          required
        />

        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account number</Label>
          <Input
            id="accountNumber"
            name="accountNumber"
            required
            disabled={loading}
            maxLength={10}
            minLength={10}
            value={formData.accountNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setFormData({ ...formData, accountNumber: value })
              setValidatedName('')
              setValidationError('')
            }}
            placeholder="0123456789"
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            {validating && (
              <span className="text-xs text-muted-foreground">Validating account...</span>
            )}
            {validatedName && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 font-medium">Account verified:</span>
                <span className="font-semibold text-green-700">{validatedName}</span>
              </div>
            )}
            {validationError && (
              <span className="text-xs text-destructive">{validationError}</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Recipient name</Label>
          <Input
            id="name"
            name="name"
            required
            disabled={loading || !!validatedName}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter recipient name"
            className={validatedName ? 'bg-muted' : ''}
          />
          {validatedName && (
            <p className="text-xs text-muted-foreground">
              Name auto-filled from account validation. You can edit if needed.
            </p>
          )}
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
        <Button 
          type="submit" 
          disabled={loading || !validatedName || validating} 
          className="flex-1 sm:flex-none"
        >
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
