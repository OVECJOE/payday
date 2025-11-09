'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getBanks } from '@/app/actions/recipients'

interface Bank {
  code: string
  name: string
}

interface BankSelectorProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

export function BankSelector({
  id,
  name,
  value,
  onChange,
  disabled,
  required,
}: BankSelectorProps) {
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBanks() {
      const result = await getBanks()
      if (result.success) {
        setBanks(result.data as Bank[])
      }
      setLoading(false)
    }
    loadBanks()
  }, [])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Bank</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || loading}
        required={required}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={loading ? 'Loading banks...' : 'Select a bank'} />
        </SelectTrigger>
        <SelectContent>
          {banks.map((bank) => (
            <SelectItem key={bank.code} value={bank.code}>
              {bank.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value} />
    </div>
  )
}
