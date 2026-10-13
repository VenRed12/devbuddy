import { z } from "zod";

export const LEVEL_MAP = {
  knowledge: 1,
  understanding: 2,
  can_build: 3,
  can_deploy: 4,
  can_troubleshoot: 5,
  production_ready: 6,
} as const;

export type LevelName = keyof typeof LEVEL_MAP;
export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export const levelSchema = z
  .union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.enum([
      "knowledge",
      "understanding",
      "can_build",
      "can_deploy",
      "can_troubleshoot",
      "production_ready",
    ]),
  ])
  .transform((val): Level => {
    if (typeof val === "number") return val;
    return LEVEL_MAP[val];
  });

export const STATUSES = ["draft", "published", "retired"] as const;
export const statusSchema = z.enum(STATUSES);
export type Status = z.infer<typeof statusSchema>;

export const ROLE_KINDS = ["ic", "manager", "architect"] as const;
export const roleKindSchema = z.enum(ROLE_KINDS);
export type RoleKind = z.infer<typeof roleKindSchema>;

export const EDGE_TYPES = [
  "upgrade_of",
  "bridge_to",
  "prerequisite_of",
  "equivalent",
] as const;
export const edgeTypeSchema = z.enum(EDGE_TYPES);
export type EdgeType = z.infer<typeof edgeTypeSchema>;

export const IMPORTANCE_LEVELS = ["core", "expected", "nice"] as const;
export const importanceSchema = z.enum(IMPORTANCE_LEVELS);
export type Importance = z.infer<typeof importanceSchema>;

export const PROJECT_MODES = ["guided", "external"] as const;
export const projectModeSchema = z.enum(PROJECT_MODES);
export type ProjectMode = z.infer<typeof projectModeSchema>;

export const PROJECT_DIFFICULTIES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;
export const projectDifficultySchema = z.enum(PROJECT_DIFFICULTIES);
export type ProjectDifficulty = z.infer<typeof projectDifficultySchema>;
