# Gestor de Paquetes: pnpm

Este repositorio es un monorepo gestionado exclusivamente con **pnpm**.

- **SIEMPRE** utiliza `pnpm` para instalar dependencias, ejecutar scripts o gestionar el workspace.
- **NUNCA** utilices `npm` o `yarn`, ya que esto rompería la integridad del `pnpm-lock.yaml` y la estructura del monorepo.

## Comandos Comunes:
- Instalar dependencias: `pnpm install`
- Ejecutar script en el root: `pnpm <script>`
- Ejecutar script en un workspace: `pnpm --filter <workspace-name> <script>`
