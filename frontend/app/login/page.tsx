'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { authControllerLogin, authControllerLoginWithFirebase } from '@/src/api/generated/identity/identity-authentication/identity-authentication';
import { Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/src/config/routes';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/stores/auth.store';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authControllerLogin({ email, password });
      
      // Guardar tokens (Zustand + Cookies + LocalStorage)
      Cookies.set('auth_token', response.accessToken, { sameSite: 'lax' });
      Cookies.set('refresh_token', response.refreshToken, { sameSite: 'lax' });
      localStorage.setItem('auth_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      
      setAuth(response.user);
      
      router.push(ROUTES.HOME);
      router.refresh(); 
    } catch (err: any) {
      console.error('Login error:', err);
      setError(t('common:invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Handshake con el backend
      const response = await authControllerLoginWithFirebase({ firebaseToken: idToken });
      
      // Guardar tokens (Zustand + Cookies + LocalStorage)
      Cookies.set('auth_token', response.accessToken, { sameSite: 'lax' });
      Cookies.set('refresh_token', response.refreshToken, { sameSite: 'lax' });
      localStorage.setItem('auth_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      
      setAuth(response.user);
      
      router.push(ROUTES.HOME);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-2xl bg-white dark:bg-zinc-900 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2">
            <Truck className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('common:login')}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('common:email')}
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
              {t('common:password')}
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

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? '...' : t('common:signIn')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 font-semibold"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            Google
          </Button>
        </form>

        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Don't have an account?{' '}
            <Link href={ROUTES.AUTH.REGISTER} className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
