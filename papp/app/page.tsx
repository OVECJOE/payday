import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { LandingPage } from '@/components/landing/landing-page';

export const metadata = {
  title: 'Payday - Automated Recurring Payments',
  description: 'Set up recurring payment schedules for multiple recipients at once. The most innovative automated payroll system.',
  keywords: ['payments', 'recurring payments', 'payroll', 'automated transfers', 'fintech'],
};

export default async function HomePage() {
  const user = await getUser();
  
  if (user) {
    redirect('/dashboard');
  }
  
  return <LandingPage />;
}
