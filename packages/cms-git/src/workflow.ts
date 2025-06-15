import { v4 as uuidv4 } from 'uuid';
import { SimpleGitRepository, GitHubAPI, GitConfig, GitHubConfig } from '@voidhaus/cms-core';

export interface WorkflowConfig {
  repositoryUrl: string;
  localBasePath: string;
  githubToken: string;
  owner: string;
  repo: string;
}

export interface ContentChange {
  filePath: string;
  content: string;
  action: 'create' | 'update' | 'delete';
}

export interface PublishOptions {
  createPullRequest?: boolean;
  pullRequestTitle?: string;
  pullRequestBody?: string;
  autoMerge?: boolean;
}

export class CMSWorkflow {
  private gitRepo: SimpleGitRepository;
  private githubAPI: GitHubAPI;
  private config: WorkflowConfig;
  private workspacePath: string;

  constructor(config: WorkflowConfig) {
    this.config = config;
    this.workspacePath = `${config.localBasePath}/${config.repo}`;

    const gitConfig: GitConfig = {
      repositoryUrl: config.repositoryUrl,
      localPath: this.workspacePath,
      accessToken: config.githubToken,
    };

    const githubConfig: GitHubConfig = {
      accessToken: config.githubToken,
      owner: config.owner,
      repo: config.repo,
    };

    this.gitRepo = new SimpleGitRepository(gitConfig);
    this.githubAPI = new GitHubAPI(githubConfig);
  }

  /**
   * Initialize the workspace by cloning the repository
   */
  async initialize(): Promise<void> {
    try {
      await this.gitRepo.clone();
    } catch (error) {
      // If clone fails, the repo might already exist
      console.warn('Clone failed, repository might already exist:', error);
    }
  }

  /**
   * Create a new content branch for editing
   */
  async createContentBranch(userId: string): Promise<string> {
    const timestamp = Date.now();
    const branchName = `cms/${userId}/${timestamp}`;
    
    await this.gitRepo.createBranch(branchName, 'main');
    return branchName;
  }

  /**
   * Apply content changes to the current branch
   */
  async applyChanges(
    changes: ContentChange[], 
    commitMessage: string, 
    author?: { name: string; email: string }
  ): Promise<string> {
    const changedFiles: string[] = [];

    for (const change of changes) {
      switch (change.action) {
        case 'create':
        case 'update':
          await this.gitRepo.writeFile(change.filePath, change.content);
          changedFiles.push(change.filePath);
          break;
        case 'delete':
          await this.gitRepo.deleteFile(change.filePath);
          changedFiles.push(change.filePath);
          break;
      }
    }

    const commitHash = await this.gitRepo.commit(commitMessage, changedFiles, author);
    return commitHash;
  }

  /**
   * Save changes as a draft (commit without publishing)
   */
  async saveDraft(
    userId: string,
    changes: ContentChange[],
    author: { name: string; email: string },
    message?: string
  ): Promise<{ branchName: string; commitHash: string }> {
    const branchName = await this.createContentBranch(userId);
    const commitMessage = message || `Draft: Content changes by ${userId}`;
    
    const commitHash = await this.applyChanges(changes, commitMessage, author);
    await this.gitRepo.push(branchName);

    return { branchName, commitHash };
  }

  /**
   * Publish changes to the main branch
   */
  async publishChanges(
    branchName: string,
    options: PublishOptions = {}
  ): Promise<{ success: boolean; pullRequestUrl?: string }> {
    await this.gitRepo.push(branchName);

    if (options.createPullRequest) {
      const pr = await this.githubAPI.createPullRequest(
        options.pullRequestTitle || 'CMS Content Update',
        options.pullRequestBody || 'Automated content update from CMS',
        branchName,
        'main'
      );

      if (options.autoMerge) {
        // Wait a moment for PR to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.githubAPI.mergePullRequest(pr.number);
        await this.gitRepo.deleteBranch(branchName);
        return { success: true, pullRequestUrl: pr.url };
      }

      return { success: true, pullRequestUrl: pr.url };
    } else {
      // Direct merge to main
      await this.gitRepo.mergeBranch(branchName, 'main');
      await this.gitRepo.push('main');
      await this.gitRepo.deleteBranch(branchName);
      return { success: true };
    }
  }

  /**
   * Get file content from a specific branch
   */
  async getFileContent(filePath: string, branch = 'main'): Promise<string> {
    return await this.gitRepo.getFileContent(filePath, branch);
  }

  /**
   * List all content files in the docs directory
   */
  async listContentFiles(directory = 'docs', branch = 'main'): Promise<string[]> {
    // This would need additional implementation to list files recursively
    // For now, return an empty array
    return [];
  }

  /**
   * Get the current status of the working directory
   */
  async getStatus(): Promise<{
    currentBranch: string;
    changedFiles: string[];
    isClean: boolean;
  }> {
    const currentBranch = await this.gitRepo.getCurrentBranch();
    const changedFiles = await this.gitRepo.getChangedFiles();
    const isClean = await this.gitRepo.isClean();

    return {
      currentBranch,
      changedFiles,
      isClean,
    };
  }

  /**
   * Switch to a different branch
   */
  async switchToBranch(branchName: string): Promise<void> {
    await this.gitRepo.switchBranch(branchName);
  }

  /**
   * Get list of available branches
   */
  async getBranches(): Promise<string[]> {
    return await this.gitRepo.getBranches();
  }

  /**
   * Clean up old content branches
   */
  async cleanupOldBranches(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const branches = await this.gitRepo.getBranches();
    const cmsBranches = branches.filter(branch => branch.startsWith('cms/'));

    for (const branch of cmsBranches) {
      // Extract timestamp from branch name (cms/userId/timestamp)
      const parts = branch.split('/');
      if (parts.length >= 3 && parts[2]) {
        const timestamp = parseInt(parts[2]);
        if (!isNaN(timestamp) && Date.now() - timestamp > maxAge) {
          try {
            await this.gitRepo.deleteBranch(branch);
          } catch (error) {
            console.warn(`Failed to delete old branch ${branch}:`, error);
          }
        }
      }
    }
  }

  /**
   * Create a preview of changes without committing
   */
  async previewChanges(changes: ContentChange[]): Promise<Map<string, string>> {
    const previews = new Map<string, string>();

    for (const change of changes) {
      if (change.action === 'delete') {
        previews.set(change.filePath, '<!-- File will be deleted -->');
      } else {
        previews.set(change.filePath, change.content);
      }
    }

    return previews;
  }
}
