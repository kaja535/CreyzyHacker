import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'

export function middleware(request: NextRequest) {
  // Polici i butë: Shikon vetëm nëse ekziston një "token" (çelës) në cookies
  // Nuk pyet serverin e Supabase (që mos të lodhë Vercelin), thjesht shikon prezencën
  const authCookie = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token');

  const { pathname } = request.nextUrl;

  // Nëse dikush tenton të hyjë te dashboard pa biskotë (token), e nisim te login
  if (!authCookie && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Nëse është i loguar dhe tenton të shkojë te login, e nisim te dashboard
  if (authCookie && pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

