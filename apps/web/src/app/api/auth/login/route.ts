import { NextRequest, NextResponse } from 'next/server';
import { GitHubAuthProvider } from '@voidhaus/cms-core';

export async function GET(request: NextRequest) {
  try {
    const authProvider = new GitHubAuthProvider({
      githubClientId: process.env.GITHUB_CLIENT_ID!,
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
      githubOrganization: process.env.GITHUB_ORGANIZATION!,
      redirectUri: process.env.GITHUB_REDIRECT_URI!,
      sessionSecret: process.env.SESSION_SECRET!,
    });

    const authUrl = authProvider.getAuthorizationUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
