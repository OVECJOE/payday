'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteRecipient } from '@/app/actions/recipients'
import { getInitials } from '@/lib/utils'

export interface Recipient {
  id: string
  name: string
  bankName: string
  accountNumber: string
  verified: boolean
}

export function RecipientCard({ recipient }: { recipient: Recipient }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete ${recipient.name}? This cannot be undone.`)) return

    setDeleting(true)
    const result = await deleteRecipient(recipient.id)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
      setDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm sm:text-base font-semibold flex-shrink-0">
            {getInitials(recipient.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm sm:text-base truncate">{recipient.name}</div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate">
              {recipient.bankName}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Account</span>
          <span className="font-mono text-xs sm:text-sm">{recipient.accountNumber}</span>
        </div>
        {recipient.verified && (
          <div className="text-xs text-green-600 font-medium">Verified</div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Link href={`/dashboard/recipients/${recipient.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
            View
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:text-destructive text-xs sm:text-sm"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  )
}
