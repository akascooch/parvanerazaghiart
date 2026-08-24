import { isPhoneIdentifier, normalizePhone } from './phone';

describe('phone identifiers', () => {
  it('normalizes Iranian mobile numbers to 09XXXXXXXXX', () => {
    expect(normalizePhone('09123456789')).toBe('09123456789');
    expect(normalizePhone('9123456789')).toBe('09123456789');
    expect(normalizePhone('+98 912 345 6789')).toBe('09123456789');
    expect(normalizePhone('00989123456789')).toBe('09123456789');
  });

  it('rejects emails and invalid numbers', () => {
    expect(normalizePhone('admin@localhost')).toBeNull();
    expect(normalizePhone('12345')).toBeNull();
    expect(isPhoneIdentifier('admin@localhost')).toBe(false);
    expect(isPhoneIdentifier('09123456789')).toBe(true);
  });
});
