import Link from 'next/link'
import { RecipientForm } from './components/recipient-form'

export const dynamic = 'force-dynamic'

export default function NewRecipientPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="space-y-2 mb-6 sm:mb-8">
        <Link
          href="/dashboard/recipients"
          className="text-sm text-muted-foreground hover:text-foreground inline-block"
        >
          ← Back to recipients
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add recipient</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Add a new person or business to send money to
        </p>
      </div>

      <RecipientForm />
    </div>
  )
}
