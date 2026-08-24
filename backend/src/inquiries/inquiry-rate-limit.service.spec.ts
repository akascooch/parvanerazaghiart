import { HttpException } from '@nestjs/common';
import { InquiryRateLimitService } from './inquiry-rate-limit.service';

describe('InquiryRateLimitService', () => {
  it('allows five submissions then blocks', () => {
    const limiter = new InquiryRateLimitService();
    const key = 'ip-hash';
    for (let i = 0; i < 5; i += 1) {
      limiter.assertAllowed(key);
      limiter.record(key);
    }
    expect(() => limiter.assertAllowed(key)).toThrow(HttpException);
  });
});
