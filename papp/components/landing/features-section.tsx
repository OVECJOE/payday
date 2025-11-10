import { ScheduleIllustration } from './illustrations/schedule-illustration';
import { RecipientsIllustration } from './illustrations/recipients-illustration';
import { AnalyticsIllustration } from './illustrations/analytics-illustration';

const features = [
  {
    title: 'Recurring Schedules',
    description: 'Set up daily, weekly, monthly, or custom payment schedules. Your payments run automatically without any manual intervention.',
    illustration: <ScheduleIllustration />,
  },
  {
    title: 'Multiple Recipients',
    description: 'Manage unlimited recipients with bank account validation. Add, edit, and organize all your payment recipients in one place.',
    illustration: <RecipientsIllustration />,
  },
  {
    title: 'Real-time Analytics',
    description: 'Track all your transactions, monitor success rates, and get insights into your payment patterns with detailed analytics.',
    illustration: <AnalyticsIllustration />,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make automated payments simple and reliable
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center space-y-6 p-8 rounded-lg bg-background border hover:shadow-lg transition-shadow"
            >
              <div className="w-full max-w-xs h-64 flex items-center justify-center">
                {feature.illustration}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

