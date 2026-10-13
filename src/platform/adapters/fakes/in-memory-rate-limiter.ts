import type {
  RateLimiter,
  RateLimitResult,
  RateLimitRule,
} from "../../ports/rate-limit";

interface Bucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, Bucket>();

  async limit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = {
        count: 0,
        resetAt: now + rule.windowMs,
      };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, rule.limit - bucket.count);
    const success = bucket.count <= rule.limit;

    return {
      success,
      limit: rule.limit,
      remaining,
      resetMs: Math.max(0, bucket.resetAt - now),
    };
  }

  reset(): void {
    this.buckets.clear();
  }
}
