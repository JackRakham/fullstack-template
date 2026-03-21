# Sistema de Logging Estructurado (Pino)

Este boilerplate utiliza **Pino** como motor de logs para asegurar un rendimiento ultra-rápido y logs listos para producción (JSON estructurado).

## Características

1. **Reemplazo Global**: El sistema está configurado para reemplazar el logger nativo de NestJS. Esto significa que puedes seguir usando `new Logger('Context')` y los logs se procesarán automáticamente con Pino.
2. **Formato Adaptativo**:
   - **Desarrollo**: Usa `pino-pretty` para mostrar logs legibles con colores en la terminal.
   - **Producción**: Genera JSON puro, ideal para ser recolectado por herramientas como CloudWatch, ELK o Grafana Loki.
3. **Trace ID**: Cada petición HTTP incluye automáticamente un `req.id` único que se propaga a todos los logs generados durante esa petición, facilitando el seguimiento de errores.

## Uso Estándar

No necesitas importar nada especial de Pino. Sigue usando el patrón estándar de NestJS:

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MiServicio {
  private readonly logger = new Logger(MiServicio.name);

  hazAlgo() {
    this.logger.log('Información importante');
    this.logger.error('Algo salió mal', error.stack);
  }
}
```

## Beneficios
- **Velocidad**: Hasta 5 veces más rápido que otros loggers tradicionales.
- **Escalabilidad**: Los logs JSON pueden ser consultados como si fueran una base de datos en herramientas de observabilidad.
- **Sin Dependencias de Código**: Puedes cambiar el motor de logs sin tocar un solo archivo de lógica de negocio.
