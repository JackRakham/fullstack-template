---
name: generate-relationship-module
description: Explains how to automatically generate a Relationship module (from a one-to-many perspective) using two existing entities.
---

# Generate Relationship Module Skill

Relationships strictly follow the **one-to-many perspective** pattern. 
Even for Many-to-Many relationships, the backend breaks them down into two isolated modules, each viewing the relationship from one side (e.g., `user-roles` and `role-users`).

**Naming Convention**: Modules, folders, and files are constructed using a `singular-plural` format relative to the entities involved: `[source]-[targets]`. (e.g. `permission-roles.service.ts`).

To speed up generating these modules, you must use the `generate-relationship.ts` script.

## How to Run the Generator

1. Navigate to the `backend` directory.
2. Ensure both the **Source Entity** and **Target Entity** exist.
3. Run the generator using `ts-node` providing the paths to both entities:

```bash
cd backend
npx ts-node scripts/generate-relationship.ts <source-entity-path> <target-entity-path>
```

**Example (Permission -> Roles):**
```bash
npx ts-node scripts/generate-relationship.ts src/modules/identity/permissions/permission.entity.ts src/modules/identity/roles/role.entity.ts
```

## What Does it Generate?

1. **A Data Transfer Object (DTO)**: Created in the module's generic `dtos` folder (e.g., `permission-role.dto.ts`) containing the `Associate[Target]sDto` for replacing collections.
2. **A Service**: Placed in `relationships/[source]-[targets]`. Implements functions for adding, removing, retrieving (paginated), and replacing relationships. It seamlessly integrates Redis invalidation for cache.
3. **A Controller**: Placed alongside the Service. Exposes the standard API Endpoints:
   - `POST /:sourceId/targets/:targetId` (Add)
   - `DELETE /:sourceId/targets/:targetId` (Remove)
   - `GET /:sourceId/targets` (List paginated)
   - `POST /:sourceId/targets` (Replace all)

## Next Steps

1. Create a `[source]-[targets].module.ts` in the generated folder.
2. Inject `TypeOrmModule.forFeature([SourceEntity, TargetEntity])`.
3. Export the module in the main functional domain module (e.g., `IdentityModule`).

## Frontend Integration
Once the backend relationship is ready and the API schema is synced, follow the [Frontend Data Fetching Standard](file:///c:/Users/Usuario/Documents/Repositorios/trucking_app/.agents/skills/frontend-data-fetching/SKILL.md) to consume these endpoints.

- Use `use[Source][Target]sControllerFind[Target]sBy[Source]Id` to list related entities.
- Use `use[Source][Target]sControllerAdd[Target]To[Source]` to associate entities.
