import { describe, expect, it } from "vitest";
import { FileContentRepository } from "@/modules/catalog/repository/file-content-repository";

describe("FileContentRepository", () => {
  it("loads a complete content snapshot from the filesystem", async () => {
    const repo = new FileContentRepository();
    const snapshot = await repo.getSnapshot();

    expect(snapshot.version).toBeDefined();
    expect(snapshot.version.length).toBe(64); // SHA-256 hex string

    expect(snapshot.skills.size).toBeGreaterThanOrEqual(28);
    expect(snapshot.roles.size).toBeGreaterThanOrEqual(7);
    expect(snapshot.edges.length).toBeGreaterThanOrEqual(10);
    expect(snapshot.projects.length).toBeGreaterThanOrEqual(6);
    expect(snapshot.transitionPaths.size).toBeGreaterThan(0);
  });

  it("automatically generates reverse edge for equivalent edge types", async () => {
    const repo = new FileContentRepository();
    const snapshot = await repo.getSnapshot();

    // In seed: test-automation <-> unit-testing is equivalent
    const forward = snapshot.edges.find(
      (e) =>
        e.from === "test-automation" &&
        e.to === "unit-testing" &&
        e.type === "equivalent",
    );
    const reverse = snapshot.edges.find(
      (e) =>
        e.from === "unit-testing" &&
        e.to === "test-automation" &&
        e.type === "equivalent",
    );

    expect(forward).toBeDefined();
    expect(reverse).toBeDefined();
  });

  it("computes identical hashes for identical directory content", () => {
    const repo1 = new FileContentRepository();
    const repo2 = new FileContentRepository();

    expect(repo1.computeContentHash()).toBe(repo2.computeContentHash());
  });
});
