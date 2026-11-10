'use client';

import { FormEvent, useState } from 'react';

type Field = 'currentPassword' | 'newPassword' | 'confirmPassword';

function looksStrong(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[\d\W]/.test(password)
  );
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState<Record<Field, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (currentPassword.length < 6) {
      setError('Current password is too short.');
      return;
    }
    if (!looksStrong(newPassword)) {
      setError(
        'New password needs at least 8 characters with upper, lower, and a number or symbol.',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password confirmation does not match.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; success?: boolean }
        | null;
      if (!response.ok) {
        setError(payload?.message ?? 'Password could not be updated.');
        return;
      }
      setSuccess(payload?.message ?? 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Connection failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-lg border border-white/10 bg-white/[0.03] p-5 sm:p-6"
    >
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
        Security & Password
      </p>
      <h2 className="mt-2 font-serif text-2xl text-[#f5f0e8]">Change password</h2>
      <p className="mt-2 text-sm text-white/55">
        Use a strong password. Other admin sessions will be signed out after a successful change.
      </p>

      <div className="mt-6 space-y-4">
        {(
          [
            ['currentPassword', 'Current password', currentPassword, setCurrentPassword],
            ['newPassword', 'New password', newPassword, setNewPassword],
            ['confirmPassword', 'Confirm new password', confirmPassword, setConfirmPassword],
          ] as const
        ).map(([name, label, value, setter]) => (
          <label key={name} className="block text-sm text-white/70">
            <span>{label}</span>
            <div className="mt-2 flex overflow-hidden rounded-sm border border-white/15 focus-within:border-white/40">
              <input
                type={show[name] ? 'text' : 'password'}
                name={name}
                autoComplete={
                  name === 'currentPassword' ? 'current-password' : 'new-password'
                }
                value={value}
                onChange={(event) => setter(event.target.value)}
                className="min-h-11 w-full bg-transparent px-3 text-[#f5f0e8] outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setShow((current) => ({ ...current, [name]: !current[name] }))
                }
                className="shrink-0 px-3 text-xs uppercase tracking-wider text-white/50 hover:text-white/80"
              >
                {show[name] ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex min-h-11 items-center justify-center bg-[#f5f0e8] px-5 text-sm text-[#111] transition hover:bg-white disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Update password'}
      </button>
    </form>
  );
}
