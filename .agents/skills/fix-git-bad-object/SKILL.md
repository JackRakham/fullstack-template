---
description: Explains how to diagnose and fix Git "bad object" or "reference broken" errors caused by corrupted local branch or remote tracking refs in the Windows environment.
---

# Fix Git Corrupted Refs (Bad Object / Reference Broken)

Este es un problema común en entornos Windows donde, debido a cierres abruptos (como reseteos, apagones o crash de IDEs o herramientas), los archivos internos de Git en `.git/refs/` se llenan de valores nulos o saltos de línea inválidos, corrompiéndose.

## Síntomas Clave
- Al ejecutar comandos como `git pull`, `git fetch`, `git status` o al intentar hacer checkout, Git arroja errores similares a:
  - `fatal: bad object refs/heads/base`
  - `fatal: bad object refs/remotes/origin/base`
  - `fatal: update_ref failed for 'HEAD': reference broken`

## Resolución Paso a Paso

Como agente, si ves estos errores en la consola, ejecuta este flujo sistemático para reparar el repositorio **sin necesidad** de volver a clonarlo.

### 1. Identificar la Referencia Corrupta
Analiza el error que arrojó Git; te dirá exactamente qué archivo está fallando (`refs/heads/rama`, `refs/remotes/origin/rama`, etc).
Puedes revisar usando `Get-Content` para ver si está lleno de vacíos:
```powershell
Get-Content .git\refs\heads\[nombre_de_rama_corrupta]
```

### 2. Recuperar el Último Hash Válido del Reflog (Para ramas locales)
Si la rama dañada es **local** (está en `refs/heads/`), debes buscar en su `reflog` o log directo para hallar su último hash válido o sano:
```powershell
Get-Content .git\logs\refs\heads\[nombre_de_rama_corrupta] -Tail 5
```
Busca en la última línea y extrae el **segundo hash** (que es en donde había quedado el estado de la rama por última vez).

### 3. Eliminar Referencias Dañadas y Estados Internos Rotos
**¡IMPORTANTE!** Utiliza PowerShell para forzar el borrado de la referencia corrupta y de cualquier HEAD temporal (suelen corromperse simultáneamente):
```powershell
# Borra las referencias exactas que Git listó como defectuosas
Remove-Item -Path .git\refs\heads\[nombre_de_rama_corrupta] -Force -ErrorAction SilentlyContinue
Remove-Item -Path .git\refs\remotes\origin\[nombre_de_rama_corrupta] -Force -ErrorAction SilentlyContinue

# Borra artefactos y _HEAD rotos que impidan hacer checkout o pull
Remove-Item .git\*_HEAD -Force -ErrorAction SilentlyContinue
```

### 4. Reconstruir la Referencia
**Para la rama local:**
Usa el comando nativo `git update-ref` para apuntar la rama limpiamente al hash recuperado en el paso 2 (⚠️ Nunca uses `Set-Content` de PowerShell para esto porque va a incorporar saltos de línea `\r\n` y corromperá el ref de nuevo).
```powershell
git update-ref refs/heads/[nombre_de_rama_corrupta] [HASH_RECUPERADO]
```

**Para la rama remota:**
Git puede volver a regenerarlas de forma limpia con fetch.
```powershell
git fetch origin
```

### 5. Reparar el Arbol HEAD (Si falló actualizando 'HEAD')
Si los comandos rebotaban con `update_ref failed for 'HEAD'`, obliga el head local a empalmarse ejecutando:
```powershell
git update-ref HEAD HEAD
```

### 6. Comprobación Final
Recomienda realizar un "health-check" del repositorio local y reintentar el comando original del usuario (ej: pull).
```powershell
git fsck --full
git pull
```
