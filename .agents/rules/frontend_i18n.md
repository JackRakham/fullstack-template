# Rule: Modular I18n Standards

All frontend developments must follow the modular internationalization (i18n) structure to ensure scalability and maintain consistency between backend and frontend modules.

## Translation Structure
- **Global Translations**: `src/locales/{lang}/common.ts`
- **Module Translations**: `src/locales/{lang}/{module_name}.ts` (should match backend module name).
- **Aggregation**: Every new module file must be imported and exported in `src/locales/en.ts` and `src/locales/es.ts`.

## Code Implementation
- **Direct Strings**: NEVER use hardcoded strings in JSX/TSX files for user-facing text.
- **Hook Usage**: Use the `useTranslation` hook from `react-i18next`.
- **Namespaces**: Always specify the namespace when using the `t` function to avoid ambiguity, e.g., `t('identity:usersManagement')` or `t('common:save')`.
- **Typing**: (Optional but recommended) Maintain the property names consistent across all language files for a module.

## Server vs Client Components (Next.js App Router)
- **Client Components ONLY**: The `useTranslation` hook relies on React Context, which means it **MUST ONLY** be used inside Client Components (you must include the `"use client"` directive at the top of the file).
- **Server Components**: NEVER use `useTranslation` directly inside Server Components (like `app/layout.tsx` or `app/page.tsx`). If a Server Component needs translated UI elements, extract that specific part into a Client Component and import it, keeping the Server Component clean.

## Example
```tsx
'use client';

import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation(['myModule', 'common']);
  return (
    <div>
      <h1>{t('myModule:title')}</h1>
      <button>{t('common:confirm')}</button>
    </div>
  );
};
```
