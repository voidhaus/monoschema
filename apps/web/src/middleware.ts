import { NextResponse, NextRequest } from 'next/server';
import { GitHubAuthProvider } from '@voidhaus/cms-core';

export async function middleware(request: NextRequest) {
  // Store current request url in a custom header, which you can read later
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', new URL(request.url).pathname);

  // Check if this is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip auth check for login page and auth routes
    if (
      request.nextUrl.pathname === '/admin/login' ||
      request.nextUrl.pathname.startsWith('/api/auth/')
    ) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    }

    // Check for session cookie
    const sessionToken = request.cookies.get('cms_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Validate session if we have the required environment variables
      if (process.env.SESSION_SECRET) {
        const authProvider = new GitHubAuthProvider({
          githubClientId: process.env.GITHUB_CLIENT_ID!,
          githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
          githubOrganization: process.env.GITHUB_ORGANIZATION!,
          redirectUri: process.env.GITHUB_REDIRECT_URI!,
          sessionSecret: process.env.SESSION_SECRET!,
        });

        const session = await authProvider.validateSession(sessionToken);
        
        if (!session) {
          // Invalid session, redirect to login
          const response = NextResponse.redirect(new URL('/admin/login', request.url));
          response.cookies.delete('cms_session');
          return response;
        }

        // Add user info to headers for the route handlers
        requestHeaders.set('x-user-id', session.userId);
        requestHeaders.set('x-user-login', session.login);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      // In case of error, redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('cms_session');
      return response;
    }
  }

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
};