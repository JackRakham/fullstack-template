# Observability: Logs con Grafana Loki

Esta aplicación utiliza una pila de observabilidad moderna para procesar logs de manera inteligente.

## Stack Tecnológico
- **Pino**: Logger de alto rendimiento para Node.js (Salida estructurada en JSON).
- **Loki**: Sistema de agregación de logs diseñado para ser eficiente.
- **Promtail**: Agente que recolecta los logs de los contenedores Docker y los envía a Loki.
- **Grafana**: Interfaz visual para consultar y visualizar logs.

## Cómo usar el stack de monitoreo

### 1. Levantar la infraestructura
Asegúrate de que los nuevos servicios estén corriendo:
```bash
docker-compose up -d loki promtail grafana
```

### 2. Acceder a Grafana
- **URL**: `http://localhost:3002`
- **Usuario**: `admin`
- **Contraseña**: `admin`

### 3. Consultar logs
1. Ve a la sección **Explore** (icono de brújula en el menú lateral).
2. Selecciona **Loki** como Data Source.
3. Usa el constructor de consultas para filtrar por el label `container`. Ejemplo: `{container="trucking_app-backend-1"}`.

## Métricas y Salud de la Aplicación

### Health Checks (Salud del Sistema)
El endpoint `http://localhost:3000/health` (o `/api/health` dependiendo de tu prefijo global) proporciona el estado en tiempo real de las dependencias críticas:
- **Database**: Verifica la conexión con PostgreSQL.
- **Status ok**: Significa que la app puede procesar peticiones correctamente.

### Métricas (Prometheus)
El endpoint `http://localhost:3000/metrics` expone métricas en formato Prometheus, incluyendo:
- **Node.js**: Uso de CPU, Heap, Event Loop lag.
- **HTTP**: Cantidad de peticiones, códigos de estado, latencia.

Para visualizar estas métricas en Grafana:
1. Añade **Prometheus** como Data Source apuntando a `http://prometheus:9090`.
2. Puedes importar dashboards estándar (ej. ID `11159` para Node.js) para tener gráficas instantáneas.

## Características de Procesamiento Inteligente

- **Structured Logging**: Los logs se emiten en formato JSON, lo que permite a Loki indexar metadatos como el nivel de log, el método HTTP, la URL y el tiempo de respuesta sin necesidad de complejos parsers.
- **Correlation IDs**: Cada petición HTTP recibe un `x-correlation-id`. Este ID se incluye en todos los logs generados durante esa petición, permitiéndote rastrear el flujo completo de una operación específica incluso en sistemas con mucha carga.
- **Contexto de Error**: Los errores automáticos incluyen el stack trace y detalles de la petición (Headers, Query Params, etc.) para facilitar el debugging.

## Tips para Producción
- En producción, es recomendable usar **Grafana Alloy** para una recolección más robusta.
- Configura **Alerting** en Grafana para recibir notificaciones (Slack, Email) cuando se detecten picos de errores `500` en los logs.
