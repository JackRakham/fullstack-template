# Frontend Routing Architecture

This document outlines the standard pattern for all navigation and routing within the frontend application.

## Problem Statement
In large frontend applications, hardcoding URL paths (e.g., `href="/dashboard/users"`) directly into components leads to significant maintainability issues. If a route path needs to be updated, developers must perform global search-and-replace operations, often missing dynamic usages and causing broken links.

## Solution: Centralized Route Constants

We utilize a single source of truth for all application routes located at:
`frontend/src/config/routes.ts`

This file exports a strongly-typed `ROUTES` constant that mirrors the application's page structure.

### Usage Rules

1. **Never Hardcode Paths:** It is strictly forbidden to use string literals for internal navigation in `next/link` or `useRouter()`.
2. **Import `ROUTES`:** Always import `import { ROUTES } from '@/src/config/routes';`.
3. **Dynamic Paths:** For dynamic segments (e.g., `[id]`), define a factory function within the `ROUTES` object rather than exporting a string template.

### Example configuration

```typescript
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  USERS: {
    LIST: '/users',
    // Factory function for dynamic routes
    DETAIL: (id: string | number) => `/users/${id}`,
  }
} as const;
```

### Benefits
- **Type Safety and Autocompletion**: Most IDEs and the AI agents will autocomplete available routes securely.
- **Single Source of Truth**: Updating the actual URL structure only requires changing the value in one place.
- **Improved DX**: Factory functions enforce required parameters (like `id` or `slug`) at compile time.
