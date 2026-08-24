const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export async function apiHealth() {
  const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error('API health check failed');
  return res.json();
}
