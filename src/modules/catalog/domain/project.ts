import { z } from "zod";
import {
  levelSchema,
  projectDifficultySchema,
  projectModeSchema,
  statusSchema,
} from "./types";

export const projectAccessSchema = z.object({
  free_preview: z.boolean().default(true),
  entitlement_keys_any: z.array(z.string()).default([]),
});

export const projectCoverageSchema = z.object({
  skill: z.string().min(1),
  level: levelSchema,
});

export const checkDemonstrationSchema = z.object({
  skill: z.string().min(1),
  level: levelSchema,
});

export const genericCheckSpecSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    required: z.boolean().default(true),
    demonstrates: z.array(checkDemonstrationSchema).default([]),
  })
  .passthrough();

export const projectVerificationSchema = z.object({
  checks: z.array(genericCheckSpecSchema).default([]),
});

export const projectSchema = z.object({
  schema_version: z.number().int().min(1).default(1),
  slug: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  name: z.string().min(1),
  mode: projectModeSchema.default("guided"),
  resource_url: z.string().nullable().default(null),
  difficulty: projectDifficultySchema.default("intermediate"),
  est_hours: z.number().int().nonnegative(),
  tags: z.array(z.string()).default([]),
  requires_skills: z.array(z.string()).default([]),
  requires_projects: z.array(z.string()).default([]),
  access: projectAccessSchema.default({
    free_preview: true,
    entitlement_keys_any: [],
  }),
  covers: z.array(projectCoverageSchema).default([]),
  rubric: z.array(z.string()).default([]),
  verification: projectVerificationSchema.default({ checks: [] }),
  status: statusSchema.default("draft"),
  last_reviewed_at: z
    .union([z.string(), z.date()])
    .transform((d) => (typeof d === "string" ? new Date(d) : d)),
  reviewed_by: z.string().default("seed-placeholder"),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectAccess = z.infer<typeof projectAccessSchema>;
export type ProjectCoverage = z.infer<typeof projectCoverageSchema>;
export type ProjectVerification = z.infer<typeof projectVerificationSchema>;
export type GenericCheckSpec = z.infer<typeof genericCheckSpecSchema>;
