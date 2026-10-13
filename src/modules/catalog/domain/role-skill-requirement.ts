import { z } from "zod";
import { importanceSchema, levelSchema, roleKindSchema } from "./types";

export const roleSkillRequirementSchema = z.object({
  schema_version: z.number().int().min(1).default(1),
  role: z.string().min(1),
  skill: z.string().min(1),
  importance: importanceSchema.default("expected"),
  target_level: levelSchema,
  applies_to_kind: z.array(roleKindSchema).default(["ic"]),
});

export type RoleSkillRequirement = z.infer<typeof roleSkillRequirementSchema>;
