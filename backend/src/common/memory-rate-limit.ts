/**
 * Process-local sliding window. Safe for a single Node process (PM2 fork,
 * instances: 1). Cluster mode would not share this Map across workers — use
 * Redis before setting PM2 `instances: 'max'`.
 */
export type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export class MemoryRateLimitStore {
  private readonly attempts = new Map<string, RateLimitBucket>();

  current(key: string, now = Date.now()): RateLimitBucket | undefined {
    this.prune(now);
    const bucket = this.attempts.get(key);
    if (!bucket || now >= bucket.resetAt) {
      return undefined;
    }
    return bucket;
  }

  increment(key: string, windowMs: number, now = Date.now()): RateLimitBucket {
    this.prune(now);
    const bucket = this.attempts.get(key);
    if (!bucket || now >= bucket.resetAt) {
      const next = { count: 1, resetAt: now + windowMs };
      this.attempts.set(key, next);
      return next;
    }
    bucket.count += 1;
    this.attempts.set(key, bucket);
    return bucket;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private prune(now: number): void {
    for (const [key, bucket] of this.attempts) {
      if (now >= bucket.resetAt) {
        this.attempts.delete(key);
      }
    }
  }
}
