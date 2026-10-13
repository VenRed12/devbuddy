import { z } from "zod";
import { statusSchema } from "./types";

export const skillSchema = z.object({
  schema_version: z.number().int().min(1).default(1),
  slug: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  name: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  base_hours: z.number().int().nonnegative(),
  fundamental: z.boolean().default(false),
  description: z.string().default(""),
  status: statusSchema.default("draft"),
  last_reviewed_at: z
    .union([z.string(), z.date()])
    .transform((d) => (typeof d === "string" ? new Date(d) : d)),
  reviewed_by: z.string().default("seed-placeholder"),
});

export type Skill = z.infer<typeof skillSchema>;
