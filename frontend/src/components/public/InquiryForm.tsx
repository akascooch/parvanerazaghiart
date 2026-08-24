'use client';

import { FormEvent, useState } from 'react';

export function InquiryForm({
  artworkSlug,
  artworkTitle,
}: {
  artworkSlug?: string;
  artworkTitle?: string;
}) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? '').trim(),
      contact: String(form.get('contact') ?? '').trim(),
      message: String(form.get('message') ?? '').trim(),
      artworkSlug: artworkSlug || String(form.get('artworkSlug') ?? '').trim() || undefined,
      website: String(form.get('website') ?? '').trim() || undefined,
    };
    let response: Response;
    try {
      response = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      setError('Could not reach the studio. Please try again shortly.');
      setPending(false);
      return;
    }
    const data = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    if (!response.ok) {
      setError(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ?? 'Could not send the enquiry.',
      );
      setPending(false);
      return;
    }
    setDone(true);
    setPending(false);
  }

  const field =
    'w-full border border-ink/15 bg-transparent px-3 py-3 text-base outline-none focus:border-ink/40 sm:text-sm';

  if (done) {
    return (
      <p className="border border-ink/15 px-4 py-6 text-sm leading-relaxed">
        Thank you. The studio has received your enquiry
        {artworkTitle ? ` about “${artworkTitle}”` : ''} and will reply privately.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {artworkTitle ? (
        <p className="text-sm text-muted">
          Enquiry for <span className="text-ink">{artworkTitle}</span>
        </p>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Name</span>
        <input name="name" required minLength={2} maxLength={80} className={field} autoComplete="name" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">
          Email or phone
        </span>
        <input
          name="contact"
          required
          maxLength={120}
          className={field}
          autoComplete="email"
          inputMode="email"
        />
      </label>
      {!artworkSlug ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">
            Artwork slug (optional)
          </span>
          <input name="artworkSlug" maxLength={80} className={field} placeholder="studio-studies" />
        </label>
      ) : (
        <input type="hidden" name="artworkSlug" value={artworkSlug} />
      )}
      <label className="block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Message</span>
        <textarea name="message" required minLength={10} maxLength={2000} rows={5} className={field} />
      </label>
      <div aria-hidden="true" className="hidden">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 border border-ink/20 px-4 py-2 text-sm hover:border-ink/50 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}
