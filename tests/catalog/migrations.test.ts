import { describe, expect, it } from "vitest";
import { upgradeContent } from "@/modules/catalog/migrations/upgradeContent";

describe("Content Schema Migrations and Upgraders", () => {
  it("upgrades a schema_version: 1 fixture to schema_version: 2", () => {
    const v1Skill = {
      schema_version: 1,
      slug: "legacy-skill",
      name: "Legacy Skill",
      category: "backend",
      base_hours: 20,
    };

    const upgraded = upgradeContent("skills", v1Skill, 2);

    expect(upgraded.schema_version).toBe(2);
    expect(upgraded.aliases).toEqual([]);
    expect(upgraded.reviewed_by).toBe("unreviewed");
  });

  it("leaves content unchanged if already at the target version", () => {
    const currentData = {
      schema_version: 1,
      slug: "current-skill",
      name: "Current Skill",
    };

    const result = upgradeContent("skills", currentData, 1);
    expect(result).toEqual(currentData);
  });
});
