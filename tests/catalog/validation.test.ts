import { describe, expect, it } from "vitest";
import { runContentValidation } from "../../scripts/content-validate";
import { validateGraph, type RawEntities } from "@/modules/catalog/validation/validateGraph";

describe("Catalog Content Validation", () => {
  it("passes validation on the authored seed content", async () => {
    const result = await runContentValidation();
    expect(result.errors).toHaveLength(0);
    expect(result.valid).toBe(true);
  });

  describe("Deliberately broken fixtures", () => {
    const baseValidData: RawEntities = {
      skills: [
        {
          schema_version: 1,
          slug: "skill-a",
          aliases: [],
          name: "Skill A",
          category: "cat",
          tags: [],
          base_hours: 10,
          fundamental: false,
          description: "",
          status: "published",
          last_reviewed_at: new Date(),
          reviewed_by: "test",
        },
        {
          schema_version: 1,
          slug: "skill-b",
          aliases: [],
          name: "Skill B",
          category: "cat",
          tags: [],
          base_hours: 10,
          fundamental: false,
          description: "",
          status: "published",
          last_reviewed_at: new Date(),
          reviewed_by: "test",
        },
      ],
      edges: [],
      roles: [
        {
          schema_version: 1,
          slug: "role-a",
          aliases: [],
          name: "Role A",
          kind: "ic",
          is_current_role: true,
          is_target_role: false,
          implied_skills: [],
          status: "published",
        },
        {
          schema_version: 1,
          slug: "role-b",
          aliases: [],
          name: "Role B",
          kind: "ic",
          is_current_role: false,
          is_target_role: true,
          implied_skills: [],
          status: "published",
        },
      ],
      requirements: [],
      transitions: [],
      projects: [],
    };

    it("fails when a cycle exists in prerequisite_of edges", () => {
      const data: RawEntities = {
        ...baseValidData,
        edges: [
          {
            schema_version: 1,
            from: "skill-a",
            to: "skill-b",
            type: "prerequisite_of",
            transfer_weight: 0,
            note: "a before b",
          },
          {
            schema_version: 1,
            from: "skill-b",
            to: "skill-a",
            type: "prerequisite_of",
            transfer_weight: 0,
            note: "b before a (cycle)",
          },
        ],
      };

      const result = validateGraph(data);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === "CYCLE_DETECTED_PREREQUISITE"),
      ).toBe(true);
    });

    it("fails when transfer_weight is outside [0, 1]", () => {
      const data: RawEntities = {
        ...baseValidData,
        edges: [
          {
            schema_version: 1,
            from: "skill-a",
            to: "skill-b",
            type: "upgrade_of",
            transfer_weight: 1.5,
            note: "too high weight",
          },
        ],
      };

      const result = validateGraph(data);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === "INVALID_TRANSFER_WEIGHT"),
      ).toBe(true);
    });

    it("fails when edge references an unknown missing skill slug", () => {
      const data: RawEntities = {
        ...baseValidData,
        edges: [
          {
            schema_version: 1,
            from: "skill-a",
            to: "non-existent-skill",
            type: "bridge_to",
            transfer_weight: 0.5,
            note: "missing target",
          },
        ],
      };

      const result = validateGraph(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "INVALID_EDGE_TO")).toBe(true);
    });

    it("fails when a slug vanishes without being marked retired or aliased", () => {
      const previousManifest = {
        skills: ["skill-a", "skill-b", "skill-vanished"],
      };

      const result = validateGraph(baseValidData, {
        previousManifest,
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === "VANISHED_SLUG_NOT_RETIRED_OR_ALIASED",
        ),
      ).toBe(true);
    });

    it("passes when a vanished slug is retained as an alias", () => {
      const dataWithAlias: RawEntities = {
        ...baseValidData,
        skills: [
          {
            ...baseValidData.skills[0]!,
            aliases: ["skill-vanished"],
          },
          baseValidData.skills[1]!,
        ],
      };

      const previousManifest = {
        skills: ["skill-a", "skill-b", "skill-vanished"],
      };

      const result = validateGraph(dataWithAlias, {
        previousManifest,
      });

      expect(
        result.errors.some(
          (e) => e.code === "VANISHED_SLUG_NOT_RETIRED_OR_ALIASED",
        ),
      ).toBe(false);
    });

    it("fails when a project has an unknown or unregistered verification check type", () => {
      const dataWithInvalidCheck: RawEntities = {
        ...baseValidData,
        projects: [
          {
            schema_version: 1,
            slug: "test-project",
            aliases: [],
            name: "Test Project",
            mode: "guided",
            resource_url: null,
            difficulty: "beginner",
            est_hours: 5,
            tags: [],
            requires_skills: [],
            requires_projects: [],
            access: { free_preview: true, entitlement_keys_any: ["track:test"] },
            covers: [],
            rubric: [],
            verification: {
              checks: [
                {
                  id: "check-1",
                  type: "unknown_custom_runner",
                  required: true,
                  demonstrates: [],
                },
              ],
            },
            status: "draft",
            last_reviewed_at: new Date(),
            reviewed_by: "test",
          },
        ],
      };

      const validateCheckSpec = (spec: unknown) => {
        const raw = spec as { type?: string };
        if (raw.type === "unknown_custom_runner") {
          return { valid: false, error: "Unregistered runner" };
        }
        return { valid: true };
      };

      const result = validateGraph(dataWithInvalidCheck, {
        validateCheckSpec,
        isValidEntitlementKey: () => true,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "INVALID_CHECK_SPEC")).toBe(true);
    });
  });
});
