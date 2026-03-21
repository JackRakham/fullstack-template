# Sincronización Backend y Frontend

Este documento describe el sistema de sincronización automática entre el backend (NestJS) y el frontend (Next.js) para mantener los tipos y servicios actualizados mediante el uso de OpenAPI.

## Arquitectura del Proceso

El flujo de sincronización se divide en dos etapas principales: la extracción del esquema desde el backend y la generación de código en el frontend.

### 1. Extracción de Esquema (Backend)

Se utiliza un script de NestJS para generar un archivo `openapi.json` sin necesidad de levantar el servidor HTTP completo.

- **Archivo**: `backend/scripts/extract-schema.ts`
- **Destino**: `schema/openapi.json`
- **Comando**: `pnpm --filter trucking-backend extract-schema`
- **Detalle**: El script utiliza `NestFactory.create` para instanciar la aplicación, cargando las variables de entorno desde el archivo `.env` para garantizar que TypeORM se inicialice correctamente con la base de datos configurada.

### 2. Generación de Tipos y Servicios (Frontend)

Se utiliza `orval` con Bun para procesar el archivo `openapi.json` y generar código TypeScript modular utilizando `axios`.

- **Configuración**: `frontend/orval.config.ts`
- **Cliente Personalizado**: `frontend/src/api-client.ts` (maneja interceptores y baseURL)
- **Comando**: `bun run generate-types` (ubicado en la carpeta frontend)
- **Estructura de Salida**:
    - `src/api/generated/[modulo]/endpoints.ts`: Contiene los servicios generados para un "Gran Módulo" específico.
    - `src/api/generated/[modulo]/models/`: Contiene los DTOs filtrados para ese módulo, incluyendo un `index.ts` para fácil acceso.
    - **Módulos Actuales**: `identity`, `notifications`, `app`.

## Registro de Nuevos Módulos

Es **CRÍTICO** que al crear un nuevo "Gran Módulo" en el backend (ej. `Inventory`, `Billing`), se registre correctamente en el frontend para mantener la organización física:

1.  **Orval Config**: Abrir `frontend/orval.config.ts`.
2.  **Añadir Target**: Crear un nuevo bloque con el nombre del módulo.
3.  **Filtrar Tags**: Usar `input.filters.tags` para incluir solo los tags de Swagger pertenecientes a ese módulo.
4.  **Sincronizar**: Ejecutar `pnpm sync-types` desde la raíz para generar la nueva carpeta física.

Ejemplo de registro:
```typescript
  nuevoModulo: {
    input: {
      target: '../schema/openapi.json',
      filters: { tags: ['NuevoModuloTag'] },
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/nuevo-modulo/endpoints.ts',
      schemas: './src/api/generated/nuevo-modulo/models',
      indexFiles: true,
      client: 'axios-functions',
      // ... same override as others
    },
  },
```

## Cliente de API y Mutadores

Orval está configurado para usar un "mutador" personalizado ubicado en `src/api-client.ts`. Esto permite:
1. Usar una instancia central de Axios.
2. Inyectar tokens de autenticación mediante interceptores.
3. Manejar errores globales de forma consistente.
4. Exportar tipos y servicios limpios que no dependen directamente de la configuración de red en cada llamada.

## Ejecución Unificada

Para facilitar el flujo de trabajo en el monorepo, existe un script en la raíz que ejecuta ambos procesos en secuencia:

- **Comando**: `pnpm sync-types`
- **Definición**: `cd backend && pnpm extract-schema && cd ../frontend && bun run generate-types`

Por ejemplo, si un controlador tiene el decorador `@ApiTags('Identity')`, el frontend generará los servicios dentro de `src/api/generated/identity/`.

## Cliente de API y Mutadores

Orval está configurado para usar un "mutador" personalizado ubicado en `src/api-client.ts`. Esto permite:
1. Usar una instancia central de Axios.
2. Inyectar tokens de autenticación mediante interceptores.
3. Manejar errores globales de forma consistente.
4. Exportar tipos y servicios limpios que no dependen directamente de la configuración de red en cada llamada.
- **Detalle**: El script utiliza `NestFactory.create` para instanc
