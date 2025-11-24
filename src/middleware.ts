import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt_token')
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/forgot-password', '/reset-password', '/terms']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If trying to access protected route without token
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If trying to access auth pages with token
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - docs/ (public documents)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|docs/).*)',
  ],
}

