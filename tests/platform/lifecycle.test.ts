import { describe, expect, it } from "vitest";
import { UserLifecycleRegistry } from "@/platform/adapters/lifecycle-registry";

describe("UserLifecycleRegistry", () => {
  it("registers and executes all module deletion hooks", async () => {
    const registry = new UserLifecycleRegistry();
    const deletedModules: string[] = [];

    registry.register("planning", async (userId) => {
      deletedModules.push(`planning:${userId}`);
    });

    registry.register("billing", async (userId) => {
      deletedModules.push(`billing:${userId}`);
    });

    expect(registry.getRegisteredModules()).toEqual(["planning", "billing"]);

    await registry.runDeletion("user-abc");
    expect(deletedModules).toEqual(["planning:user-abc", "billing:user-abc"]);
  });

  it("throws when duplicate module is registered", () => {
    const registry = new UserLifecycleRegistry();
    registry.register("catalog", async () => {});
    expect(() => registry.register("catalog", async () => {})).toThrow(
      'Handler for module "catalog" is already registered.',
    );
  });
});
