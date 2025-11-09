import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardStats } from './components/dashboard-stats'
import { DashboardContent } from './components/dashboard-content'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Your payment automation dashboard
        </p>
      </div>

      <DashboardStats />

      <DashboardContent />

      <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
        <h3 className="text-lg font-semibold">Get started with Payday</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Add recipients and create your first payment schedule to automate your recurring payments
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/recipients/new">
            <Button>Add recipient</Button>
          </Link>
          <Link href="/dashboard/schedules/new">
            <Button variant="outline">Create schedule</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
