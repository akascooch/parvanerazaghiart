import { MemoryRateLimitStore } from './memory-rate-limit';

describe('MemoryRateLimitStore', () => {
  it('counts hits inside the window and resets after expiry', () => {
    const store = new MemoryRateLimitStore();
    const first = store.increment('k', 60_000, 1_000);
    expect(first.count).toBe(1);
    const second = store.increment('k', 60_000, 1_100);
    expect(second.count).toBe(2);
    expect(store.current('k', 1_100)?.count).toBe(2);
    expect(store.current('k', 62_000)).toBeUndefined();
  });
});
