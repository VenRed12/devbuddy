import type { RepoHost } from "../../ports/repo-host";

export class FixtureRepoHost implements RepoHost {
  private filesByRepo = new Map<string, Map<string, string>>();

  setRepoFiles(owner: string, repo: string, files: Record<string, string>): void {
    const key = `${owner}/${repo}`.toLowerCase();
    const fileMap = new Map<string, string>();
    for (const [path, content] of Object.entries(files)) {
      fileMap.set(path, content);
    }
    this.filesByRepo.set(key, fileMap);
  }

  async getDefaultBranchTree(owner: string, repo: string): Promise<string[]> {
    const key = `${owner}/${repo}`.toLowerCase();
    const fileMap = this.filesByRepo.get(key);
    if (!fileMap) {
      throw new Error(`Repository ${owner}/${repo} not found`);
    }
    return Array.from(fileMap.keys());
  }

  async getBlob(owner: string, repo: string, path: string): Promise<string | null> {
    const key = `${owner}/${repo}`.toLowerCase();
    const fileMap = this.filesByRepo.get(key);
    if (!fileMap) {
      return null;
    }
    return fileMap.get(path) ?? null;
  }
}
