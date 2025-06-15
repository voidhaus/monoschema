import { NextRequest, NextResponse } from 'next/server';
import { CMSWorkflow } from '@voidhaus/cms-git';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-login');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize workflow
    const workflow = new CMSWorkflow({
      repositoryUrl: process.env.GITHUB_REPOSITORY_URL || `https://github.com/${process.env.GITHUB_REPOSITORY}`,
      localBasePath: process.env.CMS_WORKSPACE_PATH || '/tmp/cms-workspace',
      githubToken: process.env.GITHUB_TOKEN!,
      owner: process.env.GITHUB_REPOSITORY?.split('/')[0] || '',
      repo: process.env.GITHUB_REPOSITORY?.split('/')[1] || '',
      author: {
        name: userId,
        email: `${userId}@users.noreply.github.com`,
      },
    });

    await workflow.initialize();
    const status = await workflow.getStatus();
    const branches = await workflow.getBranches();

    return NextResponse.json({
      status,
      branches: branches.filter(branch => branch.startsWith('cms/') || branch === 'main'),
      user: userId,
    });
  } catch (error) {
    console.error('CMS status error:', error);
    return NextResponse.json({ error: 'Failed to get CMS status' }, { status: 500 });
  }
}
