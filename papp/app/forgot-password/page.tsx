import { requireGuest } from '@/lib/auth';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Forgot Password - Payday',
  description: 'Reset your password',
};

export default async function ForgotPasswordPage() {
  await requireGuest();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Payday</h1>
          <p className="text-muted-foreground">Reset your password</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

