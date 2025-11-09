import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Payday
          </Link>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold tracking-tight text-balance">
            Never forget to send money again
          </h1>
          
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Automate recurring payments to family, employees, and loved ones. 
            Set it once, run forever. Simple, reliable, and secure.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Start automating
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Sign in
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-24">
            <div className="space-y-3">
              <div className="text-4xl font-bold">01</div>
              <h3 className="text-xl font-semibold">Add recipients</h3>
              <p className="text-muted-foreground">
                Verify and save bank details for family, employees, or anyone you support.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-4xl font-bold">02</div>
              <h3 className="text-xl font-semibold">Schedule payments</h3>
              <p className="text-muted-foreground">
                Choose daily, weekly, monthly, or custom intervals. Set the time and forget it.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-4xl font-bold">03</div>
              <h3 className="text-xl font-semibold">Never miss a payment</h3>
              <p className="text-muted-foreground">
                Payments run automatically. You get notified. They get their money. Everyone&apos;s happy.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Built with care for Nigeria
        </div>
      </footer>
    </div>
  )
}
