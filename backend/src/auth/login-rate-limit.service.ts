import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from './auth.constants';

type AttemptState = {
  count: number;
  resetAt: number;
};

@Injectable()
export class LoginRateLimitService {
  private readonly attempts = new Map<string, AttemptState>();

  assertAllowed(key: string): void {
    this.prune();
    const now = Date.now();
    const current = this.attempts.get(key);

    if (!current || now >= current.resetAt) {
      return;
    }

    if (current.count >= LOGIN_MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many login attempts. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordFailure(key: string): void {
    const now = Date.now();
    const current = this.attempts.get(key);

    if (!current || now >= current.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
      return;
    }

    current.count += 1;
    this.attempts.set(key, current);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private prune(): void {
    const now = Date.now();
    for (const [key, value] of this.attempts) {
      if (now >= value.resetAt) {
        this.attempts.delete(key);
      }
    }
  }
}
