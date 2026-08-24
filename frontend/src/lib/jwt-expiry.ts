export function isAccessTokenExpired(token: string, skewMs = 15_000): boolean {
  const exp = readJwtExp(token);
  if (exp === null) {
    return true;
  }
  return exp * 1000 <= Date.now() + skewMs;
}

function readJwtExp(token: string): number | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return null;
    }
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}
