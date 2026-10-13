import { z } from "zod";
import { edgeTypeSchema } from "./types";

export const skillEdgeSchema = z.object({
  schema_version: z.number().int().min(1).default(1),
  from: z.string().min(1),
  to: z.string().min(1),
  type: edgeTypeSchema,
  transfer_weight: z.number().min(0).max(1).default(0),
  note: z.string().default(""),
});

export type SkillEdge = z.infer<typeof skillEdgeSchema>;
