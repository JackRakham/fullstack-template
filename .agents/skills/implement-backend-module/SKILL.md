---
name: implement-backend-module
description: Standard way to implement a new feature module in the backend, including DTOs, CRUD Services, Controllers, Relationships, and Caching.
---

# Implement Backend Module Skill

This skill guides the agent through the creation of a standard feature module in the backend (NestJS).

## 1. Entity Definition
Standard entities must inherit from `BaseEntity` (which includes `id`, `createdAt`, `updatedAt`).

- **Location**: `src/modules/<module-name>/<entity-name>.entity.ts`
- **Naming**: `EntityNameEntity` (e.g., `UserEntity`).
- **Decorators**: `@Entity('table_name')`.

## 2. DTO Standards
Always create specific DTOs for each operation to ensure clean Swagger documentation and type safety.

- **Location**: `src/modules/<module-name>/dtos/`
- **Standard DTOs**:
  - `Create<Entity>Dto`: For POST requests.
  - `Update<Entity>Dto`: For PUT requests.
  - `<Entity>ResponseDto`: For all return values (use `@Expose()`).
- **Pagination**: 
  - All `findAll` methods must use the generic `PaginationDto` from `src/shared/dtos/pagination.dto.ts`.
  - All paginated responses must return `PaginatedResponseDto<ResponseDto>`.

## 3. Service Implementation (CRUD)
Services should handle business logic, caching, and DTO transformations.

- **Methods**: `findAll`, `findOne`, `create`, `update`, `delete`.
- **Default Ordering**: All `findAll` and `search_by_*` methods MUST default to `order: { created_at: 'DESC' }`.
- **Relationship Searches**: All methods that filter by a parent or related entity (e.g. `search_by_<entity>`) MUST be paginated and return `PaginatedResponseDto`.
- **Cache Pattern**:
  - Inject `CacheService`.
  - Use `delPattern` on mutations to invalidate list/paginated results.
  - Key format: `<entity>:<id>` or `<entity>:all:page:X:size:Y`.
- **Transformation**: Use `plainToInstance(<ResponseDto>, entity, { excludeExtraneousValues: true })`.

## 4. Controller Implementation
Controllers define the API contract and Swagger tags.

- **Swagger**:
  - `@ApiTags('<Feature Name>')`
  - `@ApiExtraModels(PaginationDto)` (if paginated).
  - `@ApiResponse({ type: <ResponseDto> })`.
- **Standard Endpoints**:
  - `POST /` (Create)
  - `GET /` (FindAll - with `@Query() pagination: PaginationDto`)
  - `GET /:id` (FindOne)
  - `PUT /:id` (Update)
  - `DELETE /:id` (Delete)

## 5. Relationships
### Many-to-One / One-to-Many
Include "Search By" methods in the "Many" side service (e.g., `search_by_user`).
- **MUST be paginated** using `PaginationDto`.
- **MUST be ordered** by `created_at: 'DESC'`.
- Returns `PaginatedResponseDto`.

### Many-to-Many
Create dedicated relationship modules in a `relationships` folder.
- **Modules**: Create one for each side if bidirectional access is needed (e.g., `RolePermissionsModule` and `PermissionRolesModule`).
- **Methods**: `associate...` (bulk replace) and `add...To...` (single add).
- **Cache**: Invalidate patterns like `role:<id>:permissions:*`.

## 6. CRUD Automation (Recommended)
If you have already defined the Entity and created empty Service/Controller files, you can automate the population of these files and the generation of DTOs:

1. **Create Entity**: `src/modules/<module>/<entity>/<entity>.entity.ts`
2. **Create Empty Files**: Create empty `<entity>s.service.ts` and `<entity>s.controller.ts`.
3. **Run Automation**:
   ```bash
   npx ts-node backend/scripts/generate-crud.ts backend/src/modules/<module>/<entity>/<entity>.entity.ts
   ```

**The automation will:**
* Generate standardized DTOs in `../dtos/`.
* Populate the Service with CRUD logic, caching, and **ordering by `created_at: DESC`**.
* Generate `search_by_*` methods for all `@ManyToOne` relationships (paginated and ordered).
* Populate the Controller with Swagger docs and endpoints.

## 7. Type Synchronization & Frontend Registration
After any backend change (DTOs or Controllers), ALWAYS run:
```bash
pnpm sync-types
```

> [!NOTE]
> El backend DEBE estar en ejecución para que `sync-types` funcione correctamente, ya que el esquema se obtiene del servidor activo.

### 🚨 CRITICAL: New "Large Modules"
If you are creating a completely new large feature module (e.g., `Inventory`, `Billing`):

1. **Register in Orval**: You **MUST** add a new target in `frontend/orval.config.ts`.
2. **Setup Folder**: Define the physical folder in `target` and `schemas` paths.
3. **Filter**: Use `input.filters.tags` to include only the new module's tags.
4. **Follow Pattern**: Copy the structure of existing modules like `identity` or `notifications`.
5. **Persistent Client**: Asegúrate de que el `mutator` apunte a `./src/api-client.ts` para usar el **Cliente Persistente**.

This keeps the frontend API folder organized and physically segmented.

## 8. El "Cliente Persistente" (Frontend)
En este proyecto, llamamos "Cliente Persistente" al cliente de API (Axios + Orval) que mantiene automáticamente la sesión del usuario.

* **Cómo funciona**: La instancia de Axios en `frontend/src/api-client.ts` tiene interceptores que leen el `auth_token` del `localStorage` en cada petición.
* **Uso en Orval**: Para que un nuevo módulo use este cliente, se debe configurar el `mutator` en `orval.config.ts`:
  ```typescript
  mutator: {
    path: './src/api-client.ts',
    name: 'customInstance',
  }
  ```
* **Persistencia**: Esto asegura que una vez que el usuario hace login, todas las llamadas a la API incluyan el token de forma persistente hasta que se cierre la sesión.
