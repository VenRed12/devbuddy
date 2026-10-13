import path from "node:path";
import fs from "node:fs";
import { FileContentRepository } from "../src/modules/catalog/repository/file-content-repository";
import { validateGraph } from "../src/modules/catalog/validation/validateGraph";
import { hasEntitlementKey } from "../src/modules/billing";
import { getCheckRunner } from "../src/modules/evidence";

export async function runContentValidation(options: { contentDir?: string } = {}) {
  const contentDir = options.contentDir ?? path.resolve(process.cwd(), "content");
  const repo = new FileContentRepository(contentDir);
  const rawEntities = repo.loadRawEntities();

  const guidedPhasesDir = path.join(contentDir, "projects-guided");
  const getGuidedPhaseFiles = (slug: string): string[] => {
    const projectDir = path.join(guidedPhasesDir, slug);
    if (!fs.existsSync(projectDir)) return [];
    return fs.readdirSync(projectDir).filter((f) => f.endsWith(".md"));
  };

  const validateCheckSpec = (spec: unknown): { valid: boolean; error?: string } => {
    const raw = spec as { type?: string };
    if (!raw.type) {
      return { valid: false, error: "Check is missing type field" };
    }
    const runner = getCheckRunner(raw.type);
    if (!runner) {
      return { valid: false, error: `No registered runner for check type "${raw.type}"` };
    }
    const result = runner.specSchema.safeParse(spec);
    if (!result.success) {
      return { valid: false, error: result.error.message };
    }
    return { valid: true };
  };

  const result = validateGraph(rawEntities, {
    isValidEntitlementKey: hasEntitlementKey,
    validateCheckSpec,
    getGuidedPhaseFiles,
  });

  return result;
}

async function main() {
  console.log("Validating content graph...");
  const result = await runContentValidation();

  if (result.warnings.length > 0) {
    console.warn(`\nWarnings (${result.warnings.length}):`);
    for (const w of result.warnings) {
      console.warn(`  [${w.code}] ${w.message}`);
    }
  }

  if (result.errors.length > 0) {
    console.error(`\nValidation Errors (${result.errors.length}):`);
    for (const e of result.errors) {
      console.error(`  [${e.code}] ${e.message}`);
    }
    process.exit(1);
  }

  console.log("\nContent graph validation passed successfully!");
}

if (process.argv[1]?.includes("content-validate")) {
  main().catch((err) => {
    console.error("Content validation failed:", err);
    process.exit(1);
  });
}
