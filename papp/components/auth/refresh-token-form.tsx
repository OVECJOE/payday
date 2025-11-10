'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { refreshTokenWithPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

const refreshTokenSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type RefreshTokenFormData = z.infer<typeof refreshTokenSchema>;

export function RefreshTokenForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RefreshTokenFormData>({
    resolver: zodResolver(refreshTokenSchema),
  });

  const onSubmit = async (data: RefreshTokenFormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('password', data.password);

    const result = await refreshTokenWithPasswordAction(formData);
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Session refreshed successfully');
      router.push(returnTo);
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Your Identity</CardTitle>
        <CardDescription>
          Enter your password to refresh your session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              disabled={isLoading}
              autoFocus
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
