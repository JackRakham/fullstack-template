# Sistema de Autenticación con Firebase (Google Auth Handshake)

Este sistema permite a los usuarios iniciar sesión utilizando sus cuentas de Google a través de Firebase, manteniendo el control total de la sesión en el backend local mediante un mecanismo de "handshake".

## Arquitectura

El flujo de autenticación sigue estos pasos:

1.  **Frontend (Firebase Client)**: El usuario hace clic en "Continuar con Google". Se abre un popup de Firebase que autentica al usuario con Google y devuelve un `idToken`.
2.  **Handshake**: El frontend envía este `idToken` al backend mediante el endpoint `POST /identity/auth/firebase`.
3.  **Backend (Firebase Admin)**: El backend utiliza el SDK de Firebase Admin para verificar la autenticidad del token.
4.  **Sincronización de Usuario**: 
    - Si el email del token ya existe en la base de datos, se recupera el usuario.
    - Si no existe, se crea un nuevo usuario con los datos de Firebase (nombre, email) y una contraseña aleatoria.
5.  **Emisión de JWT**: Una vez validada la identidad, el backend emite su propio par de tokens (Access Token + Refresh Token) y responde al frontend.
6.  **Sesión Local**: El frontend guarda los tokens del backend y procede con la sesión normal, ignorando el resto del ciclo de vida de Firebase.

## Configuración

### Backend (.env)

Es necesario configurar la Service Account de Firebase:

```env
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_AQUI\n-----END PRIVATE KEY-----\n"
```

### Frontend (.env)

Es necesario configurar las claves del cliente de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
```

## Componentes Clave

-   **Backend**: 
    -   `FirebaseService`: Inicializa el SDK Admin y verifica tokens.
    -   `AuthController.loginWithFirebase`: Endpoint expuesto para el handshake.
-   **Frontend**:
    -   `src/lib/firebase.ts`: Configuración del SDK cliente.
    -   `app/login/page.tsx`: Lógica de UI para disparar el popup y el intercambio.

## Seguridad

-   El sistema no confía ciegamente en el frontend; siempre verifica el token de Firebase contra los servidores de Google en cada login.
-   No se almacenan las contraseñas de Google; el acceso posterior siempre se gestiona mediante el JWT propio del sistema.
