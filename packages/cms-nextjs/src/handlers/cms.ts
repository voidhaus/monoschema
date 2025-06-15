import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';
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

// Utility function to decode JWT token and extract user info
async function getUserFromToken(config: CMSConfig): Promise<{ userId: string; login: string } | null> {
  try {
    const headersList = await headers();
    const sessionToken = headersList.get('x-session-token');
    
    console.log('CMS Handler: Getting user from token');
    console.log('CMS Handler: Session token present:', !!sessionToken);
    console.log('CMS Handler: Session token length:', sessionToken?.length || 0);
    
    if (!sessionToken) {
      console.log('CMS Handler: No session token found in headers');
      return null;
    }

    // Decode the JWT token using the same secret as the auth provider
    const secretKey = new TextEncoder().encode(config.sessionSecret);
    const { payload } = await jwtVerify(sessionToken, secretKey);
    
    console.log('CMS Handler: JWT payload:', payload);
    
    // Extract user information from the JWT payload
    const session = payload as any;
    
    if (!session.login || !session.githubId) {
      console.log('CMS Handler: Invalid session payload:', session);
      return null;
    }

    console.log('CMS Handler: Successfully extracted user:', { userId: session.githubId.toString(), login: session.login });
    
    return {
      userId: session.githubId.toString(),
      login: session.login
    };
  } catch (error) {
    console.error('CMS Handler: Error decoding JWT token:', error);
    return null;
  }
}

export function createCMSHandlers(config: CMSConfig): CMSHandlers {
  const createWorkflow = async (userId: string) => {
    const repoParts = config.githubRepository.split('/');
    if (repoParts.length !== 2) {
      throw new Error('GitHub repository must be in format "owner/repo"');
    }
    const [owner, repo] = repoParts;
    
    // Create a user-specific workspace path using OS temp directory
    const os = await import('os');
    const path = await import('path');
    const defaultWorkspace = path.join(os.tmpdir(), 'cms-workspace', `${userId}-${repo}`);
    
    return new CMSWorkflow({
      repositoryUrl: config.repositoryUrl || `https://github.com/${config.githubRepository}`,
      localBasePath: config.workspacePath || defaultWorkspace,
      githubToken: config.githubToken,
      owner: owner!,
      repo: repo!,
    });
  };

  const status = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await getUserFromToken(config);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const workflow = await createWorkflow(user.userId);
      await workflow.initialize();
      const status = await workflow.getStatus();
      const branches = await workflow.getBranches();

      return NextResponse.json({
        repositoryUrl: config.repositoryUrl || `https://github.com/${config.githubRepository}`,
        currentBranch: status.currentBranch,
        branches: branches.filter(branch => branch.startsWith('cms/') || branch === 'main'),
        user: user.login,
        hasUncommittedChanges: !status.isClean,
      });
    } catch (error) {
      console.error('Status route error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const getContent = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const filePath = searchParams.get('path');
      const branch = searchParams.get('branch') || 'main';
      
      const user = await getUserFromToken(config);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!filePath) {
        return NextResponse.json({ error: 'File path is required' }, { status: 400 });
      }

      const workflow = await createWorkflow(user.userId);
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
      const user = await getUserFromToken(config);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { filePath, content, message } = body;

      if (!filePath || content === undefined) {
        return NextResponse.json({ error: 'File path and content are required' }, { status: 400 });
      }

      const workflow = await createWorkflow(user.userId);
      await workflow.initialize();

      // Save as draft with author information
      const result = await workflow.saveDraft(
        user.userId, 
        [
          {
            filePath,
            content,
            action: 'update',
          }
        ], 
        {
          name: user.login,
          email: `${user.login}@users.noreply.github.com`,
        },
        message || `Update ${filePath}`
      );

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
      const user = await getUserFromToken(config);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { branchName, createPullRequest = true, autoMerge = false } = body;

      if (!branchName) {
        return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });
      }

      const workflow = await createWorkflow(user.userId);
      await workflow.initialize();

      // Switch to the branch and publish
      await workflow.switchToBranch(branchName);

      const result = await workflow.publishChanges(branchName, {
        createPullRequest,
        autoMerge,
        pullRequestTitle: `Content update by ${user.login}`,
        pullRequestBody: `Automated content update from CMS by ${user.login}`,
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
