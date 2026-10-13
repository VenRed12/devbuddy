import { z } from "zod";
import type { CheckResult, CheckRunner, RepoAccess } from "../types";

export const dependencyContainsSpecSchema = z.object({
  id: z.string(),
  type: z.literal("dependency_contains"),
  files: z.array(z.string()),
  pattern: z.string(),
  required: z.boolean().default(true),
  demonstrates: z.array(
    z.object({
      skill: z.string(),
      level: z.number().int().min(1).max(6),
    }),
  ),
});

export type DependencyContainsSpec = z.infer<
  typeof dependencyContainsSpecSchema
>;

export const dependencyContainsRunner: CheckRunner<DependencyContainsSpec> = {
  type: "dependency_contains",
  specSchema: dependencyContainsSpecSchema,
  async run(spec: DependencyContainsSpec, repo: RepoAccess): Promise<CheckResult> {
    const patternRegex = new RegExp(spec.pattern, "i");

    for (const file of spec.files) {
      const content = await repo.readFile(file);
      if (content && patternRegex.test(content)) {
        return {
          status: "pass",
          detail: `Found dependency matching "${spec.pattern}" in "${file}"`,
        };
      }
    }

    return {
      status: "fail",
      detail: `Dependency pattern "${spec.pattern}" not found in declared files [${spec.files.join(", ")}]`,
    };
  },
};
