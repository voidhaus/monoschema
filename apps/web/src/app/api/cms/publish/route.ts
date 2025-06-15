import { NextRequest, NextResponse } from 'next/server';
import { CMSWorkflow } from '@voidhaus/cms-git';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-login');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { branchName, createPullRequest = true, autoMerge = false } = body;

    if (!branchName) {
      return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });
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

    // Switch to the branch and publish
    await workflow.switchToBranch(branchName);

    const result = await workflow.publishChanges(branchName, {
      createPullRequest,
      autoMerge,
      pullRequestTitle: `Content update by ${userId}`,
      pullRequestBody: `Automated content update from CMS by ${userId}`,
    });

    return NextResponse.json({
      success: result.success,
      pullRequestUrl: result.pullRequestUrl,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to publish content' 
    }, { status: 500 });
  }
}
