export interface GitRepository {
  clone(): Promise<void>;
  createBranch(branchName: string, baseBranch?: string): Promise<void>;
  switchBranch(branchName: string): Promise<void>;
  getCurrentBranch(): Promise<string>;
  commit(message: string, files: string[], author?: { name: string; email: string }): Promise<string>;
  push(branch?: string): Promise<void>;
  pull(branch?: string): Promise<void>;
  getBranches(): Promise<string[]>;
  getFileContent(filePath: string, branch?: string): Promise<string>;
  writeFile(filePath: string, content: string): Promise<void>;
  deleteFile(filePath: string): Promise<void>;
  getChangedFiles(): Promise<string[]>;
  mergeBranch(sourceBranch: string, targetBranch: string): Promise<void>;
  deleteBranch(branchName: string): Promise<void>;
}

export interface GitConfig {
  repositoryUrl: string;
  localPath: string;
  accessToken: string;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
}

export interface BranchInfo {
  name: string;
  isRemote: boolean;
  isCurrent: boolean;
  lastCommit?: CommitInfo;
}
