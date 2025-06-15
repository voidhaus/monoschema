import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { GitHubAuthProvider } from '@voidhaus/cms-core';
import { CMSConfig } from '../types.js';

export async function getCurrentUser(config: CMSConfig) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('cms_session')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const authProvider = new GitHubAuthProvider({
      githubClientId: config.githubClientId,
      githubClientSecret: config.githubClientSecret,
      githubOrganization: config.githubOrganization,
      redirectUri: config.redirectUri,
      sessionSecret: config.sessionSecret,
    });

    const session = await authProvider.validateSession(sessionToken);
    
    if (!session) {
      return null;
    }

    // Return user info from session
    return {
      id: session.githubId.toString(),
      login: session.login,
      name: session.name || '',
      email: session.email || '',
      avatar_url: session.avatar_url,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function requireAuth(config: CMSConfig, basePath = '/admin') {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('cms_session')?.value;

  if (!sessionToken) {
    redirect(`${basePath}/login`);
  }

  try {
    const authProvider = new GitHubAuthProvider({
      githubClientId: config.githubClientId,
      githubClientSecret: config.githubClientSecret,
      githubOrganization: config.githubOrganization,
      redirectUri: config.redirectUri,
      sessionSecret: config.sessionSecret,
    });

    const session = await authProvider.validateSession(sessionToken);
    
    if (!session) {
      redirect(`${basePath}/login`);
    }

    return session;
  } catch (error) {
    console.error('Auth validation error:', error);
    redirect(`${basePath}/login`);
  }
}
