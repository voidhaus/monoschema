import { createCMSRouter } from '@voidhaus/cms-nextjs/server';

const cmsRouter = createCMSRouter({
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
});

export const GET = cmsRouter.GET;
export const POST = cmsRouter.POST;
