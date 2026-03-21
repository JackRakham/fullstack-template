/**
 * Centralized Route Dictionary
 * 
 * Use this object for all application navigation to prevent broken links
 * and ensure type safety across the frontend.
 */
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  // Example of a dynamic route helper:
  // USER_PROFILE: (id: string | number) => `/users/${id}`,
} as const;

export type AppRoute = typeof ROUTES;
