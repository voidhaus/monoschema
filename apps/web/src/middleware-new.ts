import { NextRequest } from 'next/server';
import { createCMSMiddleware } from '@voidhaus/cms-nextjs';

const cmsMiddleware = createCMSMiddleware({
  config: {
    githubClientId: process.env.GITHUB_CLIENT_ID!,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
    githubOrganization: process.env.GITHUB_ORGANIZATION!,
    githubRepository: process.env.GITHUB_REPOSITORY!,
    githubToken: process.env.GITHUB_TOKEN!,
    sessionSecret: process.env.SESSION_SECRET!,
    redirectUri: process.env.GITHUB_REDIRECT_URI!,
    workspacePath: process.env.CMS_WORKSPACE_PATH,
    repositoryUrl: process.env.GITHUB_REPOSITORY_URL,
  },
  basePath: '/admin',
  publicPaths: ['/login', '/api/auth/login', '/api/auth/callback'],
});

export async function middleware(request: NextRequest) {
  // Check if this is an admin route using the new package
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return cmsMiddleware(request);
  }

  // For other routes, you can add your existing middleware logic here
  return;
}
