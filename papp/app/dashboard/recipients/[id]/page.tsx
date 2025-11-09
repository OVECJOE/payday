import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getRecipient } from '@/app/actions/recipients'
import { getInitials, formatDate } from '@/lib/utils'

interface Recipient {
  id: string
  status: string
  type: string
  email: string
  phone: string
  createdAt: Date
  verifiedAt: Date
  notes: string
  name: string
  bankName: string
  accountNumber: string
  verified: boolean
}

export default async function RecipientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getRecipient(params.id)
  if (!result.success || !result.data) {
    notFound()
  }

  const recipient = result.data as Recipient

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/recipients"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to recipients
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Recipient Details</h1>
        </div>
        <Link href={`/dashboard/recipients/${recipient.id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>

      <div className="border rounded-lg p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-semibold flex-shrink-0">
            {getInitials(recipient.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-1">{recipient.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{recipient.bankName}</span>
              {recipient.verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Account Number</div>
              <div className="text-lg font-mono">{recipient.accountNumber}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Bank</div>
              <div className="text-lg">{recipient.bankName}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <div className="text-lg capitalize">{recipient.status}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Type</div>
              <div className="text-lg capitalize">{recipient.type}</div>
            </div>
          </div>

          <div className="space-y-6">
            {recipient.email && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="text-lg">{recipient.email}</div>
              </div>
            )}

            {recipient.phone && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Phone</div>
                <div className="text-lg">{recipient.phone}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground mb-1">Added</div>
              <div className="text-lg">{formatDate(recipient.createdAt)}</div>
            </div>

            {recipient.verifiedAt && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Verified</div>
                <div className="text-lg">{formatDate(recipient.verifiedAt)}</div>
              </div>
            )}
          </div>
        </div>

        {recipient.notes && (
          <div className="mt-8 pt-8 border-t">
            <div className="text-sm text-muted-foreground mb-2">Notes</div>
            <div className="text-lg whitespace-pre-wrap">{recipient.notes}</div>
          </div>
        )}
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Actions</h3>
        <div className="flex gap-3">
          <Link href={`/dashboard/schedules/new?recipient=${recipient.id}`}>
            <Button>Create payment schedule</Button>
          </Link>
          <Link href={`/dashboard/recipients/${recipient.id}/edit`}>
            <Button variant="outline">Edit recipient</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
