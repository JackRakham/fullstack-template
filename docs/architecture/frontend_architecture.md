# Frontend Architecture

This project follows a modular frontend architecture that mirrors the backend structure, ensuring consistency and scalability.

## Directory Structure

### `src/components/common`
Contains generic, reusable UI components that are independent of business logic or higher-level abstractions.
- **Example**: `ThemeToggle`, `Modal`.

### `src/components/ui`
Contains base components from **shadcn/ui**. These are primitives used by other components.
- **Example**: `button.tsx`, `input.tsx`, `dialog.tsx`.

### `src/components/layout`
Contains components related to the application's structural layout.
- **Example**: `Sidebar`, `Navbar`, `Footer`.

### `src/modules/{module_name}`
Business logic is encapsulated within these module folders, mirroring the `backend/src/modules/` directory.
- `components/`: Business-logic specific components.
- `hooks/`: Custom React hooks for API calls and module state.
- `constants/`: Module-specific constants.
- `utils/`: Helper functions for this module.

**Example: Identity Module**
`src/modules/identity/components/users-table.tsx`

### `app/(dashboard)/{module_name}`
The file-system based routing follows the same modular structure.
- **Example**: `app/(dashboard)/identity/users/page.tsx`

## API Integration
The API layer is automatically generated in `src/api/generated/` using OpenAPI and Orval, maintaining the same modular separation as the backend.

## I18n (Internationalization)

... (i18n details) ...

## UI Library & Themes

The project uses **shadcn/ui** for high-quality, accessible UI primitives.

- **Storage**: Components are added via `npx shadcn@latest add` and reside in `src/components/ui`.
- **Theme Support**: Integrated with `next-themes`. A `ThemeToggle` component is available in `src/components/common`.
- **Tailwind v4**: The project is configured for Tailwind CSS v4, ensuring modern performance and features.

## Best Practices
1. **Separation of Concerns**: Generic UI stays in `common`, business logic stays in `modules`.
2. **Mirroring**: When creating a new module in the backend, create the corresponding folder in `src/modules/` on the frontend.
3. **Naming**: Use kebab-case for directories and PascalCase for components.
4. **Translations**: When adding a new module, create the corresponding `{module}.ts` file in each language folder within `src/locales/` and register it in the language aggregation file (e.g., `en.ts`).
