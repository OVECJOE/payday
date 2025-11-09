import { redirect } from 'next/navigation';
import { requireGuest } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Login - Payday',
  description: 'Sign in to your Payday account',
};

export default async function LoginPage() {
  await requireGuest();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Payday</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

