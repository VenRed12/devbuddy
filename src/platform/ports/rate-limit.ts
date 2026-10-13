export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export interface RateLimiter {
  limit(key: string, rule: RateLimitRule): Promise<RateLimitResult>;
}
