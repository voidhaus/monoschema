import { NextRequest, NextResponse } from 'next/server';
import { GitHubAuthProvider } from '@voidhaus/cms-core';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/admin/login?error=access_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/login?error=missing_code', request.url));
  }

  try {
    const authProvider = new GitHubAuthProvider({
      githubClientId: process.env.GITHUB_CLIENT_ID!,
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
      githubOrganization: process.env.GITHUB_ORGANIZATION!,
      redirectUri: process.env.GITHUB_REDIRECT_URI!,
      sessionSecret: process.env.SESSION_SECRET!,
    });

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

    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'auth_failed';
    return NextResponse.redirect(new URL(`/admin/login?error=${errorMessage}`, request.url));
  }
}
