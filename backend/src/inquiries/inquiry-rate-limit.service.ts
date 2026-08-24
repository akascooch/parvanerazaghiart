import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MemoryRateLimitStore } from '../common/memory-rate-limit';
import { INQUIRY_MAX_PER_WINDOW, INQUIRY_WINDOW_MS } from './inquiry.constants';

/** In-process limiter. Keep PM2 `instances: 1` until Redis is introduced. */
@Injectable()
export class InquiryRateLimitService {
  private readonly store = new MemoryRateLimitStore();

  assertAllowed(key: string): void {
    const bucket = this.store.current(key);
    if (bucket && bucket.count >= INQUIRY_MAX_PER_WINDOW) {
      throw new HttpException(
        'Too many enquiries. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  record(key: string): void {
    this.store.increment(key, INQUIRY_WINDOW_MS);
  }
}
