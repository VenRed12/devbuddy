import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";

describe("Architecture rules enforcement", () => {
  it("confirms src/ contains zero dependency rule violations", () => {
    const output = execSync("pnpm exec depcruise --config .dependency-cruiser.cjs src", {
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    expect(output).toContain("no dependency violations found");
  }, 20000);

  it("fails when a forbidden deep import is detected", () => {
    let failed = false;
    let output = "";
    try {
      execSync(
        "pnpm exec depcruise --config .dependency-cruiser.cjs tests/architecture/fixtures/forbidden-import.fixture.ts",
        {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          env: { ...process.env, NO_COLOR: "1" },
        },
      );
    } catch (err: unknown) {
      failed = true;
      const execError = err as { stdout?: string; stderr?: string };
      output = `${execError.stdout || ""} ${execError.stderr || ""}`;
    }

    expect(failed).toBe(true);
    expect(output).toMatch(/no-deep-module-imports/);
  }, 20000);
});
