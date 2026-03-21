# Configuración de Variables de Entorno

Este módulo centraliza la configuración de la aplicación y la validación de variables de entorno.

## Estructura
- `configuration.ts`: Define el objeto de configuración base.
- `config-validation.service.ts`: Valida que las variables críticas estén presentes.
- `config.module.ts`: Punto de entrada del módulo, carga archivos `.env` según el entorno.

## Uso en otros módulos
El módulo es global, por lo que puedes inyectar `ConfigService` en cualquier lugar:

```typescript
import { ConfigService } from '@nestjs/config';

constructor(private configService: ConfigService) {
  const dbHost = this.configService.get('database.host');
}
```

## Archivos .env soportados
- `.env.${process.env.NODE_ENV}.local`
- `.env`
