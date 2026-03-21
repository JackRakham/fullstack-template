# Nombramiento en el Backend: snake_case

Para mantener la consistencia con el esquema de base de datos y la `BaseEntity` existente, todas las propiedades de las entidades que se mapeen a columnas de base de datos **DEBEN** usar `snake_case`.

## Reglas de Oro:
- **Columnas de BD**: Siempre `snake_case` (ej: `created_at`, `user_id`, `is_active`).
- **Nombres de Tablas**: Siempre `snake_case` y en plural si es posible (ej: `audit_logs`, `users`).
- **Variables de Clase (no BD)**: Pueden usar `camelCase` si son puramente lógica de aplicación, pero se prefiere consistencia si se van a exponer en DTOs que reflejen la BD.

## Ejemplo:
```typescript
@Entity('audit_logs')
export class AuditLogEntity extends BaseEntity {
    @Column()
    table_name: string;

    @Column()
    user_id: number;
}
```
