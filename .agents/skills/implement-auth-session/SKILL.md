---
name: implement-auth-session
description: Explains the two-token auth system (Access + Refresh Token), the role-based access control (RBAC) system with the roles table, and how to correctly protect frontend pages using roles from Zustand — NOT user_type.
---

# Implement Auth, Session & Role-Based Access

This skill documents the standard architecture for handling user authentication, session states, and **role-based access control (RBAC)** in the stack.

## 1. Backend: Identity Module & Tokens
The backend uses a standard JWT implementation but issues **two** tokens upon login:
- `accessToken`: Short-lived token (e.g. 15 minutes) used to authenticate API requests.
- `refreshToken`: Long-lived token (e.g. 7 days) used to request a new access token when it expires.

### Key Components:
- **`UserEntity`**: Stores a `hashedRefreshToken` column. When a user logs in or refreshes, a hash of the refresh token is saved here.
- **`AuthService.login`**: Generates both tokens and returns them.
- **`AuthService.refreshTokens`**: Receives a `refreshToken`, validates its hash against the DB, and issues a new pair of tokens.
- **`POST /identity/auth/refresh`**: The endpoint exposed to rotate tokens.

### JWT Payload
The JWT payload includes both `user_type` and `roles`:
```typescript
{ sub: userId, email, user_type, roles }  // roles = string[] from roles table
```
Roles are populated at login from the `user_roles` join table:
```typescript
const userRoles = (user.roles || []).map((r: any) => r.name);
const tokens = await this.getTokens(user.id, user.email, user.user_type, userRoles);
```

## 2. Role-Based Access Control (RBAC)

### Two distinct concepts — DO NOT confuse them:

| Concept | Source | Values | Purpose |
|---------|--------|--------|---------| 
| `user_type` | `UserEntity.user_type` column | `'ADMIN'`, `'CLIENT'` | Legacy system-level flag. Only `'ADMIN'` is for the original super-admin user. |
| `roles` | `roles` table via `user_roles` join table | `'Admin'`, `'Staff'`, `'Client'`, etc. | Business roles assigned through the UI. This is the standard RBAC system. |

### Critical Rule:
**NEVER use `user_type === 'ADMIN'` alone to gate access to business pages.** Users with the `Admin` or `Staff` role from the roles table must also have access. Always check both:

```typescript
const hasAccess = user_type === 'ADMIN' || roles.includes('Admin') || roles.includes('Staff');
```

### Role Constants (defined in `adaptive-sidebar.tsx`):
```typescript
const ROLE_ADMIN = 'Admin';
const ROLE_STAFF = 'Staff';
const ROLE_CLIENT = 'Client';
```

### Sidebar Visibility Matrix:
The sidebar (`src/components/layout/adaptive-sidebar.tsx`) filters navigation items based on roles:
- **Dashboard pages** (core business pages): Visible to `Admin` and `Staff` roles
- **Users & Roles page**: Visible to `Admin` role only
- **Portal pages** (client dashboards): Separate sidebar for `Client` role
- **`user_type === 'ADMIN'`**: Sees all dashboard items (bypass for super-admin)

### Standard pattern for protecting a dashboard page:

```typescript
export default function SomeDashboardPage() {
  const { user_type, roles, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const hasAccess = user_type === 'ADMIN' || roles.includes('Admin') || roles.includes('Staff');

  useEffect(() => {
    if (isAuthenticated && !hasAccess) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasAccess, router]);

  if (!hasAccess) return null;

  // ... page content
}
```

### Pages that should remain `user_type === 'ADMIN'` only:
- `/admin` — System admin panel
- `/dev` — Developer tools
These are system-level pages, not business pages.

## 3. Frontend: Axios Interceptor (Silent Refresh)
The frontend uses a pre-configured `axiosInstance` inside `src/api-client.ts` to attach tokens and intercept errors.
- **Request Interceptor**: Reads the `auth_token` from Cookies/LocalStorage and adds it to the `Authorization` header.
- **Response Interceptor (401 Handler)**:
  - If a request fails with a `401 Unauthorized`, it is placed in a `failedQueue`.
  - The interceptor calls `/identity/auth/refresh` using the `refresh_token`.
  - Upon success, the new tokens replace the old ones in Cookies/LocalStorage, and all queued requests are replayed seamlessly.
  - The user never experiences a logout unless the refresh token itself has expired.
  - **Public routes** (`/`, `/login`, `/register`) are excluded from the login redirect on refresh failure.

## 4. Frontend: Edge Middleware
To protect routes (e.g., `/dashboard`) and avoid UI flickering, Next.js Middleware (`src/middleware.ts`) runs on the Edge before rendering the page.
- **Protected routes**: `/dashboard`, `/admin`, `/settings`, `/dev`, `/portal`
- **Public routes**: Everything else
- If tokens are missing on a protected route, the user is redirected to `/login` automatically.

## 5. Frontend: Zustand Global State
The current authenticated user is stored globally using Zustand (`src/stores/auth.store.ts`).
- **`useAuthStore`**: Holds `user`, `user_type`, `roles`, `isAuthenticated`, and actions like `setAuth`, `logout`, and `hasRole`.
- **`roles`**: Parsed from the JWT payload at login — these are the business roles from the `roles` table.
- **`hasRole(role: string)`**: Utility method to check if the user has a specific role.
- **`<AuthProvider>`**: A client wrapper component placed in `layout.tsx`. On initial app load, if tokens exist in cookies, it calls the `/profile` endpoint to silently hydrate the `useAuthStore` with the full user object.

## Best Practices
1. **Never use LocalStorage exclusively**: Because Next.js Edge Middleware cannot read LocalStorage, always ensure tokens (or at least a flag) are mirrored in `Cookies`. The `js-cookie` library is used for this purpose.
2. **Never expose hashedRefreshToken**: The `UserEntity` decorator `@Column({ select: false })` ensures the refresh token hash never leaks into standard User queries unless explicitly requested.
3. **Use the Zustand Store**: UI components (like the Avatar or Sidebar) must consume `useAuthStore((state) => state.user)` rather than making redundant `/profile` API calls.
4. **Always use `roles` for page access**: Never gate business pages with `user_type` alone. Always include `roles.includes('Admin')` and `roles.includes('Staff')` checks.
5. **Keep public routes updated**: When adding new public-facing routes, update both the Edge Middleware protected routes list AND the Axios interceptor's public routes check in `src/api-client.ts`.
