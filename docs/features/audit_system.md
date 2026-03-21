# Sistema de Auditoría (Audit Logs)

Este boilerplate incluye un sistema de auditoría automatizado que rastrea cada inserción, actualización y eliminación en la base de datos de forma transparente.

## Cómo funciona

1. **Contexto del Usuario**: Mediante `AsyncLocalStorage` y un `AuditInterceptor` global, el sistema sabe quién está realizando la petición sin necesidad de pasar el `userId` manualmente por todos los servicios.
2. **Intercepción en BD**: Un `AuditSubscriber` de TypeORM escucha todos los eventos de la base de datos.
3. **Filtro selectivo**: Solo se auditan las entidades que tengan el decorador `@Auditable()`.

## Uso

Para auditar una entidad, simplemente añade el decorador `@Auditable()` a la clase:

```typescript
import { Auditable } from "src/modules/audit/decorators/auditable.decorator";

@Auditable()
@Entity('mi_tabla')
export class MiEntidad extends BaseEntity {
    // ...
}
```

## Estructura del Log (`audit_logs`)

| Campo | Descripción |
| :--- | :--- |
| `table_name` | Nombre de la tabla en la BD. |
| `entity_id` | ID del registro afectado. |
| `action` | `INSERT`, `UPDATE` o `DELETE`. |
| `old_values` | Objeto JSON con el estado anterior (solo en UPDATE/DELETE). |
| `new_values` | Objeto JSON con el nuevo estado (solo en INSERT/UPDATE). |
| `user_id` | ID del usuario que realizó la acción (extraído del JWT). |
| `ip_address` | Dirección IP desde la que se recibió la petición. |
| `created_at` | Fecha y hora de la acción. |

## Ventajas técnicas
- **Consistencia**: Usa `snake_case` para el esquema de BD, siguiendo el estándar del proyecto.
- **Rendimiento**: Los logs se guardan de forma asíncrona tras la transacción principal del negocio.
- **Desacoplamiento**: No requiere modificar la lógica de los servicios existentes.
