---
name: calculate-app-metrics
description: Estándar para el cálculo y estructuración de métricas y dashboards de la aplicación en el Backend.
---

# Estándar de Cálculo de Métricas en la Aplicación

Este estándar define cómo estructurar y calcular las métricas de negocio (KPIs, estadísticas para dashboards, conteos) dentro de la arquitectura de la aplicación, evitando cuellos de botella y manteniendo la escalabilidad ("evita construir archivos muy grandes").

## 1. Métricas Simples y de Dominio Único (En Módulos CRUD)

Cuando la métrica depende **exclusivamente de una sola entidad** o de sus relaciones más directas y simples, debe calcularse dentro del propio módulo CRUD de esa entidad.

- **Ubicación:** `src/modules/<modulo>/<entidades>.service.ts`
- **Endpoint:** `GET /<entidades>/metrics` (Ej: `GET /drivers/metrics`) o `GET /<entidades>/:id/metrics` para métricas de un solo registro.
- **Ejemplo de Métricas:** "Total de Conductores Activos vs Inactivos", "Conteo de Vehículos por Tipo", "Cantidad de Viajes en estado 'En Curso'".
- **Implementación:**
  - Crear un método en el servicio (ej. `getDriverMetrics()`).
  - Utilizar el `Repository` principal (`this.driverRepository`) con `.count()`, `.groupBy()` o `.createQueryBuilder()` según sea necesario.
  - Generar un DTO específico para la respuesta (ej. `DriverMetricsResponseDto`).

## 2. Métricas de Relaciones (En Módulos Padre o Relaciones)

Cuando la métrica describe la actividad de una entidad en función de una colección asociada (One-to-Many o Many-to-Many).

- **Ubicación:** Debe ir del lado de la entidad principal ("Padre") de la relación, en el servicio CRUD, o si existe, en el módulo de relación específico.
- **Endpoint:** `GET /<padre>/:id/<hijos>/metrics` (Ej: `GET /drivers/:id/trips/metrics`).
- **Ejemplo:** "Estadísticas de Viajes de un Conductor Específico" (Total realizados, Total cancelados).
- **Implementación:** Consultar usando el QueryBuilder filtrando por el ID del padre (ej. `driver_id`).

## 3. Métricas Complejas Transversales y Dashboards (Módulos de Analítica)

Cuando las métricas **involucran el cruce de información de múltiples módulos** que no tienen una relación padre-hijo trivial, o son parte de un dashboard general (Ej: "Dashboard Directivo": Ingresos Totales, Top 5 Conductores más eficientes, Gasto de combustible mensual).

- **Ubicación:** Crear un módulo independiente dedicado **exclusivamente a lectura y agregación** (Ej: `src/modules/analytics/dashboards.module.ts`).
- **Controlador:** `DashboardsController` (`GET /dashboards/main`, `GET /dashboards/financial`).
- **Implementación:**
  - El servicio de `Dashboards` **NO** debe inyectar directamente `Repositories` de otros dominios (para no romper la encapsulación si no es necesario). Sus opciones son:
    1. Inyectar y llamar a los servicios de los otros módulos (`DriversService.getGeneralMetrics()`), combinando las respuestas en el dashboard.
    2. Usar vistas de Base de Datos (Views) y mapearlas a una entidad de tipo `ViewEntity` en TypeORM (Muy recomendado para analítica pesada).
  - De esta forma, mantenemos los servicios CRUD livianos y centralizamos los queries pesados ​​en un módulo separado que no sobrepase las 600 líneas de los módulos tradicionales.

## 4. Rendimiento y Caché (OBLIGATORIO)

El cálculo de métricas en bases de datos relacionales es **costoso**. TODAS las consultas de métricas deben usar el caché:

- Inyectar `CacheService`.
- Utilizar una clave estructurada (Ej: `metrics:drivers:overview` o `metrics:dashboard:main:2026-03`).
- **Invalidación:**
  - Para métricas globales/dashboards: Se recomienda permitir que expiren base al tiempo (ej. **TTL de 10-30 minutos**) en lugar de invalidarlas en cada mutación, a menos que se requiera tiempo real estricto.
  - Para métricas específicas de un recurso (`drivers:1:trips-metrics`): Pueden invalidarse cuando el recurso cambie usando `this.cacheService.delPattern(...)`.

## 5. Arquitectura de DTOs para Métricas

- NO devolver objetos anónimos (Tipos dinámicos u objetos literales).
- Siempre crear DTOs de Documentación `MetricsResponseDto` en la carpeta `dtos/` y exponerlos en Swagger. Esto es crucial porque el frontend consumirá estos endpoints mediante Orval, y requiere de tipos cerrados para generar gráficos y tarjetas.
