import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { CMSWorkflow } from '@voidhaus/cms-git';
import { CMSConfig } from '../types.js';

export interface CMSHandlers {
  status: (request: NextRequest) => Promise<NextResponse>;
  content: {
    get: (request: NextRequest) => Promise<NextResponse>;
    post: (request: NextRequest) => Promise<NextResponse>;
  };
  publish: (request: NextRequest) => Promise<NextResponse>;
}

export function createCMSHandlers(config: CMSConfig): CMSHandlers {
  const createWorkflow = async (userId: string) => {
    const repoParts = config.githubRepository.split('/');
    if (repoParts.length !== 2) {
      throw new Error('GitHub repository must be in format "owner/repo"');
    }
    const [owner, repo] = repoParts;
    
    return new CMSWorkflow({
      repositoryUrl: config.repositoryUrl || `https://github.com/${config.githubRepository}`,
      localBasePath: config.workspacePath || '/tmp/cms-workspace',
      githubToken: config.githubToken,
      owner: owner!,
      repo: repo!,
      author: {
        name: userId,
        email: `${userId}@users.noreply.github.com`,
      },
    });
  };

  const status = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const headersList = await headers();
      const userId = headersList.get('x-user-login');
      
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const workflow = await createWorkflow(userId);
      await workflow.initialize();
      const status = await workflow.getStatus();
      const branches = await workflow.getBranches();

      return NextResponse.json({
        repositoryUrl: config.repositoryUrl || `https://github.com/${config.githubRepository}`,
        currentBranch: status.currentBranch,
        branches: branches.filter(branch => branch.startsWith('cms/') || branch === 'main'),
        user: userId,
        hasUncommittedChanges: !status.isClean,
      });
    } catch (error) {
      console.error('CMS status error:', error);
      return NextResponse.json({ error: 'Failed to get CMS status' }, { status: 500 });
    }
  };

  const getContent = async (request: NextRequest): Promise<NextResponse> => {
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

      const workflow = await createWorkflow(userId);
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
  };

  const postContent = async (request: NextRequest): Promise<NextResponse> => {
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

      const workflow = await createWorkflow(userId);
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
  };

  const publish = async (request: NextRequest): Promise<NextResponse> => {
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

      const workflow = await createWorkflow(userId);
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
  };

  return {
    status,
    content: {
      get: getContent,
      post: postContent,
    },
    publish,
  };
}
