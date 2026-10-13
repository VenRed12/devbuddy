import type { z } from "zod";

export interface CheckResult {
  status: "pass" | "fail" | "inconclusive";
  detail: string;
}

export interface RepoAccess {
  listPaths(): Promise<string[]>;
  readFile(path: string): Promise<string | null>;
}

export interface CheckRunner<TSpec = unknown> {
  readonly type: string;
  readonly specSchema: z.ZodTypeAny;
  run(spec: TSpec, repo: RepoAccess): Promise<CheckResult>;
}
