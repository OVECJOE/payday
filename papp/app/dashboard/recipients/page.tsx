import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getRecipients } from '@/app/actions/recipients'
import { RecipientCard, Recipient } from './recipient-card'

export const dynamic = 'force-dynamic'

export default async function RecipientsPage() {
  const result = await getRecipients()
  const recipients = result.success ? (result.data as Recipient[]) : []

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipients</h1>
          <p className="text-muted-foreground">
            Manage the people you send money to
          </p>
        </div>
        <Link href="/dashboard/recipients/new">
          <Button>Add recipient</Button>
        </Link>
      </div>

      {recipients.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
          <h3 className="text-lg font-semibold">No recipients yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add recipients to start automating your payments. We&apos;ll verify their bank details for you.
          </p>
          <Link href="/dashboard/recipients/new">
            <Button>Add your first recipient</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipients.map((recipient: Recipient) => (
            <RecipientCard key={recipient.id} recipient={recipient} />
          ))}
        </div>
      )}
    </div>
  )
}
