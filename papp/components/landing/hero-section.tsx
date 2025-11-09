import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PaymentIllustration } from './illustrations/payment-illustration';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Automated payments
                <span className="block text-primary">made effortless</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                Set up recurring payments for multiple recipients at once. 
                The most innovative automated payroll system that beats OPay, Kuda, and the rest.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  Start automating payments
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Secure</div>
                <div className="text-sm text-muted-foreground">Bank-level</div>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div className="relative">
              <PaymentIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

