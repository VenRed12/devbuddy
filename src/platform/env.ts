import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional().default(""),
  AUTH_SECRET: z.string().optional().default(""),
  AUTH_GITHUB_ID: z.string().optional().default(""),
  AUTH_GITHUB_SECRET: z.string().optional().default(""),
  AUTH_GOOGLE_ID: z.string().optional().default(""),
  AUTH_GOOGLE_SECRET: z.string().optional().default(""),
  NEXT_PUBLIC_APP_NAME: z.string().default("Transition"),
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  GITHUB_TOKEN: z.string().optional().default(""),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default("hello@example.com"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional().default(""),
  SENTRY_DSN: z.string().optional().default(""),
  SENTRY_AUTH_TOKEN: z.string().optional().default(""),
  UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),
  ADMIN_EMAILS: z
    .string()
    .optional()
    .default("")
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
        : [],
    ),
  CRON_SECRET: z.string().optional().default(""),
  FEATURE_AI_JD_ANALYSIS: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
  FEATURE_AI_RESUME_PARSE: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
  FEATURE_HUMAN_REVIEW: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
  FEATURE_SUBSCRIPTIONS: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  if (!parsedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error("Invalid environment variables:", result.error.format());
      throw new Error("Invalid environment variables");
    }
    parsedEnv = result.data;
  }
  return parsedEnv;
}

export const env = getEnv();
