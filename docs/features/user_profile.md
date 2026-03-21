# User Profile & Avatars

Esta funcionalidad permite a los usuarios gestionar su información personal, incluyendo su nombre y su foto de perfil (avatar). El sistema soporta una estrategia híbrida donde la foto puede provenir de un proveedor externo (Google/Firebase) o ser subida directamente a nuestro sistema.

## Arquitectura

### Entidad de Usuario

La `UserEntity` ha sido extendida con los siguientes campos siguiendo el estándar `snake_case`:

- `avatar_url` (string, nullable): Almacena la URL de la foto de perfil proporcionada por Google durante el handshake de Firebase.
- `avatar_id` (number, nullable): ID de la relación ManyToOne con `MediaEntity`. Se utiliza cuando el usuario sube una imagen manualmente.
- `avatar` (MediaEntity): Relación que permite acceder a los metadatos de la imagen subida (título, mimetype, url local/nube).

### Estrategia de Visualización (Prioridad)

Para mostrar el avatar en la interfaz de usuario, se sigue este orden de prioridad:

1.  **Avatar Manual**: Si `user.avatar.url` está presente, se usa la imagen subida por el usuario.
2.  **Avatar de Google**: Si no hay imagen manual, se usa `user.avatar_url`.
3.  **Iniciales**: Si no hay ninguna de las anteriores, se muestran las iniciales del nombre del usuario.

## Backend

### Endpoints

-   `PATCH /users/profile`: Permite al usuario autenticado actualizar su propio perfil.
     -   Acepta `UpdateUserDto` con `name` y `avatar_id`.
     -   Utiliza el decorador `@CurrentUser()` para identificar al usuario desde el JWT.

-   `POST /storage/upload`: Utilizado para la subida de los archivos de imagen. Retorna un objeto `MediaResponseDto` con el `id` necesario para vincular el avatar.

### Captura Automática (Firebase)

Durante el proceso de `loginWithFirebase`, el `AuthService` verifica si el usuario tiene una foto en su cuenta de Google (`decodedToken.picture`). Si es un usuario nuevo o no tiene `avatar_url` configurada, se guarda automáticamente para proporcionar una experiencia de perfil completa desde el primer ingreso.

## Frontend

### Componentes

-   `UserMenu`: Ubicado en el `Header`, muestra el avatar dinámico y proporciona acceso a los ajustes y al cierre de sesión.
-   `ProfileForm`: Ubicado en `/settings/profile`, permite:
    -   Cambiar el nombre del usuario.
    -   Subir una nueva foto de perfil mediante un `<input type="file">`.
    -   Previsualizar los cambios en tiempo real.

### Estado Global (`AuthStore`)

El `AuthStore` (basado en Zustand) mantiene el objeto `User` sincronizado. Cada vez que se actualiza el perfil, se llama a `setAuth(updatedUser)` para que todos los componentes (como el `Header`) reflejen los cambios instantáneamente sin necesidad de recargar la página.

## Estandarización de Nomenclatura

Siguiendo el estándar del proyecto, todos los atributos de las entidades y DTOs relacionados con esta feature utilizan `snake_case` (ej: `avatar_id`, `avatar_url`, `hashed_refresh_token`).
