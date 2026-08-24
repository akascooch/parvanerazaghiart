'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CategoryForm } from '@/components/admin/CategoryForm';
import type { AdminCategory } from '@/types';

export function CategoryEditor({ category }: { category: AdminCategory }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: 'DELETE',
    });
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      deleted?: boolean;
      isActive?: boolean;
    };
    if (!response.ok) {
      setError(data.message ?? 'Could not remove category');
      setPending(false);
      return;
    }
    router.push('/admin/categories');
    router.refresh();
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">Catalog</p>
      <h1 className="mt-2 font-display text-3xl">{category.name}</h1>
      <p className="mt-4">
        <Link href="/admin/categories" className="text-sm text-white/55 hover:text-white">
          ← Back to categories
        </Link>
      </p>
      <div className="mt-8">
        <CategoryForm mode="edit" category={category} />
      </div>
      <div className="mt-10 border-t border-white/10 pt-6">
        <p className="text-sm text-white/55">
          If artworks still use this category it is deactivated instead of
          deleted.
        </p>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <button
          type="button"
          disabled={pending}
          onClick={onDelete}
          className="mt-4 border border-red-300/40 px-4 py-2 text-sm text-red-200 hover:border-red-200/70 disabled:opacity-60"
        >
          {pending ? 'Working…' : 'Delete or deactivate'}
        </button>
      </div>
    </main>
  );
}
