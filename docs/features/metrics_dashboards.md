# Métricas y Dashboards

## Descripción
Sistema de métricas de la aplicación separado en dos capas:
1. **Métricas de Infraestructura** — Prometheus (CPU, memory, HTTP stats)
2. **Métricas de Negocio** — Módulo Analytics (KPIs, dashboards, conteos)

## Métricas de Infraestructura (Prometheus)

El `MetricsModule` expone métricas estándar de Node.js y HTTP en `/metrics`:
- CPU, Heap, GC stats
- Peticiones HTTP (count, status codes, latency)
- Event Loop lag

```typescript
// src/modules/metrics/metrics.module.ts
PrometheusModule.register({
  path: '/metrics',
  defaultMetrics: { enabled: true },
})
```

Para visualizar en Grafana, añadir Prometheus como Data Source (`http://prometheus:9090`).

## Métricas de Negocio (Analytics Module)

El módulo `AnalyticsModule` sigue el estándar documentado en `.agents/skills/calculate-app-metrics/SKILL.md`.

### Estructura
```
src/modules/analytics/
├── analytics.module.ts         # Módulo de solo lectura/agregación
├── dashboards.service.ts       # Servicio con cache obligatorio
├── dashboards.controller.ts    # GET /dashboards/overview, /financial, etc.
└── dtos/
    └── dashboard-overview.dto.ts  # DTOs tipados con Swagger
```

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/dashboards/overview` | Métricas generales del sistema |

### 3 Niveles de Métricas

| Nivel | Ubicación | Ejemplo Endpoint |
|---|---|---|
| **Dominio simple** | En el service CRUD del módulo | `GET /users/metrics` |
| **Relaciones** | En el módulo padre | `GET /users/:id/orders/metrics` |
| **Transversales** | `AnalyticsModule` | `GET /dashboards/overview` |

### Cache (Obligatorio)
Todas las métricas DEBEN usar caché:

```typescript
const cacheKey = 'metrics:dashboard:overview';
const cached = await this.cache.get<DashboardOverviewDto>(cacheKey);
if (cached) return cached;

// Calculate...
await this.cache.set(cacheKey, result, 600_000); // 10 min TTL
```

### DTOs
Nunca retornar objetos anónimos. Siempre crear DTOs con decoradores de Swagger:

```typescript
export class DashboardOverviewDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty({ type: [EntityCountDto] })
  usersByRole: EntityCountDto[];
}
```

## Skill de Referencia
Ver `.agents/skills/calculate-app-metrics/SKILL.md` para el estándar completo.
