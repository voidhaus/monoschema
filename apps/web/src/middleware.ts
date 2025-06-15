import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Store current request url in a custom header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', new URL(request.url).pathname);

  console.log('Middleware triggered for:', request.nextUrl.pathname);

  // Check if this is an admin route OR a CMS API route that needs authentication
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/cms/')) {
    console.log('Processing admin/CMS route:', request.nextUrl.pathname);
    
    // Skip auth check ONLY for login page and auth API routes
    if (
      request.nextUrl.pathname === '/admin/login' ||
      request.nextUrl.pathname.startsWith('/api/auth/')
    ) {
      console.log('Skipping auth for:', request.nextUrl.pathname);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    }

    // Check if session is valid by attempting to validate it
    const sessionToken = request.cookies.get('cms_session')?.value;
    
    console.log('Middleware check:', {
      path: request.nextUrl.pathname,
      hasSessionCookie: !!sessionToken,
      sessionLength: sessionToken?.length || 0
    });
    
    if (!sessionToken) {
      console.log('No session token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // For admin pages, we need the token to exist
    // For API routes, we'll pass the token through and let them validate it
    if (request.nextUrl.pathname.startsWith('/admin') && sessionToken.trim() === '') {
      console.log('Empty session token, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    console.log('Session token found, allowing access');

    // Pass through the session token to API routes for validation
    if (request.nextUrl.pathname.startsWith('/api/cms/')) {
      console.log('Adding x-session-token header for API route');
      requestHeaders.set('x-session-token', sessionToken);
    }

    // Allow the request to continue
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
