/** Normalize Iranian mobile numbers to 09XXXXXXXXX, or return null. */
export function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  let local = digits;
  if (local.startsWith('0098')) {
    local = local.slice(4);
  } else if (local.startsWith('98')) {
    local = local.slice(2);
  }
  if (local.startsWith('9') && local.length === 10) {
    local = `0${local}`;
  }
  if (/^09\d{9}$/.test(local)) {
    return local;
  }
  return null;
}

export function isPhoneIdentifier(value: string): boolean {
  return normalizePhone(value) !== null && !value.includes('@');
}
