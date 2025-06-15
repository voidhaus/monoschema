import { NextRequest, NextResponse } from 'next/server';
import { CMSConfig } from '../types.js';

export interface CMSMiddlewareOptions {
  config: CMSConfig;
  protectedPaths?: string[];
}

export function createCMSMiddleware(options: CMSMiddlewareOptions) {
  const { config, protectedPaths = ['/admin'] } = options;

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if this is a protected path
    const isProtectedPath = protectedPaths.some(path => 
      pathname.startsWith(path)
    );

    if (!isProtectedPath) {
      return NextResponse.next();
    }

    // Check for authentication token in cookies
    const token = request.cookies.get('cms-auth-token')?.value;
    
    if (!token) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // TODO: Validate token with GitHub API or session store
    // For now, assume valid token means authenticated
    
    return NextResponse.next();
  };
}