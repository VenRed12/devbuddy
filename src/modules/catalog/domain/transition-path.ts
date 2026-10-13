import { z } from "zod";
import { statusSchema } from "./types";

export const transitionOverridesSchema = z.object({
  force_include_skills: z.array(z.string()).default([]),
  force_exclude_skills: z.array(z.string()).default([]),
  project_sequence: z.array(z.string()).default([]),
});

export const faqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const transitionPathSchema = z.object({
  schema_version: z.number().int().min(1).default(1),
  slug: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  from_role: z.string().min(1),
  to_role: z.string().min(1),
  status: statusSchema.default("draft"),
  title: z.string().min(1),
  summary: z.string().default(""),
  overrides: transitionOverridesSchema.default({
    force_include_skills: [],
    force_exclude_skills: [],
    project_sequence: [],
  }),
  faqs: z.array(faqSchema).default([]),
});

export type TransitionPath = z.infer<typeof transitionPathSchema>;
export type TransitionOverrides = z.infer<typeof transitionOverridesSchema>;
export type Faq = z.infer<typeof faqSchema>;
