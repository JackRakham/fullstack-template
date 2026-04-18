---
name: use-obsidian-wiki
description: Defines the standard for using the centralized Obsidian Knowledge Wiki (via MCP) across all Villatechn projects. Covers vault structure, MCP tools, tagging, pre/post implementation workflow, and the raw/ folder for non-markdown assets.
---

# Skill: Knowledge Wiki (Obsidian MCP)

## Overview

Todos los proyectos de Villatechn comparten una **base de conocimiento centralizada** implementada como un vault de Obsidian. Se accede y modifica vía el **MCP server `obsidian-tools`** configurado en el IDE (Antigravity/Gemini CLI).

La wiki **NO es opcional**: es la fuente de verdad para arquitectura, decisiones y estándares compartidos entre proyectos.

### Principio Fundamental: Escriba, No Arquitecto

> El LLM es un **escriba** que documenta lo que el humano decide. No es un arquitecto que toma decisiones por sí solo sobre la estructura de la wiki. El humano dirige, revisa y aprueba; el LLM redacta, cross-referencia y mantiene.

---

## 1. Ubicación y Estructura del Vault

**Ruta del vault**: `c:\Users\Usuario\Documents\Obsidian\villatechn-wiki\`

```
villatechn-wiki/
├── architecture/      # Patrones y módulos compartidos (auth, config, whatsapp, etc.)
├── decisions/         # ADRs — por qué se tomó cada decisión
├── projects/          # Overview de cada proyecto (stack, variaciones, enlaces)
├── standards/         # Convenciones obligatorias para todos los repos
├── raw/               # Archivos NO-markdown (ver sección 6)
│   ├── scripts/       #    Scripts de automatización, SQL, bash, etc.
│   ├── media/         #    Imágenes, diagramas, screenshots, videos
│   └── snippets/      #    Fragmentos de código reutilizables
├── index.md           # Mapa general — el agente lee esto primero
└── log.md             # Registro cronológico de cambios
```

---

## 2. Herramientas MCP Disponibles (orden de prioridad)

Al consultar la wiki desde cualquier proyecto, usa estas herramientas en este orden:

### 2.1 Búsqueda semántica (principal)
```
search_vault_smart({ query: "authentication JWT session management" })
```
Describe en lenguaje natural lo que vas a implementar. Devuelve documentos rankeados por similitud.

### 2.2 Lectura directa
```
get_vault_file({ filename: "index.md" })
get_vault_file({ filename: "architecture/auth-system.md" })
```
Usa cuando ya sabes qué archivo necesitas:
- `index.md` — Mapa general de la wiki
- `projects/<nombre-proyecto>.md` — Variaciones específicas del proyecto
- `architecture/*` — Patrones compartidos
- `decisions/*` — ADRs
- `standards/*` — Convenciones obligatorias

### 2.3 Búsqueda por texto exacto
```
search_vault_simple({ query: "ConfigKey" })
```
Para encontrar menciones literales de un término.

### 2.4 Listar archivos de un directorio
```
list_vault_files({ path: "architecture" })
```
Para explorar la estructura sin leer contenido.

### 2.5 Filtrado por tags (Dataview)
```
search_vault({ query: "TABLE tags FROM #backend", queryType: "dataview" })
search_vault({ query: "TABLE tags FROM #decision", queryType: "dataview" })
```
Solo soporta `TABLE` queries.

---

## 3. Operaciones de la Wiki

La wiki tiene 3 operaciones formales. El LLM las ejecuta cuando corresponde.

### 3.1 Documentar (post-implementación)

Cuando un cambio de código cae en alguna de estas categorías, el LLM **DEBE** documentar en la wiki:
- Modificó la arquitectura o añadió un módulo nuevo
- Tomó una decisión de diseño significativa (→ crear ADR)
- Cambió un patrón existente o creó uno nuevo
- Corrigió un bug cuya causa raíz merece documentarse

**Workflow paso a paso:**
1. Crear o actualizar la página principal en `architecture/`, `decisions/`, o `standards/`.
2. Revisar y actualizar cross-references en **otras páginas afectadas** (no solo la nueva).
3. Actualizar `index.md` si se crearon páginas nuevas.
4. Registrar en `log.md` con formato estándar (ver sección 5).

Para escribir:
- `create_vault_file` — crear página nueva
- `patch_vault_file` — actualizar página existente
- `append_to_vault_file` — agregar a log.md

### 3.2 Filar respuestas valiosas (Query → Wiki)

Si durante una conversación el LLM produce un análisis, comparación, o síntesis que **cumple estos criterios**, debe ofrecerse a crearlo como página wiki:

- Requirió investigación significativa (>5 min de análisis)
- Aplica a futuras sesiones de cualquier proyecto
- Responde a un "¿por qué?" o "¿cómo se decidió?" → ADR en `decisions/`
- Documenta un patrón reutilizable → `standards/` o `architecture/`

**No todo merece ser página wiki.** Respuestas simples, debugging puntual, o cambios triviales se quedan en el chat.

### 3.3 Lint (health-check bajo demanda)

El usuario puede pedir "haz lint de la wiki" y el LLM ejecuta:

1. **Index check**: ¿Hay páginas en el vault que no están listadas en `index.md`? ¿Hay entradas en el index que apuntan a páginas inexistentes?
2. **Cross-references**: ¿Hay `[[wikilinks]]` rotos?
3. **Información desactualizada**: ¿Hay claims que el código actual contradice?
4. **Gaps de documentación**: ¿Hay módulos del código significativos sin representación en la wiki?
5. **Páginas huérfanas**: ¿Hay páginas sin inbound links desde otras páginas?

Reportar hallazgos al usuario y ejecutar correcciones tras aprobación.

---

## 4. Tags y Frontmatter

### Tags disponibles
| Tag | Contenido |
|-----|-----------|
| `backend` | Módulos NestJS, servicios, controladores |
| `frontend` | Componentes React/Next.js, UI, i18n |
| `auth` | Autenticación, JWT, Firebase |
| `config` | Variables de entorno, ConfigService |
| `whatsapp` | Bot WhatsApp, tools, Twilio |
| `testing` | Suites de prueba, escenarios |
| `ecommerce` | Catálogo, carrito, órdenes |
| `pod` | Print on Demand (Printful, Gelato, Printify) |
| `design` | Design system, tokens CSS, Stitch |
| `i18n` | Internacionalización, traducciones |
| `decision` | ADR (Architecture Decision Record) |
| `standard` | Convención obligatoria compartida |
| `noir` | Específico del proyecto Noir Nature Shop |
| `trucking` | Específico del proyecto Trucking App |
| `project` | Página overview de proyecto |
| `meta` | Wiki infrastructure (index, log, raw) |

### Convención de frontmatter
```yaml
---
tags: "backend, auth, jwt"
last_updated: 2026-04-18
---
```
⚠️ **Siempre** usar comma-separated string en `tags`, **NO** YAML arrays.

---

## 5. Formato de `log.md`

Cada entrada en `log.md` **DEBE** seguir este formato parseable:

```markdown
## [YYYY-MM-DD] action | Title
- Bullet point con detalle del cambio
- Otro bullet con contexto
- Source: descripción de dónde vino el cambio
```

**Acciones válidas**: `init`, `update`, `lint`, `query`, `decision`

Ejemplo:
```markdown
## [2026-04-18] update | Auth System — Magic Link Flow
- Documentó el nuevo flujo de magic link en architecture/auth-system.md
- Actualizó projects/trucking-app.md con la referencia
- Source: Antigravity session — implementación de magic link
```

Este formato permite parsear el log con: `grep "^## \[" log.md | tail -5`

---

## 6. Carpeta `raw/` — Assets No-Markdown

El vault contiene una carpeta `raw/` para **todo archivo que no sea markdown**:

```
raw/
├── scripts/    # Scripts de automatización (SQL, bash, PowerShell, etc.)
├── media/      # Imágenes, diagramas, screenshots, videos, GIFs
└── snippets/   # Fragmentos de código reutilizables (.ts, .tsx, .sql, etc.)
```

### Cómo referenciar desde páginas MD

**Imágenes y media:**
```markdown
![Diagrama de auth](raw/media/auth-flow-diagram.png)
```

**Scripts y snippets (link):**
```markdown
Ver el script completo: [[raw/scripts/seed-database.sql]]
Snippet de referencia: [[raw/snippets/config-service-usage.ts]]
```

### Convenciones de nombrado
- Usar `kebab-case`: `auth-flow-diagram.png`, no `Auth Flow Diagram.png`
- Prefijo con proyecto si es específico: `noir-product-grid.png`, `trucking-trip-flow.sql`
- Sin prefijo si es genérico (aplica a todos): `config-service-usage.ts`

### Obsidian Tip: Attachments automáticos
En Obsidian Settings → Files and links → "Attachment folder path" → `raw/media/`. Así cualquier imagen pegada o descargada va automáticamente a la carpeta correcta.

---

## 7. Relación Skills vs Wiki

| Concepto | Vive en... | Propósito |
|----------|-----------|-----------|
| **Skills** | `.agents/skills/` de cada repo | Instrucciones operativas auto-contenidas — *cómo* hacer algo |
| **Wiki** | Vault de Obsidian centralizado | Conocimiento compilado — *qué* es, *por qué* se diseñó así, *cómo se relaciona* entre proyectos |

**Regla de no duplicación**: Si algo ya existe en un skill, la wiki solo lo referencia (no repite el contenido). Si algo aplica a múltiples proyectos, va en la wiki; si es operativo y específico de un repo, va en un skill.

---

## 8. Proyectos participantes

| Proyecto | Página wiki | Ruta del repo |
|----------|------------|---------------|
| Trucking App | `projects/trucking-app.md` | `c:\Users\Usuario\Documents\Repositorios\trucking_app` |
| Noir Nature Shop | `projects/noir-nature-shop.md` | `c:\Users\Usuario\Documents\Repositorios\noir_nature_shop_2` |
| Fullstack Template | *(base compartida)* | `c:\Users\Usuario\Documents\Repositorios\fullstack-template` |
| Agents Global Config | *(centro de comando)* | `c:\Users\Usuario\Documents\Repositorios\agents-global-config` |

---

## 9. Limitaciones Conocidas y Estado Actual

Esta wiki está diseñada para **escala pequeña-mediana** (~20-200 páginas). De acuerdo al análisis del patrón LLM Wiki (Karpathy, abril 2026) y sus críticas:

- **Escalabilidad**: `index.md` + `search_vault_smart` funcionan bien hasta ~200 páginas. Si se supera, evaluar herramientas de búsqueda dedicadas.
- **Confianza**: El LLM es escriba, no arquitecto. Las decisiones las valida el humano.
- **Drift**: Sin lint periódico, las cross-references se degradan. Ejecutar lint cada ~2-4 semanas o cuando se sienta desactualizada.
- **No es para ingest de artículos externos**: La wiki documenta nuestro código y decisiones, no procesa fuentes externas.
