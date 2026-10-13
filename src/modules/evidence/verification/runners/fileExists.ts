import { z } from "zod";
import type { CheckResult, CheckRunner, RepoAccess } from "../types";

export const fileExistsSpecSchema = z.object({
  id: z.string(),
  type: z.literal("file_exists"),
  glob: z.string(),
  required: z.boolean().default(true),
  demonstrates: z.array(
    z.object({
      skill: z.string(),
      level: z.number().int().min(1).max(6),
    }),
  ),
});

export type FileExistsSpec = z.infer<typeof fileExistsSpecSchema>;

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ".*")
    .replace(/(?<!\.)\*/g, "[^/]*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}

export const fileExistsRunner: CheckRunner<FileExistsSpec> = {
  type: "file_exists",
  specSchema: fileExistsSpecSchema,
  async run(spec: FileExistsSpec, repo: RepoAccess): Promise<CheckResult> {
    const paths = await repo.listPaths();
    const regex = globToRegex(spec.glob);
    const matched = paths.some((p) => regex.test(p));

    if (matched) {
      return {
        status: "pass",
        detail: `Found file matching glob "${spec.glob}"`,
      };
    }
    return {
      status: "fail",
      detail: `No file found matching glob "${spec.glob}"`,
    };
  },
};
