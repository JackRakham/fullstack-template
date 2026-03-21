import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

import { UserResponseDto } from '@/src/api/generated/identity/models/userResponseDto';

export type User = UserResponseDto;

interface AuthState {
  user: User | null;
  user_type: string;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      user_type: 'CLIENT',
      isAuthenticated: false,
      setAuth: (user: User) => {
        let user_type = 'CLIENT';
        const token = Cookies.get('auth_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.user_type) {
              user_type = payload.user_type;
            }
          } catch (e) {
            console.error('Error parsing token', e);
          }
        }
        set({ user, user_type, isAuthenticated: true });
      },
      logout: () => {
        // Limpiar Zustand
        set({ user: null, user_type: 'CLIENT', isAuthenticated: false });
        // Limpiar Cookies y LocalStorage
        Cookies.remove('auth_token');
        Cookies.remove('refresh_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        
        // Opcional: Redirigir al login si no estamos ya allí y la ruta no es pública
        if (typeof window !== 'undefined') {
          const publicRoutes = ['/', '/login', '/register'];
          if (!publicRoutes.includes(window.location.pathname)) {
            window.location.href = '/login';
          }
        }
      },
    }),
    {
      name: 'auth-storage', // Nombre para el localStorage donde persiste Zustand
    }
  )
);
