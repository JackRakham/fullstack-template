'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/src/stores/auth.store';
import { authControllerGetProfile } from '@/src/api/generated/identity/identity-authentication/identity-authentication';
import Cookies from 'js-cookie';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setAuth, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const hasToken = Cookies.get('auth_token') || localStorage.getItem('auth_token') || Cookies.get('refresh_token');

    if (hasToken) {
      // Si hay token presunto, tratamos de cargar el profile
      if (!isAuthenticated) {
        authControllerGetProfile()
          .then((user: any) => {
            setAuth(user);
          })
          .catch(() => {
            // El axios interceptor se encarga de probar el refresh
            // Si el refresh falla también, el interceptor ya redirige o limpia.
          });
      }
    } else {
      logout(); // Asegura limpiar estado
    }
  }, [setAuth, logout, isAuthenticated]);

  return <>{children}</>;
}
