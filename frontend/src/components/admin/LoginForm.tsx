'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          typeof data.message === 'string'
            ? data.message
            : 'Invalid email or password',
        );
        return;
      }

      const from = searchParams.get('from');
      router.replace(from && from.startsWith('/admin') ? from : '/admin');
      router.refresh();
    } catch {
      setError('Unable to reach the server. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5">
      {reason === 'session' ? (
        <p className="text-sm text-amber-200/90">
          Your session ended. Please sign in again.
        </p>
      ) : null}
      <label className="block text-sm">
        <span className="opacity-70">Email or phone</span>
        <input
          type="text"
          name="email"
          autoComplete="username"
          inputMode="email"
          required
          minLength={3}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full border border-white/15 bg-black/30 px-3 py-2 text-[#f5f0e8] outline-none focus:border-accent"
        />
      </label>
      <label className="block text-sm">
        <span className="opacity-70">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full border border-white/15 bg-black/30 px-3 py-2 text-[#f5f0e8] outline-none focus:border-accent"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#f5f0e8] px-4 py-2.5 text-sm font-medium tracking-wide text-[#111] disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
