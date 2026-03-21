# Cache Service

Este módulo proporciona un servicio global para manejar el caché de la aplicación, soportando tanto almacenamiento en memoria como Redis.

## Características
- **Global**: Disponible en toda la aplicación sin necesidad de importarlo en cada módulo.
- **Seguro**: Maneja fallos de conexión (por ejemplo, si Redis se cae) de forma elegante volviendo a almacenamiento local o simplemente omitiendo el caché.
- **Eficiente**: Soporta eliminación por patrones (`delPattern`) y un helper `getOrSet`.

## Uso

### Inyección
```typescript
import { CacheService } from './shared/services/cache.service';

constructor(private cacheService: CacheService) {}
```

### Métodos principales

#### getOrSet
Busca en el caché; si no existe, ejecuta la función y guarda el resultado.
```typescript
const user = await this.cacheService.getOrSet(
  `user:${id}`,
  () => this.userService.findById(id),
  CacheTTL.ONE_HOUR
);
```

#### delPattern
Elimina todas las llaves que coincidan con un patrón.
```typescript
await this.cacheService.delPattern('project:*');
```

## Configuración
Las opciones de caché se definen en `src/config/configuration.ts` y pueden ser sobreescritas mediante variables de entorno:
- `CACHE_TTL`: Tiempo de vida por defecto (milisegundos).
- `CACHE_MAX_ITEMS`: Cantidad máxima de elementos en memoria.
