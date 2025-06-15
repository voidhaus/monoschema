import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GitHubAuthProvider } from '@voidhaus/cms-core';
import { CMSConfig } from '../types.js';

export interface AuthHandlers {
  login: (request: NextRequest) => Promise<NextResponse>;
  callback: (request: NextRequest) => Promise<NextResponse>;
  logout: (request: NextRequest) => Promise<NextResponse>;
}

export function createAuthHandlers(config: CMSConfig): AuthHandlers {
  const authProvider = new GitHubAuthProvider({
    githubClientId: config.githubClientId,
    githubClientSecret: config.githubClientSecret,
    githubOrganization: config.githubOrganization,
    redirectUri: config.redirectUri,
    sessionSecret: config.sessionSecret,
  });

  const login = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authUrl = authProvider.getAuthorizationUrl();
      return NextResponse.redirect(authUrl);
    } catch (error) {
      console.error('Login route error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const callback = async (request: NextRequest): Promise<NextResponse> => {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const basePath = searchParams.get('basePath') || '/admin';

    if (error) {
      return NextResponse.redirect(new URL(`${basePath}/login?error=access_denied`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL(`${basePath}/login?error=missing_code`, request.url));
    }

    try {
      const { sessionToken, user } = await authProvider.handleCallback(code);

      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set('cms_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      return NextResponse.redirect(new URL(basePath, request.url));
    } catch (error) {
      console.error('Auth callback error:', error);
      const errorMessage = error instanceof Error ? error.message : 'auth_failed';
      return NextResponse.redirect(new URL(`${basePath}/login?error=${errorMessage}`, request.url));
    }
  };

  const logout = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const cookieStore = await cookies();
      cookieStore.delete('cms_session');

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
    }
  };

  return { login, callback, logout };
}
