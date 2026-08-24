'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SoftDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (pending) {
      return;
    }
    const confirmed = window.confirm(
      `Remove “${title}” from the collection? This is a soft delete and can be restored later.`,
    );
    if (!confirmed) {
      return;
    }

    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/artworks/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('Could not delete artwork');
      setPending(false);
      return;
    }
    router.push('/admin/artworks');
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onDelete()}
        disabled={pending}
        className="border border-red-400/30 px-4 py-2 text-sm text-red-200/90 hover:border-red-300/60 disabled:opacity-60"
      >
        {pending ? 'Removing…' : 'Soft delete'}
      </button>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
