import { AutomationIllustration } from './illustrations/automation-illustration';

const benefits = [
  {
    title: 'Save time',
    description: 'No more manual transfers. Set it once and forget it. Your payments run automatically on schedule.',
  },
  {
    title: 'Never miss a payment',
    description: 'Automated schedules ensure your payments are always on time, every time. No reminders needed.',
  },
  {
    title: 'Bank-level security',
    description: 'Your financial data is protected with enterprise-grade encryption and security protocols.',
  },
  {
    title: 'Real-time tracking',
    description: 'Monitor all your payments in real-time. Get instant notifications and detailed transaction history.',
  },
  {
    title: 'Flexible scheduling',
    description: 'Choose from daily, weekly, monthly, or create custom intervals that fit your needs perfectly.',
  },
  {
    title: 'Cost-effective',
    description: 'Reduce administrative overhead and eliminate late payment fees with automated processing.',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Why choose Payday?
              </h2>
              <p className="text-lg text-muted-foreground">
                Experience the future of automated payments with a platform built for reliability and ease of use.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="space-y-2 p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="w-full max-w-lg mx-auto">
              <AutomationIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

