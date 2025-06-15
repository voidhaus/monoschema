import { ReactNode } from 'react';

export interface CMSConfig {
  // GitHub OAuth
  githubClientId: string;
  githubClientSecret: string;
  githubOrganization: string;
  
  // Repository
  githubRepository: string; // Format: "owner/repo"
  githubToken: string;
  
  // Security
  sessionSecret: string;
  redirectUri: string;
  
  // Optional
  workspacePath?: string;
  repositoryUrl?: string;
}

export interface CMSHandlerOptions {
  config: CMSConfig;
  basePath?: string; // Default: '/admin'
}

export interface CMSStatus {
  repositoryUrl: string;
  currentBranch: string;
  branches: string[];
  user: string;
  hasUncommittedChanges?: boolean;
}

export interface AuthUser {
  id: string;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

// Component Props
export interface AdminLayoutProps {
  children: ReactNode;
  basePath?: string;
  logoutEndpoint?: string;
}

export interface AdminLoginProps {
  basePath?: string;
  loginEndpoint?: string;
  organizationName?: string;
}

export interface AdminDashboardProps {
  basePath?: string;
  organizationName?: string;
}

export interface ContentBrowserProps {
  basePath?: string;
  statusEndpoint?: string;
}

export interface ContentEditorProps {
  basePath?: string;
  statusEndpoint?: string;
  contentEndpoint?: string;
  publishEndpoint?: string;
}
