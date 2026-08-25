'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AdminMedia } from '@/types';

export function ArtworkMediaPanel({
  artworkId,
  media,
}: {
  artworkId: string;
  media: AdminMedia[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(path: string, init?: RequestInit) {
    setPending(true);
    setError(null);
    const response = await fetch(path, init);
    const data = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    if (!response.ok) {
      setError(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ?? 'Request failed',
      );
      setPending(false);
      return false;
    }
    setPending(false);
    router.refresh();
    return true;
  }

  async function onUpload(file: File) {
    const body = new FormData();
    body.append('file', file);
    await run(`/api/admin/artworks/${artworkId}/media`, {
      method: 'POST',
      body,
    });
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= media.length) {
      return;
    }
    const ids = media.map((item) => item.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(target, 0, moved);
    await run(`/api/admin/artworks/${artworkId}/media/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  }

  return (
    <section className="border border-white/10 px-5 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl">Media</h2>
          <p className="mt-1 text-sm text-white/55">
            JPEG, PNG, or WebP. Max 12MB, 12 files. Stored privately and served
            only to signed-in admins.
          </p>
        </div>
        <label className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50">
          {pending ? 'Working…' : 'Upload image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={pending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) {
                void onUpload(file);
              }
            }}
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {media.length === 0 ? (
        <p className="mt-6 border border-dashed border-white/15 px-4 py-10 text-center text-sm text-white/50">
          No images attached yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {media.map((item, index) => (
            <li key={item.id} className="border border-white/10 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/admin/media/${item.id}/file`}
                alt={item.alt ?? 'Artwork image'}
                className="h-40 w-full object-cover bg-black/40"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {item.isPrimary ? (
                  <span className="border border-emerald-400/40 px-2 py-1 text-emerald-200/90">
                    Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      void run(
                        `/api/admin/artworks/${artworkId}/media/${item.id}/primary`,
                        { method: 'PATCH' },
                      )
                    }
                    className="border border-white/20 px-2 py-1 hover:border-white/40 disabled:opacity-50"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending || index === 0}
                  onClick={() => void move(index, -1)}
                  className="border border-white/20 px-2 py-1 hover:border-white/40 disabled:opacity-50"
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={pending || index === media.length - 1}
                  onClick={() => void move(index, 1)}
                  className="border border-white/20 px-2 py-1 hover:border-white/40 disabled:opacity-50"
                >
                  Down
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    void run(`/api/admin/artworks/${artworkId}/media/${item.id}`, {
                      method: 'DELETE',
                    })
                  }
                  className="border border-red-400/30 px-2 py-1 text-red-200/90 hover:border-red-300/60 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
