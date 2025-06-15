import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Store current request url in a custom header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', new URL(request.url).pathname);

  // Check if this is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip auth check for login page and auth API routes
    if (
      request.nextUrl.pathname === '/admin/login' ||
      request.nextUrl.pathname.startsWith('/api/auth/') ||
      request.nextUrl.pathname.startsWith('/api/cms/')
    ) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    }

    // Simple session check - just verify cookie exists
    // Detailed validation will happen in API routes
    const sessionToken = request.cookies.get('cms_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Allow the request to continue - API routes will do detailed validation
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  // For non-admin routes, just continue
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
