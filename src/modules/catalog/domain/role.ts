import { z } from "zod";
import { levelSchema, roleKindSchema, statusSchema } from "./types";

export const roleImpliedSkillSchema = z.object({
  skill: z.string().min(1),
  level: levelSchema.default(3),
});

export const roleSchema = z.object({
  schema_version: z.number().int().min(1).default(1),
  slug: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  name: z.string().min(1),
  kind: roleKindSchema.default("ic"),
  is_current_role: z.boolean().default(false),
  is_target_role: z.boolean().default(false),
  implied_skills: z.array(roleImpliedSkillSchema).default([]),
  status: statusSchema.default("draft"),
});

export type Role = z.infer<typeof roleSchema>;
export type RoleImpliedSkill = z.infer<typeof roleImpliedSkillSchema>;
