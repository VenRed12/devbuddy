import type { FeatureFlag, FeatureFlags } from "../../ports/flags";

export class StaticFeatureFlags implements FeatureFlags {
  private flags: Map<FeatureFlag, boolean>;

  constructor(initialFlags: Partial<Record<FeatureFlag, boolean>> = {}) {
    this.flags = new Map([
      ["FEATURE_AI_JD_ANALYSIS", initialFlags.FEATURE_AI_JD_ANALYSIS ?? false],
      ["FEATURE_AI_RESUME_PARSE", initialFlags.FEATURE_AI_RESUME_PARSE ?? false],
      ["FEATURE_HUMAN_REVIEW", initialFlags.FEATURE_HUMAN_REVIEW ?? false],
      ["FEATURE_SUBSCRIPTIONS", initialFlags.FEATURE_SUBSCRIPTIONS ?? false],
    ]);
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.flags.get(flag) ?? false;
  }

  setFlag(flag: FeatureFlag, enabled: boolean): void {
    this.flags.set(flag, enabled);
  }
}
