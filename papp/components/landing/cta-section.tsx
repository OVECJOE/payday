import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RocketIllustration } from './illustrations/rocket-illustration';

export function CTASection() {
  return (
    <section className="py-20 sm:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Ready to automate your payments?
              </h2>
              <p className="text-lg opacity-90 max-w-xl">
                Join thousands of businesses and individuals who trust Payday for their recurring payments. 
                Get started in minutes, no credit card required.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6">
                  Create free account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="w-full max-w-md mx-auto">
              <RocketIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

