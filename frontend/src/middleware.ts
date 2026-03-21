import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Lista de rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/admin', '/settings'];
  // Lista de rutas públicas donde no debería estar un usuario logueado
  const publicOnlyRoutes = ['/login', '/register'];

  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isAuthenticated = !!authToken || !!refreshToken;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.some((route) => pathname.startsWith(route));

  // Si trata de entrar a ruta protegida y no tiene tokens
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si trata de entrar al login pero ya está autenticado
  if (isPublicOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configuración opcional para ignorar rutas estáticas de Next.js
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
