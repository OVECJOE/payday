import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS_TOKEN_KEY = 'payday_access_token';
const REFRESH_TOKEN_KEY = 'payday_refresh_token';
const USER_KEY = 'payday_user';

const publicRoutes = ['/login', '/register', '/forgot-password'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;
  const user = request.cookies.get(USER_KEY)?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isRefreshTokenRoute = pathname.startsWith('/refresh-token');

  if (isPublicRoute) {
    if (isAuthRoute && accessToken && user && refreshToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isRefreshTokenRoute) {
    if (!refreshToken || !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (accessToken) {
      const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard';
      try {
        return NextResponse.redirect(new URL(returnTo, request.url));
      } catch {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  if (isDashboardRoute) {
    if (!accessToken || !user) {
      if (refreshToken) {
        const returnTo = encodeURIComponent(pathname + request.nextUrl.search);
        return NextResponse.redirect(
          new URL(`/refresh-token?returnTo=${returnTo}`, request.url),
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|icon.tsx|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
