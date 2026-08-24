import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MemoryRateLimitStore } from '../common/memory-rate-limit';
import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from './auth.constants';

/** In-process limiter. Keep PM2 `instances: 1` until Redis is introduced. */
@Injectable()
export class LoginRateLimitService {
  private readonly store = new MemoryRateLimitStore();

  assertAllowed(key: string): void {
    const bucket = this.store.current(key);
    if (bucket && bucket.count >= LOGIN_MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many login attempts. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordFailure(key: string): void {
    this.store.increment(key, LOGIN_WINDOW_MS);
  }

  reset(key: string): void {
    this.store.reset(key);
  }
}
