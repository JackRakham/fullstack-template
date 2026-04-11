# Storage Module

## Descripción
Sistema abstracto de almacenamiento de archivos con soporte para múltiples proveedores (Local, S3, GCS). Utiliza el **Provider Registry Pattern** para permitir que diferentes archivos se almacenen y sirvan desde distintos proveedores simultáneamente.

## Arquitectura

### Provider Registry Pattern
En lugar de un simple switch-case que instancia un solo proveedor, el módulo registra **todos** los proveedores disponibles en un mapa (`STORAGE_PROVIDER_REGISTRY`) y selecciona el activo (`STORAGE_SERVICE`) basándose en la variable de entorno `STORAGE_PROVIDER`.

Esto permite:
- Servir archivos desde el proveedor correcto según su `storage_type` en la base de datos
- Agregar nuevos proveedores sin modificar la lógica existente
- Fallback automático a `local` si el proveedor configurado no existe

### Archivos Clave
- `storage.constants.ts` — Tokens de inyección (`STORAGE_SERVICE`, `STORAGE_PROVIDER_REGISTRY`)
- `storage.module.ts` — Registro de proveedores y factory del proveedor activo
- `storage.service.ts` — Lógica de negocio (upload, delete, serve, presign)
- `storage.controller.ts` — Endpoints REST incluyendo serve público con HMAC
- `interfaces/storage-provider.interface.ts` — Contrato que todos los proveedores deben implementar

### Proveedores Disponibles
| Proveedor | Enum | Estado |
|---|---|---|
| Local (filesystem) | `local` | ✅ Implementado |
| AWS S3 | `s3` | 🔲 Skeleton |
| Google Cloud Storage | `gcs` | 🔲 Skeleton |

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/storage/upload` | ✅ | Subir archivo (multipart/form-data) |
| `POST` | `/storage/external` | ✅ | Registrar link externo |
| `GET` | `/storage/public` | ❌ | Servir archivo local vía HMAC signature |
| `GET` | `/storage/:id` | ✅ | Metadata de un media |
| `GET` | `/storage/:id/serve` | ✅ | Redirect al archivo real |
| `GET` | `/storage/:id/presign` | ✅ | Generar URL temporal (1h) |
| `DELETE` | `/storage/:id` | ✅ | Eliminar archivo y registro |

## Presigned URLs (HMAC)
Para archivos locales, las presigned URLs se generan con HMAC-SHA256 usando el `JWT_SECRET`:
1. Se calcula `signature = HMAC(secret, "filepath:expiry")`
2. Se retorna `/storage/public?path=...&expires=...&signature=...`
3. El endpoint `/storage/public` valida la firma y el tiempo de expiración antes de servir el archivo

## Configuración
```env
STORAGE_PROVIDER=local   # Opciones: local, s3, gcs
```
