---
name: implement-auth-session
description: Explains how the two-token authentication system (Access + Refresh Token) is architected across the Backend and Frontend, including Axios Interceptors, Next.js Middleware, and Zustand global state.
---

# Implement Auth & Session

This skill documents the standard architecture for handling user authentication and session states in the stack.

## 1. Backend: Identity Module & Tokens
The backend uses a standard JWT implementation but issues **two** tokens upon login:
- \`accessToken\`: Short-lived token (e.g. 15 minutes) used to authenticate API requests.
- \`refreshToken\`: Long-lived token (e.g. 7 days) used to request a new access token when it expires.

### Key Components:
- **`UserEntity`**: Stores a \`hashedRefreshToken\` column. When a user logs in or refreshes, a hash of the refresh token is saved here.
- **`AuthService.login`**: Generates both tokens and returns them.
- **`AuthService.refreshTokens`**: Receives a `refreshToken`, validates its hash against the DB, and issues a new pair of tokens.
- **`POST /identity/auth/refresh`**: The endpoint exposed to rotate tokens.

## 2. Frontend: Axios Interceptor (Silent Refresh)
The frontend uses a pre-configured `axiosInstance` inside `src/api-client.ts` to attach tokens and intercept errors.
- **Request Interceptor**: Reads the `auth_token` from Cookies/LocalStorage and adds it to the `Authorization` header.
- **Response Interceptor (401 Handler)**: 
  - If a request fails with a `401 Unauthorized`, it is placed in a `failedQueue`.
  - The interceptor calls `/identity/auth/refresh` using the `refresh_token`.
  - Upon success, the new tokens replace the old ones in Cookies/LocalStorage, and all queued requests are replayed seamlessly. 
  - The user never experiences a logout unless the refresh token itself has expired.

## 3. Frontend: Edge Middleware
To protect routes (e.g., `/dashboard`) and avoid UI flickering, Next.js Middleware (`src/middleware.ts`) runs on the Edge before rendering the page.
- It validates the existence of the `auth_token` or `refresh_token` (which are stored in **Cookies** by the API client).
- If tokens are missing on a protected route, the user is redirected to `/login` automatically.

## 4. Frontend: Zustand Global State
The current authenticated user is stored globally using Zustand (`src/stores/auth.store.ts`).
- **`useAuthStore`**: Holds `user`, `isAuthenticated`, and actions like `setAuth` and `logout`.
- **`<AuthProvider>`**: A client wrapper component placed in `layout.tsx`. On initial app load, if tokens exist in cookies, it calls the `/profile` endpoint to silently hydrate the `useAuthStore` with the full user object.

## Best Practices
1. **Never use LocalStorage exclusively**: Because Next.js Edge Middleware cannot read LocalStorage, always ensure tokens (or at least a flag) are mirrored in `Cookies`. The `js-cookie` library is used for this purpose.
2. **Never expose hashedRefreshToken**: The `UserEntity` decorator `@Column({ select: false })` ensures the refresh token hash never leaks into standard User queries unless explicitly requested.
3. **Use the Zustand Store**: UI components (like the Avatar or Sidebar) must consume `useAuthStore((state) => state.user)` rather than making redundant `/profile` API calls.
