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
