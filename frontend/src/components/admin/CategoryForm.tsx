'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import type { AdminCategory } from '@/types';

type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
};

function fromCategory(category: AdminCategory): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    sortOrder: String(category.sortOrder ?? 0),
    isActive: category.isActive,
  };
}

export function CategoryForm({
  category,
  mode,
}: {
  category?: AdminCategory;
  mode: 'create' | 'edit';
}) {
  const router = useRouter();
  const [values, setValues] = useState<CategoryFormValues>(
    category
      ? fromCategory(category)
      : { name: '', slug: '', description: '', sortOrder: '0', isActive: true },
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);

    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      description: values.description.trim() || null,
      sortOrder: Number(values.sortOrder || 0),
      ...(mode === 'edit' ? { isActive: values.isActive } : {}),
    };

    const url =
      mode === 'create' ? '/api/admin/categories' : `/api/admin/categories/${category?.id}`;
    const response = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string | string[];
    };

    if (!response.ok) {
      setError(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ?? 'Could not save category',
      );
      setPending(false);
      return;
    }

    router.push('/admin/categories');
    router.refresh();
  }

  const field =
    'w-full border border-white/15 bg-transparent px-3 py-2 text-sm text-[#f5f0e8] outline-none focus:border-white/40';

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
          Name
        </span>
        <input
          required
          minLength={2}
          maxLength={80}
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          className={field}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
          Slug
        </span>
        <input
          maxLength={80}
          value={values.slug}
          onChange={(event) => setValues({ ...values, slug: event.target.value })}
          className={field}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
          Description
        </span>
        <textarea
          rows={4}
          maxLength={500}
          value={values.description}
          onChange={(event) =>
            setValues({ ...values, description: event.target.value })
          }
          className={field}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
          Sort order
        </span>
        <input
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(event) => setValues({ ...values, sortOrder: event.target.value })}
          className={field}
        />
      </label>
      {mode === 'edit' ? (
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) =>
              setValues({ ...values, isActive: event.target.checked })
            }
            className="h-4 w-4 accent-[#f5f0e8]"
          />
          <span className="text-white/75">Active (assignable to artworks)</span>
        </label>
      ) : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="border border-white/30 px-4 py-2 text-sm hover:border-white/60 disabled:opacity-60"
      >
        {pending ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
      </button>
    </form>
  );
}
