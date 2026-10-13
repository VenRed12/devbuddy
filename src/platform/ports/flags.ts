export type FeatureFlag =
  | "FEATURE_AI_JD_ANALYSIS"
  | "FEATURE_AI_RESUME_PARSE"
  | "FEATURE_HUMAN_REVIEW"
  | "FEATURE_SUBSCRIPTIONS";

export interface FeatureFlags {
  isEnabled(flag: FeatureFlag): boolean;
}
