import { z } from "zod";
import type { CheckResult, CheckRunner, RepoAccess } from "../types";

export const fileContainsSpecSchema = z.object({
  id: z.string(),
  type: z.literal("file_contains"),
  glob: z.string(),
  pattern: z.string(),
  required: z.boolean().default(true),
  demonstrates: z.array(
    z.object({
      skill: z.string(),
      level: z.number().int().min(1).max(6),
    }),
  ),
});

export type FileContainsSpec = z.infer<typeof fileContainsSpecSchema>;

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ".*")
    .replace(/(?<!\.)\*/g, "[^/]*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}

export const fileContainsRunner: CheckRunner<FileContainsSpec> = {
  type: "file_contains",
  specSchema: fileContainsSpecSchema,
  async run(spec: FileContainsSpec, repo: RepoAccess): Promise<CheckResult> {
    const paths = await repo.listPaths();
    const globRegex = globToRegex(spec.glob);
    const patternRegex = new RegExp(spec.pattern, "m");

    const candidatePaths = paths.filter((p) => globRegex.test(p));
    if (candidatePaths.length === 0) {
      return {
        status: "fail",
        detail: `No files matched glob "${spec.glob}" to inspect content`,
      };
    }

    for (const p of candidatePaths) {
      const content = await repo.readFile(p);
      if (content && patternRegex.test(content)) {
        return {
          status: "pass",
          detail: `Found pattern "${spec.pattern}" in file "${p}"`,
        };
      }
    }

    return {
      status: "fail",
      detail: `Pattern "${spec.pattern}" not found in any matching files`,
    };
  },
};
