# Sistema de Colas (BullMQ)

Este boilerplate utiliza **BullMQ** sobre **Redis** para el procesamiento de tareas asíncronas en segundo plano. Esto asegura que los procesos pesados (como el envío de correos) no bloqueen la respuesta de la API y sean resilientes ante fallos.

## Arquitectura

### 1. QueueModule (`src/modules/queue/queue.module.ts`)
Módulo global que establece la conexión con Redis. Se configura automáticamente usando las siguientes variables de entorno:
- `REDIS_HOST` (default: localhost)
- `REDIS_PORT` (default: 6379)
- `REDIS_PASSWORD` (opcional)

### 2. Definición de Colas
Cada módulo puede registrar sus propias colas. Ejemplo en `MailerModule`:
```typescript
BullModule.registerQueue({
  name: MAIL_QUEUE,
})
```

### 3. Procesadores
Los procesadores escuchan los trabajos añadidos a una cola.
- **EmailProcessor**: Ubicado en `src/modules/mailer/processors/email.processor.ts`. Encargado de ejecutar el envío real del correo usando el proveedor configurado (SMTP, SendGrid o SES).

## Cómo añadir una nueva tarea a una cola

1. **Inyectar la cola** en tu servicio:
```typescript
constructor(
  @InjectQueue('nombre_de_la_cola') private readonly miCola: Queue,
) {}
```

2. **Añadir el trabajo**:
```typescript
await this.miCola.add('nombre_del_job', datos, {
  attempts: 3, // Reintentos en caso de fallo
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
});
```

## Beneficios
- **Resiliencia**: Si el servidor SMTP (u otro servicio externo) falla, BullMQ reintentará la tarea automáticamente según la configuración.
- **Rendimiento**: La API responde inmediatamente al usuario mientras la tarea se procesa en "background".
- **Escalabilidad**: Se pueden levantar múltiples workers para procesar colas muy cargadas.
