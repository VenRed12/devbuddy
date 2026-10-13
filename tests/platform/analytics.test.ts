import { describe, expect, it } from "vitest";
import { analyticsEventSchemas } from "@/platform/analytics/events";

describe("Analytics Event Registry", () => {
  it("validates transition_page_viewed props", () => {
    const valid = analyticsEventSchemas.transition_page_viewed.safeParse({
      slug: "java-to-cloud",
    });
    expect(valid.success).toBe(true);

    const invalid = analyticsEventSchemas.transition_page_viewed.safeParse({});
    expect(invalid.success).toBe(false);
  });

  it("validates plan_generated props", () => {
    const valid = analyticsEventSchemas.plan_generated.safeParse({
      from: "java-backend-developer",
      to: "cloud-engineer",
      authenticated: false,
    });
    expect(valid.success).toBe(true);
  });
});
