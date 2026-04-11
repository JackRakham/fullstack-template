---
name: use-env-vars
description: Explains how to securely and robustly manage environment variables in the backend using strongly typed ConfigKeys.
---

# Use Environment Variables Skill

To prevent typos, enforce security, and keep configurations predictable, this project uses a strongly typed configuration approach for environment variables in the backend.

**Never** use `process.env.MY_VAR` directly inside your business logic services or controllers. 
**Never** use raw strings like `configService.get('my.var')`.

## 1. Define the Variable
1. Add your new variable inside the `backend/.env` file.
2. Ensure you also add a placeholder for it in `backend/.env.example` so other developers know it exists.

## 2. Map it to the Configuration Object
Open `backend/src/config/configuration.ts` and map your raw `process.env` string into the structured configuration object. Give it a logical default if applicable.

```typescript
export default () => ({
  // ... existing configs
  myNewFeature: {
    apiKey: process.env.NEW_FEATURE_API_KEY,
    timeout: parseInt(process.env.NEW_FEATURE_TIMEOUT, 10) || 5000,
  }
});
```

## 3. Register the ConfigKey
Open `backend/src/config/config.keys.ts` and add an entry to the `ConfigKey` enum mapping to the exact path in your structured object.

```typescript
export enum ConfigKey {
  // ...
  NEW_FEATURE_API_KEY = 'myNewFeature.apiKey',
  NEW_FEATURE_TIMEOUT = 'myNewFeature.timeout',
}
```

## 4. Inject and Use
In your services, inject `@nestjs/config`'s `ConfigService` and retrieve the variable using the enum. This provides autocomplete and guarantees the variable path exists.

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/config/config.keys';

@Injectable()
export class MyFeatureService {
  constructor(private readonly configService: ConfigService) {}

  doSomething() {
    const apiKey = this.configService.get<string>(ConfigKey.NEW_FEATURE_API_KEY);
    const timeout = this.configService.get<number>(ConfigKey.NEW_FEATURE_TIMEOUT);
    
    // ...
  }
}
```

## 5. Integraciones Híbridas (Fallbacks)
A veces, un servicio (como SMTP) no tiene configuradas variables propias específicas (como `SMTP_USER`), pero el sistema puede tener "llaves de ambiente genéricas" asignadas por la infraestructura en tiempo de ejecución (como el campo `USER_EMAIL` en plataformas PaaS).

**NUNCA dejes la lógica de "fallback" de `process.env` dentro de las clases de servicio ni los proveedores.** 

Reúne toda la resolución de dependencias del sistema en el archivo principal `configuration.ts` para que la capa de inyección de dependencia no sea consciente de la hibridación:

```typescript
// ✅ CORRECTO (configuration.ts) - La resolución de fallback se queda aquí:
export default () => ({
  mailer: {
    smtp: {
      user: process.env.SMTP_USER || process.env.USER_EMAIL || 'default_user',
      pass: process.env.SMTP_PASS || process.env.PASSWORD || 'default_password',
    }
  }
});
```

Mientras tanto, en el constructor del proveedor, el uso permanece ciego a la lógica del entorno:

```typescript
// ✅ CORRECTO (local-mailer.provider.ts) - Mantiene Inyección de Dependencias pura:
constructor(private readonly configService: ConfigService) {
  const mailerUser = this.configService.get<string>(ConfigKey.SMTP_USER);
}
```
