import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INQUIRY_MAX_PER_WINDOW, INQUIRY_WINDOW_MS } from './inquiry.constants';

type AttemptState = {
  count: number;
  resetAt: number;
};

@Injectable()
export class InquiryRateLimitService {
  private readonly attempts = new Map<string, AttemptState>();

  assertAllowed(key: string): void {
    this.prune();
    const now = Date.now();
    const current = this.attempts.get(key);
    if (!current || now >= current.resetAt) {
      return;
    }
    if (current.count >= INQUIRY_MAX_PER_WINDOW) {
      throw new HttpException(
        'Too many enquiries. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  record(key: string): void {
    const now = Date.now();
    const current = this.attempts.get(key);
    if (!current || now >= current.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + INQUIRY_WINDOW_MS });
      return;
    }
    current.count += 1;
    this.attempts.set(key, current);
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
