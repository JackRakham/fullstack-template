'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { usersControllerCreate } from '@/src/api/generated/identity/identity/identity';
import { UserPlus, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/src/config/routes';

export default function RegisterPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('common:passwordsDoNotMatch', 'Passwords do not match'));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('common:passwordTooShort', 'Password must be at least 6 characters'));
      setIsLoading(false);
      return;
    }

    try {
      await usersControllerCreate({ name, email, password });
      
      // On success, redirect to login
      router.push(ROUTES.AUTH.LOGIN);
    } catch (err: any) {
      console.error('Registration error:', err);
      // Assuming conflict (409) or bad request (400) for common registration errors
      setError(err?.response?.data?.message || t('common:registrationError', 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-2xl bg-white dark:bg-zinc-900 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2">
            <UserPlus className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('common:register', 'Create an Account')}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your details to register a new account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('common:name', 'Full Name')}
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('common:email', 'Email')}
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('common:password', 'Password')}
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('common:confirmPassword', 'Confirm Password')}
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? '...' : t('common:signUp', 'Sign Up')}
          </Button>
        </form>

        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Already have an account?{' '}
            <Link href={ROUTES.AUTH.LOGIN} className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
