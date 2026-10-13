import { describe, expect, it } from "vitest";
import { createCtx, getPorts } from "@/platform/container";
import { FixedClock } from "@/platform/adapters/fakes/fixed-clock";

describe("Platform Container and Context", () => {
  it("creates a default context with all required ports", () => {
    const ctx = createCtx({ userId: "user-123" });
    expect(ctx.userId).toBe("user-123");
    expect(ctx.ports).toBeDefined();
    expect(ctx.ports.payment).toBeDefined();
    expect(ctx.ports.email).toBeDefined();
    expect(ctx.ports.analytics).toBeDefined();
    expect(ctx.ports.repoHost).toBeDefined();
    expect(ctx.ports.rateLimiter).toBeDefined();
    expect(ctx.ports.flags).toBeDefined();
    expect(ctx.ports.logger).toBeDefined();
    expect(ctx.ports.clock).toBeDefined();
    expect(ctx.ports.lifecycle).toBeDefined();
    expect(ctx.now).toBeInstanceOf(Date);
  });

  it("supports injected fake ports for testing", () => {
    const fixedDate = new Date("2026-10-13T12:00:00Z");
    const fakeClock = new FixedClock(fixedDate);
    const ports = {
      ...getPorts(),
      clock: fakeClock,
    };

    const ctx = createCtx({ ports });
    expect(ctx.now.toISOString()).toBe("2026-10-13T12:00:00.000Z");
  });
});
