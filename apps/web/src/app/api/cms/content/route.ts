import { NextRequest, NextResponse } from 'next/server';
import { CMSWorkflow } from '@voidhaus/cms-git';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const branch = searchParams.get('branch') || 'main';
    
    const headersList = await headers();
    const userId = headersList.get('x-user-login');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
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
    const content = await workflow.getFileContent(filePath, branch);

    return NextResponse.json({
      filePath,
      branch,
      content,
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch content' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-login');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { filePath, content, message } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json({ error: 'File path and content are required' }, { status: 400 });
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

    // Save as draft
    const result = await workflow.saveDraft(userId, [
      {
        filePath,
        content,
        action: 'update',
      }
    ], message || `Update ${filePath}`);

    return NextResponse.json({
      success: true,
      branchName: result.branchName,
      commitHash: result.commitHash,
    });
  } catch (error) {
    console.error('Content save error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save content' 
    }, { status: 500 });
  }
}
