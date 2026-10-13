export interface RepoHost {
  getDefaultBranchTree(owner: string, repo: string): Promise<string[]>;
  getBlob(owner: string, repo: string, path: string): Promise<string | null>;
}
