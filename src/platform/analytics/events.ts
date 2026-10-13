import { z } from "zod";

export const analyticsEventSchemas = {
  landing_viewed: z.object({}).optional(),
  transition_page_viewed: z.object({
    slug: z.string(),
  }),
  wizard_started: z.object({}).optional(),
  wizard_step_completed: z.object({
    step: z.number().int().min(1),
  }),
  plan_generated: z.object({
    from: z.string(),
    to: z.string(),
    authenticated: z.boolean(),
  }),
  plan_edited: z.object({}).optional(),
  plan_saved: z.object({}).optional(),
  signup_completed: z.object({
    provider: z.string(),
  }),
  paywall_viewed: z.object({
    product_key: z.string(),
    surface: z.string(),
  }),
  checkout_started: z.object({
    product_key: z.string(),
  }),
  purchase_completed: z.object({
    product_key: z.string(),
    amount_minor: z.number().int().nonnegative(),
  }),
  project_started: z.object({
    slug: z.string(),
  }),
  rubric_submitted: z.object({
    slug: z.string(),
    passed: z.boolean(),
  }),
  verification_run: z.object({
    slug: z.string(),
    passed: z.boolean(),
    checks_passed: z.number().int().nonnegative(),
    checks_total: z.number().int().nonnegative(),
  }),
  portfolio_made_public: z.object({}).optional(),
  portfolio_viewed: z.object({
    slug: z.string(),
  }),
  unmapped_transition_requested: z.object({
    from: z.string(),
    to: z.string(),
  }),
} as const;

export type AnalyticsEventName = keyof typeof analyticsEventSchemas;
export type AnalyticsEventProps<T extends AnalyticsEventName> =
  z.infer<(typeof analyticsEventSchemas)[T]>;
