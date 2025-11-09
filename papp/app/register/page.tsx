import { requireGuest } from '@/lib/auth';
import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';

export const metadata = {
  title: 'Register - Payday',
  description: 'Create a new Payday account',
};

export default async function RegisterPage() {
  await requireGuest();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/">
            <h1 className="text-4xl font-bold tracking-tight">Payday</h1>
          </Link>
          <p className="text-muted-foreground">Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

