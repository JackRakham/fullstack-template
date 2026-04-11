---
name: implement-user-invitation
description: Explains the admin-initiated user invitation flow and automatic account activation via Firebase, including the two-tier permission system (user_type vs business roles).
---

# User Invitation & Activation Skill

## ⚠️ Conceptual Foundation: Two Permission Tiers

The system uses **two separate and distinct** permission layers. Confusing them is a common mistake.

| Layer | Field | Table | Purpose |
|---|---|---|---|
| **Application Level** | `user_type` | `users.user_type` | Unlocks dev/platform views. Only `ADMIN` or `CLIENT`. |
| **Business Level** | `roles` | `user_roles` (join table) | Controls what the user sees inside the app. |

### Rules
- **`user_type`** is **never** set in the invitation flow. It can only be changed from the Developer Panel (`/dev`). All invited users default to `user_type = CLIENT`.
- **Business `roles`** are assigned during invitation and drive sidebar visibility and data access.
- **Example**: A General Manager gets `user_type = CLIENT` and business `role = Admin`. The `user_type = ADMIN` flag is purely for unlocking developer tooling, not business permissions.

---

## Standard Business Roles

These are seeded via `src/database/seed.ts` and must exist in the DB:

| Role | Sidebar Access | Notes |
|---|---|---|
| `Admin` | All pages | Can manage Users & Roles |
| `Staff` | Core business pages | No user management |
| `Client` | Dashboard + filtered views | Restricted data access |

To add new roles, run: `pnpm ts-node -P tsconfig.json -r tsconfig-paths/register src/database/seed.ts`

---

## Invitation Flow Overview

1. **Invitation**: Admin creates a user record with `email + name + roleIds`. No password set → status = `INVITED`. `user_type` defaults to `CLIENT`.
2. **Authentication**: Invited person logs in via Firebase with the matching email.
3. **Activation**: `AuthService.loginWithFirebase` detects `INVITED` status, syncs name & avatar from Firebase, sets status = `ACTIVE`.

---

## Backend Implementation

### UserEntity
- `user_type`: app-level enum (`ADMIN` | `CLIENT`), not exposed in invite flow.
- `status`: `ACTIVE` | `INVITED` | `DISABLED`.
- `roles`: ManyToMany to `RoleEntity` via `user_roles` join table.

### UsersService.create
- Extracts `roleIds` from DTO.
- If no `password` → invitation: status = `INVITED`, random placeholder password.
- Links roles using `roleRepository.findBy({ id: In(roleIds) })`.

### AuthService.getTokens / loginWithFirebase
- JWT payload now includes: `{ sub, email, user_type, roles: string[] }`.
- `roles` array contains the **names** of the user's business roles (e.g., `["Admin"]`).
- On login with an `INVITED` user: activates account, syncs name/avatar.

---

## Frontend Implementation

### Auth Store (`auth.store.ts`)
- `roles: string[]` — parsed from JWT on `setAuth()`.
- `hasRole(roleName: string): boolean` — helper for role checks.
- `user_type: string` — kept for dev panel access guard.

### Invite User Modal (`invite-user-modal.tsx`)
- Fetches roles from `/roles` endpoint (business roles only).
- **Does NOT expose or set `user_type`** — developer-only concern.

### Adaptive Sidebar (`adaptive-sidebar.tsx`)
- If `user_type === 'ADMIN'` (dev): shows all items regardless of business roles.
- Otherwise: filters nav items using `hasRole()` from the auth store.
- If no business role assigned: shows a "No role assigned — contact admin" empty state.

---

## Re-seeding Roles

If you need to recreate the base roles in a new environment:
```bash
cd backend
pnpm ts-node -P tsconfig.json -r tsconfig-paths/register src/database/seed.ts
```
