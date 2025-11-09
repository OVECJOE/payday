import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardStats } from './components/dashboard-stats'
import { DashboardContent } from './components/dashboard-content'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Your payment automation dashboard
        </p>
      </div>

      <DashboardStats />

      <DashboardContent />

      <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">Get started with Payday</h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          Add recipients and create your first payment schedule to automate your recurring payments
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/recipients/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Add recipient</Button>
          </Link>
          <Link href="/dashboard/schedules/new" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Create schedule</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
