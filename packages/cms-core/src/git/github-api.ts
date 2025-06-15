import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
  accessToken: string;
  owner: string;
  repo: string;
}

export interface PullRequestInfo {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  merged: boolean;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  url: string;
}

export class GitHubAPI {
  private octokit: Octokit;
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.accessToken,
    });
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    title: string,
    body: string,
    head: string,
    base = 'main'
  ): Promise<PullRequestInfo> {
    const { data } = await this.octokit.rest.pulls.create({
      owner: this.config.owner,
      repo: this.config.repo,
      title,
      body,
      head,
      base,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body || '',
      state: data.state as 'open' | 'closed',
      merged: data.merged || false,
      head: {
        ref: data.head.ref,
        sha: data.head.sha,
      },
      base: {
        ref: data.base.ref,
        sha: data.base.sha,
      },
      url: data.html_url,
    };
  }

  /**
   * Get pull request information
   */
  async getPullRequest(pullNumber: number): Promise<PullRequestInfo> {
    const { data } = await this.octokit.rest.pulls.get({
      owner: this.config.owner,
      repo: this.config.repo,
      pull_number: pullNumber,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body || '',
      state: data.state as 'open' | 'closed',
      merged: (data as any).merged || false,
      head: {
        ref: data.head.ref,
        sha: data.head.sha,
      },
      base: {
        ref: data.base.ref,
        sha: data.base.sha,
      },
      url: data.html_url,
    };
  }

  /**
   * Merge a pull request
   */
  async mergePullRequest(
    pullNumber: number,
    commitTitle?: string,
    commitMessage?: string,
    mergeMethod: 'merge' | 'squash' | 'rebase' = 'squash'
  ): Promise<void> {
    await this.octokit.rest.pulls.merge({
      owner: this.config.owner,
      repo: this.config.repo,
      pull_number: pullNumber,
      commit_title: commitTitle,
      commit_message: commitMessage,
      merge_method: mergeMethod,
    });
  }

  /**
   * List pull requests
   */
  async listPullRequests(state: 'open' | 'closed' | 'all' = 'open'): Promise<PullRequestInfo[]> {
    const { data } = await this.octokit.rest.pulls.list({
      owner: this.config.owner,
      repo: this.config.repo,
      state,
    });

    return data.map(pr => ({
      number: pr.number,
      title: pr.title,
      body: pr.body || '',
      state: pr.state as 'open' | 'closed',
      merged: (pr as any).merged || false,
      head: {
        ref: pr.head.ref,
        sha: pr.head.sha,
      },
      base: {
        ref: pr.base.ref,
        sha: pr.base.sha,
      },
      url: pr.html_url,
    }));
  }

  /**
   * Get file content from GitHub
   */
  async getFileContent(path: string, ref = 'main'): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref,
      });

      if ('content' in data && typeof data.content === 'string') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      throw new Error('File content not found or is a directory');
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) {
        throw new Error(`File not found: ${path}`);
      }
      throw error;
    }
  }

  /**
   * Create or update a file on GitHub
   */
  async createOrUpdateFile(
    path: string,
    content: string,
    message: string,
    branch = 'main',
    sha?: string
  ): Promise<void> {
    const contentBase64 = Buffer.from(content, 'utf-8').toString('base64');

    await this.octokit.rest.repos.createOrUpdateFileContents({
      owner: this.config.owner,
      repo: this.config.repo,
      path,
      message,
      content: contentBase64,
      branch,
      ...(sha && { sha }),
    });
  }

  /**
   * Delete a file on GitHub
   */
  async deleteFile(path: string, message: string, sha: string, branch = 'main'): Promise<void> {
    await this.octokit.rest.repos.deleteFile({
      owner: this.config.owner,
      repo: this.config.repo,
      path,
      message,
      sha,
      branch,
    });
  }

  /**
   * Get repository information
   */
  async getRepository(): Promise<any> {
    const { data } = await this.octokit.rest.repos.get({
      owner: this.config.owner,
      repo: this.config.repo,
    });

    return data;
  }

  /**
   * List branches
   */
  async listBranches(): Promise<string[]> {
    const { data } = await this.octokit.rest.repos.listBranches({
      owner: this.config.owner,
      repo: this.config.repo,
    });

    return data.map(branch => branch.name);
  }

  /**
   * Create a branch
   */
  async createBranch(branchName: string, sha: string): Promise<void> {
    await this.octokit.rest.git.createRef({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchName: string): Promise<void> {
    await this.octokit.rest.git.deleteRef({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: `heads/${branchName}`,
    });
  }
}
