import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { SignJWT, jwtVerify } from 'jose';
import { AuthProvider, AuthConfig, GitHubUser, GitHubOrgMembership, CMSSession } from './types.js';

export class GitHubAuthProvider implements AuthProvider {
  private config: AuthConfig;
  private secretKey: Uint8Array;

  constructor(config: AuthConfig) {
    this.config = config;
    this.secretKey = new TextEncoder().encode(config.sessionSecret);
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const auth = createOAuthAppAuth({
      clientId: this.config.githubClientId,
      clientSecret: this.config.githubClientSecret,
    });

    const tokenAuth = await auth({
      type: 'oauth-user',
      code,
      redirectUrl: this.config.redirectUri,
    });

    return tokenAuth.token;
  }

  async getUserInfo(accessToken: string): Promise<GitHubUser> {
    const octokit = new Octokit({
      auth: accessToken,
    });

    const { data } = await octokit.rest.users.getAuthenticated();
    return {
      id: data.id,
      login: data.login,
      name: data.name,
      email: data.email,
      avatar_url: data.avatar_url,
    };
  }

  async getOrganizationMembership(
    accessToken: string,
    org: string,
    username: string
  ): Promise<GitHubOrgMembership | null> {
    const octokit = new Octokit({
      auth: accessToken,
    });

    try {
      const { data } = await octokit.rest.orgs.getMembershipForUser({
        org,
        username,
      });

      return {
        organization: data.organization,
        user: {
          id: data.user!.id,
          login: data.user!.login,
          name: data.user!.name ?? null,
          email: data.user!.email ?? null,
          avatar_url: data.user!.avatar_url,
        },
        role: data.role as 'admin' | 'member',
        state: data.state as 'active' | 'pending',
      };
    } catch (error) {
      // User is not a member of the organization
      if (error instanceof Error && 'status' in error && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async validateSession(sessionToken: string): Promise<CMSSession | null> {
    try {
      const { payload } = await jwtVerify(sessionToken, this.secretKey);
      
      // Check if session is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return null;
      }

      return payload as CMSSession;
    } catch {
      return null;
    }
  }

  async createSession(user: GitHubUser, accessToken: string, organizations: string[]): Promise<string> {
    const session: CMSSession = {
      userId: `github:${user.id}`,
      githubId: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      accessToken,
      organizations,
      permissions: {
        canEdit: organizations.includes(this.config.githubOrganization),
        canPublish: organizations.includes(this.config.githubOrganization),
        canAdmin: false, // TODO: Implement admin role detection
      },
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };

    const jwt = await new SignJWT(session as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(this.secretKey);

    return jwt;
  }

  async revokeSession(sessionToken: string): Promise<void> {
    // For JWT tokens, we don't need to do anything server-side
    // The client should delete the token
    // In a production system, you might want to maintain a blacklist
  }

  /**
   * Get the GitHub OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.githubClientId,
      redirect_uri: this.config.redirectUri,
      scope: 'read:org,user:email',
      ...(state && { state }),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Complete the OAuth flow and create a session
   */
  async handleCallback(code: string): Promise<{ sessionToken: string; user: GitHubUser }> {
    // Exchange code for access token
    const accessToken = await this.exchangeCodeForToken(code);

    // Get user information
    const user = await this.getUserInfo(accessToken);

    // Check organization membership
    const membership = await this.getOrganizationMembership(
      accessToken,
      this.config.githubOrganization,
      user.login
    );

    if (!membership || membership.state !== 'active') {
      throw new Error('User is not an active member of the required organization');
    }

    // Get all user organizations (for future use)
    const octokit = new Octokit({ auth: accessToken });
    const { data: orgs } = await octokit.rest.orgs.listForAuthenticatedUser();
    const organizations = orgs.map(org => org.login);

    // Create session
    const sessionToken = await this.createSession(user, accessToken, organizations);

    return { sessionToken, user };
  }
}
