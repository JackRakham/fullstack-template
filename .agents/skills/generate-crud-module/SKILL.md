---
name: generate-crud-module
description: Explains how to automatically generate a Controller, Service, and DTOs for a new module using an existing Entity.
---

# Generate CRUD Module Skill

This repository is designed as a template and relies heavily on standardized patterns (caching, pagination, API documentation). To speed up development and ensure these patterns are followed, there is a built-in script that generates a CRUD module from an Entity.

## Prerequisites

1. **Create the Entity**: Before running the script, you MUST create your TypeORM Entity class.
2. **Follow naming conventions**: The entity must end with `Entity` (e.g., `export class TruckEntity`).
3. **Module Structure**: Place your entity inside its corresponding feature folder within a module (e.g., `src/modules/fleet/trucks/truck.entity.ts`).

## How to Run the Generator

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Execute the script using `ts-node`, providing the relative or absolute path to your newly created entity file:
   ```bash
   npx ts-node --project tsconfig.json scripts/generate-crud.ts src/modules/fleet/trucks/truck.entity.ts
   ```

*(Note: Depending on your global setup, you may just use `ts-node scripts/generate-crud.ts ...`)*

## What Does it Generate?

The script reads your entity file line-by-line using Regex, looking for `@Column` and `@ManyToOne` decorators to infer the fields and relationships.

It generates the following files in the same directory (or the parent `dtos` directory) as your entity:

1. **DTOs (`../dtos/[entity].dto.ts`)**:
   - `Create[Entity]Dto`: Includes OpenAPI decorators (`@ApiProperty`) and class-validator rules (`@IsNotEmpty`, `@IsString`, etc.).
   - `[Entity]ResponseDto`: Includes `@ApiProperty` and `@Expose` for serialization.
   - `[Entity]PaginationDto`.
2. **Service (`[entity]s.service.ts`)**:
   - Standard `create`, `findAll` (paginated), `findOne`, `update`, and `delete` methods.
   - **Caching integration**: Automatically injects Redis caching logic utilizing `CacheTTL`.
   - **Relationship queries**: Automatically generates `search_by_[foreign_key]` methods if you had `@ManyToOne` fields.
3. **Controller (`[entity]s.controller.ts`)**:
   - Endpoints mapped to the Service.
   - Fully decorated with Swagger properties (`@ApiOperation`, `@ApiResponse`, etc.).

## Next Steps

After running the script, you only need to:
1. Review the generated DTO validators to ensure they match your exact business rules.
2. Register your new Service and Controller inside their parent `*Module.ts` class.
3. Start the backend (`pnpm run start:dev`) to sync the API schema with the frontend.
