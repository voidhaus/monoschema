import { z } from 'zod';

export const GitHubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  avatar_url: z.string(),
});

export const GitHubOrgMembershipSchema = z.object({
  organization: z.object({
    login: z.string(),
    id: z.number(),
  }),
  user: GitHubUserSchema,
  role: z.enum(['admin', 'member']),
  state: z.enum(['active', 'pending']),
});

export const CMSSessionSchema = z.object({
  userId: z.string(),
  githubId: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  avatar_url: z.string(),
  accessToken: z.string(),
  organizations: z.array(z.string()),
  permissions: z.object({
    canEdit: z.boolean(),
    canPublish: z.boolean(),
    canAdmin: z.boolean(),
  }),
  expiresAt: z.number(),
});

export type GitHubUser = z.infer<typeof GitHubUserSchema>;
export type GitHubOrgMembership = z.infer<typeof GitHubOrgMembershipSchema>;
export type CMSSession = z.infer<typeof CMSSessionSchema>;

export interface AuthConfig {
  githubClientId: string;
  githubClientSecret: string;
  githubOrganization: string;
  redirectUri: string;
  sessionSecret: string;
}

export interface AuthProvider {
  exchangeCodeForToken(code: string): Promise<string>;
  getUserInfo(accessToken: string): Promise<GitHubUser>;
  getOrganizationMembership(accessToken: string, org: string, username: string): Promise<GitHubOrgMembership | null>;
  validateSession(sessionToken: string): Promise<CMSSession | null>;
  createSession(user: GitHubUser, accessToken: string, organizations: string[]): Promise<string>;
  revokeSession(sessionToken: string): Promise<void>;
}
