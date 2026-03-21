# CI/CD Boilerplate: VM Deployment (SSH)

Este repositorio está preparado para integrarse con flujos de Integración y Despliegue Continuo (CI/CD) dirigidos a Máquinas Virtuales (VMs) en Google Cloud Platform o cualquier otro proveedor VPS, sin necesidad de usar Docker en producción.

El enfoque consiste en conectarse a la VM por SSH, actualizar el código mediante `git pull`, compilar los binarios necesarios y usar un gestor de procesos (como PM2) para reiniciar la aplicación.

Se incluyen dos plantillas base en el repositorio:

## 1. GitHub Actions (`.github/workflows/deploy-vm.yml.example`)
Usa `appleboy/ssh-action` para conectar GitHub con tu servidor.

**Requisitos previos en GitHub Secrets:**
1. `HOST`: La IP pública de tu servidor (ej. `34.120.XX.XX`).
2. `USERNAME`: El usuario para acceder por SSH.
3. `SSH_PRIVATE_KEY`: Una llave privada SSH configurada en tu servidor (`~/.ssh/authorized_keys`).

**Cómo activarlo:**
Renombra el archivo `.github/workflows/deploy-vm.yml.example` a `.github/workflows/deploy-vm.yml`. Cada vez que hagas un push a la rama `main`, la acción ejecutará el script de despliegue definido en el archivo.

---

## 2. Google Cloud Build (`cloudbuild-vm.yaml.example`)
Esta opción es ideal si ya estás usando GCP, porque Google gestiona la autenticación SSH internamente usando IAM y OS Login, evitando que manejes llaves SSH manualmente.

**Requisitos previos:**
1. Tu servidor (Compute Engine) debe estar en GCP.
2. El **Service Account** asignado a Cloud Build debe tener el rol de **Compute OS Login** y **Compute Instance Admin**.
3. El API de Compute Engine debe estar habilitado.

**Cómo activarlo:**
1. Renombra el archivo `cloudbuild-vm.yaml.example` a `cloudbuild.yaml`.
2. En Google Cloud Console, ve a **Cloud Build > Triggers** y crea un nuevo trigger apuntando a tu repositorio de GitHub, configurando para que use el archivo `cloudbuild.yaml`.
3. Actualiza el nombre de la instancia y la zona dentro del archivo YAML para que correspondan a tu VM real.

---

## Script de Despliegue Estándar
Ambas plantillas asumen un flujo de PM2 en el servidor. El script que corre la automatización normalmente se ve así:

```bash
cd /opt/trucking_app
git pull origin main

# Backend
cd backend
pnpm install
pnpm build
pm2 restart backend-api

# Frontend
cd ../frontend
pnpm install
pnpm build
pm2 restart frontend-web
```
Asegúrate de ajustar los nombres de las carpetas y los procesos de PM2 según tu configuración inicial.
