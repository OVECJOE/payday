'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { fundWallet } from '@/app/actions/wallet'

export function FundWallet() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFund() {
    if (!amount || parseFloat(amount) < 100) {
      setError('Minimum funding amount is ₦100')
      return
    }

    setLoading(true)
    setError('')

    const result = await fundWallet(parseFloat(amount))

    if (result.success && result.data) {
      if (result.data.authorizationUrl) {
        window.location.href = result.data.authorizationUrl
      } else {
        setError('Payment initialization failed. Please try again.')
        setLoading(false)
      }
    } else {
      setError(result.error || 'Failed to initialize funding')
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Fund wallet</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Add money to your wallet to enable scheduled payments
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
            <Input
              id="amount"
              type="number"
              min="100"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError('')
              }}
              placeholder="1000"
              className="pl-8"
              disabled={loading}
            />
          </div>
          {amount && parseFloat(amount) >= 100 && (
            <p className="text-xs text-muted-foreground">
              You will be charged {formatCurrency(parseFloat(amount))}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <Button
          onClick={handleFund}
          disabled={loading || !amount || parseFloat(amount) < 100}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Continue to payment'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Secure payment powered by Paystack
        </p>
      </div>
    </div>
  )
}

