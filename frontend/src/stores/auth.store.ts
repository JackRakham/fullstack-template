import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

import { UserResponseDto } from '@/src/api/generated/identity/models/userResponseDto';

export type User = UserResponseDto;

interface AuthState {
  user: User | null;
  user_type: string;
  roles: string[];
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  setAuth: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      user_type: 'CLIENT',
      roles: [],
      isAuthenticated: false,
      hasRole: (role: string) => get().roles.includes(role),
      setAuth: (user: User) => {
        if (!user) {
          console.error('setAuth called with null user');
          return;
        }
        let user_type = 'CLIENT';
        let roles: string[] = [];
        const token = Cookies.get('auth_token');
        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length > 1) {
              const payload = JSON.parse(atob(parts[1]));
              if (payload.user_type) user_type = payload.user_type;
              if (Array.isArray(payload.roles)) roles = payload.roles;
            }
          } catch (e) {
            console.error('Error parsing token', e);
          }
        }
        set({ user, user_type, roles, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, user_type: 'CLIENT', roles: [], isAuthenticated: false });
        Cookies.remove('auth_token');
        Cookies.remove('refresh_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          const publicRoutes = ['/', '/login', '/register'];
          if (!publicRoutes.includes(window.location.pathname)) {
            window.location.href = '/login';
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

