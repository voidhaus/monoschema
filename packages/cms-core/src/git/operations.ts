import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { GitRepository, GitConfig, CommitInfo, BranchInfo } from './types.js';

export class SimpleGitRepository implements GitRepository {
  private git: SimpleGit;
  private config: GitConfig;

  constructor(config: GitConfig) {
    this.config = config;
    this.git = simpleGit({
      baseDir: config.localPath,
      binary: 'git',
      maxConcurrentProcesses: 1,
    });
  }

  async clone(): Promise<void> {
    // Ensure the directory exists
    await fs.mkdir(dirname(this.config.localPath), { recursive: true });

    // Clone with authentication
    const repoUrlWithAuth = this.config.repositoryUrl.replace(
      'https://github.com/',
      `https://${this.config.accessToken}@github.com/`
    );

    await this.git.clone(repoUrlWithAuth, this.config.localPath, [
      '--depth=1', // Shallow clone for better performance
    ]);

    // Configure git user
    await this.git.addConfig('user.name', this.config.author.name);
    await this.git.addConfig('user.email', this.config.author.email);
  }

  async createBranch(branchName: string, baseBranch = 'main'): Promise<void> {
    // Ensure we're on the base branch
    await this.switchBranch(baseBranch);
    await this.pull(baseBranch);

    // Create and switch to new branch
    await this.git.checkoutLocalBranch(branchName);
  }

  async switchBranch(branchName: string): Promise<void> {
    const branches = await this.getBranches();
    
    if (branches.includes(branchName)) {
      await this.git.checkout(branchName);
    } else {
      // Try to checkout remote branch
      await this.git.checkout(['-b', branchName, `origin/${branchName}`]);
    }
  }

  async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    return status.current || 'unknown';
  }

  async commit(message: string, files: string[]): Promise<string> {
    // Add files to staging area
    for (const file of files) {
      await this.git.add(file);
    }

    // Commit changes
    const result = await this.git.commit(message);
    return result.commit;
  }

  async push(branch?: string): Promise<void> {
    const targetBranch = branch || await this.getCurrentBranch();
    
    // Set up remote tracking if it doesn't exist
    try {
      await this.git.push('origin', targetBranch);
    } catch (error) {
      // If push fails, try setting upstream
      await this.git.push(['-u', 'origin', targetBranch]);
    }
  }

  async pull(branch?: string): Promise<void> {
    if (branch) {
      await this.git.pull('origin', branch);
    } else {
      await this.git.pull();
    }
  }

  async getBranches(): Promise<string[]> {
    const summary = await this.git.branch(['-a']);
    return summary.all.map(branch => branch.replace('remotes/origin/', ''));
  }

  async getFileContent(filePath: string, branch?: string): Promise<string> {
    if (branch) {
      return await this.git.show([`${branch}:${filePath}`]);
    } else {
      const fullPath = join(this.config.localPath, filePath);
      try {
        return await fs.readFile(fullPath, 'utf-8');
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          throw new Error(`File not found: ${filePath}`);
        }
        throw error;
      }
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = join(this.config.localPath, filePath);
    
    // Ensure directory exists
    await fs.mkdir(dirname(fullPath), { recursive: true });
    
    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = join(this.config.localPath, filePath);
    await fs.unlink(fullPath);
    await this.git.rm(filePath);
  }

  async getChangedFiles(): Promise<string[]> {
    const status = await this.git.status();
    return [
      ...status.created,
      ...status.modified,
      ...status.deleted,
      ...status.renamed.map(r => r.to),
    ];
  }

  async mergeBranch(sourceBranch: string, targetBranch: string): Promise<void> {
    await this.switchBranch(targetBranch);
    await this.pull(targetBranch);
    await this.git.merge([sourceBranch]);
  }

  async deleteBranch(branchName: string): Promise<void> {
    const currentBranch = await this.getCurrentBranch();
    
    if (currentBranch === branchName) {
      await this.switchBranch('main');
    }

    await this.git.deleteLocalBranch(branchName);
    
    // Also delete remote branch if it exists
    try {
      await this.git.push(['origin', '--delete', branchName]);
    } catch {
      // Ignore if remote branch doesn't exist
    }
  }

  async getBranchInfo(): Promise<BranchInfo[]> {
    const branches = await this.git.branch(['-a']);
    const currentBranch = await this.getCurrentBranch();

    return branches.all.map(branch => ({
      name: branch.replace('remotes/origin/', ''),
      isRemote: branch.startsWith('remotes/'),
      isCurrent: branch === currentBranch,
    }));
  }

  async getCommitHistory(branch?: string, limit = 10): Promise<CommitInfo[]> {
    const log = await this.git.log({
      from: branch,
      maxCount: limit,
    });

    return log.all.map(commit => ({
      hash: commit.hash,
      message: commit.message,
      author: `${commit.author_name} <${commit.author_email}>`,
      date: new Date(commit.date),
      files: [], // Would need additional call to get files
    }));
  }

  /**
   * Clean the working directory
   */
  async clean(): Promise<void> {
    await this.git.clean(CleanOptions.FORCE + CleanOptions.RECURSIVE);
  }

  /**
   * Reset to a specific commit
   */
  async reset(commit: string, hard = false): Promise<void> {
    if (hard) {
      await this.git.reset(['--hard', commit]);
    } else {
      await this.git.reset([commit]);
    }
  }

  /**
   * Check if repository is clean (no uncommitted changes)
   */
  async isClean(): Promise<boolean> {
    const status = await this.git.status();
    return status.isClean();
  }
}
