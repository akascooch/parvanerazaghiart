'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RestoreButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRestore() {
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/artworks/${id}/restore`, {
      method: 'POST',
    });
    if (!response.ok) {
      setError('Could not restore artwork');
      setPending(false);
      return;
    }
    router.push(`/admin/artworks/${id}`);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onRestore()}
        disabled={pending}
        className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50 disabled:opacity-60"
      >
        {pending ? 'Restoring…' : `Restore “${title}”`}
      </button>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
