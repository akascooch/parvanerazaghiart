import { HttpException } from '@nestjs/common';
import { LoginRateLimitService } from './login-rate-limit.service';

describe('LoginRateLimitService', () => {
  it('locks out after too many failures', () => {
    const limiter = new LoginRateLimitService();
    const key = '127.0.0.1:test@example.com';

    for (let i = 0; i < 5; i += 1) {
      limiter.assertAllowed(key);
      limiter.recordFailure(key);
    }

    expect(() => limiter.assertAllowed(key)).toThrow(HttpException);
  });
});
