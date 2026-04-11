# Design System (Stitch Workflow)

## Descripción
Workflow de diseño UI usando **Stitch MCP** para generar, iterar y mantener pantallas de la aplicación con un design system centralizado.

## Workflow

### 1. Crear Proyecto
```
mcp_stitch_create_project(title: "Mi App")
```

### 2. Generar Pantallas
Desde un prompt de texto, Stitch genera la UI completa:
```
mcp_stitch_generate_screen_from_text(
  projectId: "...",
  prompt: "Dashboard page with sidebar, stats cards, and a data table",
  deviceType: "DESKTOP"
)
```

### 3. Crear Design System
Definir la identidad visual del proyecto:
```
mcp_stitch_create_design_system(
  projectId: "...",
  designSystem: {
    colorPalette: { primary: "#6366F1" },
    typography: { fontFamily: "Inter" },
    shape: { cornerRadius: "medium" },
    appearance: { mode: "dark" }
  }
)
```

### 4. Aplicar Design System
Sincronizar el design system con las pantallas existentes:
```
mcp_stitch_apply_design_system(
  projectId: "...",
  assetId: "...",
  selectedScreenInstances: [...]
)
```

### 5. Iterar
Editar pantallas existentes con prompts naturales:
```
mcp_stitch_edit_screens(
  projectId: "...",
  selectedScreenIds: ["..."],
  prompt: "Add a search bar above the data table"
)
```

## Design Tokens (WIP)

> ⚠️ **Pendiente de definir** — El flujo de sincronización automática entre los design tokens de Stitch y las variables CSS / Tailwind del frontend aún está en exploración.

### Estructura Propuesta
Los design tokens se documentarían en un archivo markdown que serviría como fuente de verdad para el agente de diseño:

```markdown
# Design Tokens

## Colors
- Primary: #6366F1
- Primary Light: #818CF8
- Primary Dark: #4F46E5
- Background: #0F172A
- Surface: #1E293B
- Text Primary: #F8FAFC
- Text Secondary: #94A3B8

## Typography
- Font Family: Inter
- Heading: 600 weight
- Body: 400 weight

## Shape
- Border Radius SM: 6px
- Border Radius MD: 8px
- Border Radius LG: 12px
- Border Radius Full: 9999px

## Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
```

### Posible Mapeo a CSS Variables
```css
:root {
  --color-primary: #6366F1;
  --color-primary-light: #818CF8;
  --color-primary-dark: #4F46E5;
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --font-family: 'Inter', sans-serif;
}
```

## Próximos Pasos
1. Definir el formato definitivo del archivo de design tokens
2. Crear un script o pipeline que lea los tokens y genere las CSS variables automáticamente
3. Integrar el flujo con el `create_design_system` de Stitch MCP para que los tokens se apliquen bidireccionalmente
