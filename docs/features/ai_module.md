# AI Module

## Descripción
Módulo de integración con modelos de lenguaje (LLM) a través de **OpenRouter**, un gateway unificado que da acceso a 100+ proveedores (OpenAI, Anthropic, Google, Meta, etc.) con una sola API key y formato OpenAI-compatible.

## Arquitectura

### Archivos
- `openrouter.client.ts` — Cliente HTTP para la API de OpenRouter
- `ai.service.ts` — Servicio genérico con métodos de alto nivel
- `ai.module.ts` — Módulo NestJS (exporta `AiService`)

### Diseño
El módulo sigue un principio de **separación de responsabilidades**:
- `AiService` provee métodos **genéricos** (`chat`, `chatWithTools`, `extractJsonFromText`, `classifyText`)
- Los **prompts, tools y lógica de dominio** viven en el módulo que consume el servicio (no aquí)

Esto permite que cualquier feature module inyecte `AiService` sin acoplar el módulo de IA al dominio:

```
┌─────────────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Feature Module     │────▶│  AiService   │────▶│ OpenRouterClient │
│ (prompts, tools)    │     │  (generic)   │     │    (HTTP)        │
└─────────────────────┘     └──────────────┘     └──────────────────┘
```

## API del Servicio

### `chat(messages, options?)`
Chat completion simple. Retorna el texto del asistente.

```typescript
const reply = await this.aiService.chat([
  { role: 'system', content: 'Responde siempre en español.' },
  { role: 'user', content: 'What is TypeScript?' },
]);
```

### `chatWithTools(messages, tools, toolExecutor, options?)`
Chat con function calling. Ejecuta un loop automático de tool calls hasta obtener una respuesta final (máximo configurable de turnos).

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'getUserOrders',
    description: 'Buscar pedidos de un usuario por email',
    parameters: {
      type: 'object',
      properties: { email: { type: 'string' } },
      required: ['email'],
    },
  },
}];

const executor: ToolExecutor = async (name, args) => {
  if (name === 'getUserOrders') {
    return await this.ordersService.findByEmail(args.email);
  }
  return { error: 'Unknown tool' };
};

const reply = await this.aiService.chatWithTools(
  [{ role: 'user', content: '¿Cuáles son los pedidos de juan@email.com?' }],
  tools,
  executor,
);
```

### `extractJsonFromText<T>(systemPrompt, text, options?)`
Extracción de datos estructurados usando JSON mode.

```typescript
interface ContactInfo {
  name: string;
  email: string;
  phone: string | null;
}

const data = await this.aiService.extractJsonFromText<ContactInfo>(
  'Extrae nombre, email y teléfono del texto. JSON: { "name": "", "email": "", "phone": "" }',
  'Hola, soy Carlos Pérez. Mi correo es carlos@test.com.',
);
// data = { name: "Carlos Pérez", email: "carlos@test.com", phone: null }
```

### `classifyText(text, categories, context?)`
Clasificación de texto en una categoría con score de confianza.

```typescript
const result = await this.aiService.classifyText(
  'Necesito una copia de la factura de la semana pasada',
  ['DOCUMENT_REQUEST', 'STATUS_INQUIRY', 'COMPLAINT', 'SPAM', 'OTHER'],
  'Estás clasificando emails de soporte de una empresa de logística.',
);
// result = { category: "DOCUMENT_REQUEST", confidence: 0.95, reasoning: "..." }
```

## Configuración

```env
# API key de OpenRouter (https://openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-...

# Modelo predeterminado (ver https://openrouter.ai/models)
OPENROUTER_MODEL=google/gemini-2.0-flash-001
```

## Uso en un Feature Module

```typescript
import { Module } from '@nestjs/common';
import { AiModule } from '../integrations/ai/ai.module';
import { MyFeatureService } from './my-feature.service';

@Module({
  imports: [AiModule],
  providers: [MyFeatureService],
})
export class MyFeatureModule {}
```

```typescript
@Injectable()
export class MyFeatureService {
  constructor(private readonly ai: AiService) {}

  async processDocument(text: string) {
    return this.ai.extractJsonFromText(
      'Extract invoice number and total amount...',
      text,
    );
  }
}
```
