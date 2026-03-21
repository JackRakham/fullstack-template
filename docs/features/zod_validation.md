# Zod Validation System

Este proyecto utiliza **Zod** como motor único de validación tanto en el Backend (NestJS) como en el Frontend (React/Next.js).

## Backend (NestJS)

La validación en el backend se gestiona mediante `nestjs-zod` y `ZodValidationPipe`.

### Estándar de DTOs
Todos los DTOs deben definirse utilizando esquemas de Zod y la utilidad `createZodDto`.

```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: zod.string().email(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
```

### Pipe Global
El `ZodValidationPipe` está configurado globalmente en `main.ts`, lo que significa que cualquier DTO basado en Zod se validará automáticamente antes de llegar al controlador.

### Integración con Swagger
Gracias a `patchNestjsSwagger()`, los esquemas de Zod se reflejan automáticamente en la documentación de Swagger (OpenAPI), incluyendo restricciones como `min`, `max`, `email`, etc.

## Frontend (Sincronización)

El frontend utiliza **Orval** para generar automáticamente esquemas de Zod basados en la especificación OpenAPI del backend.

### Configuración
En `orval.config.ts`, se han añadido targets con `client: 'zod'` que generan archivos `*.zod.ts` (o similares según el modo) en `src/api/generated/`.

### Uso de esquemas generados
Puedes importar los esquemas generados para validar formularios (ej. con React Hook Form + @hookform/resolvers/zod). Ten en cuenta que los esquemas se generan en una carpeta `zod/` separada de los endpoints para evitar conflictos.

```typescript
import { UsersControllerCreateBody } from '@/api/generated/identity/zod/identity/identity';
// Use UsersControllerCreateBody as your Zod schema
```

## Beneficios
1. **Single Source of Truth**: Las reglas de validación se definen una vez en el backend.
2. **Type Safety**: Tipado estricto compartido en todo el stack.
3. **Frontend Resilience**: El frontend conoce exactamente qué datos espera el servidor.
