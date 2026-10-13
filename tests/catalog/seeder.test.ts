import { describe, expect, it } from "vitest";
import { runContentSeed } from "../../scripts/content-seed";

describe("Content Seeder", () => {
  it("idempotently produces identical manifests and hashes on repeated runs", async () => {
    const run1 = await runContentSeed({ dryRun: true });
    const run2 = await runContentSeed({ dryRun: true });

    expect(run1.hash).toBe(run2.hash);
    expect(run1.manifest).toEqual(run2.manifest);
    expect(run1.manifest.skills.length).toBeGreaterThanOrEqual(28);
    expect(run1.manifest.roles.length).toBeGreaterThanOrEqual(7);
  });
});
