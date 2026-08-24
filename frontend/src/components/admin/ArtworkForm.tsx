'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { AdminArtwork, AdminCategory, ArtworkStatus } from '@/types';

type ArtworkFormValues = {
  title: string;
  slug: string;
  description: string;
  status: ArtworkStatus;
  year: string;
  medium: string;
  technique: string;
  dimensions: string;
  collection: string;
  price: string;
  isPriceVisible: boolean;
  categoryId: string;
};

const emptyValues: ArtworkFormValues = {
  title: '',
  slug: '',
  description: '',
  status: 'DRAFT',
  year: '',
  medium: '',
  technique: '',
  dimensions: '',
    collection: '',
    price: '',
    isPriceVisible: false,
  categoryId: '',
};

function fromArtwork(artwork: AdminArtwork): ArtworkFormValues {
  return {
    title: artwork.title,
    slug: artwork.slug,
    description: artwork.description ?? '',
    status: artwork.status,
    year: artwork.year?.toString() ?? '',
    medium: artwork.medium ?? '',
    technique: artwork.technique ?? '',
    dimensions: artwork.dimensions ?? '',
    collection: artwork.collection ?? '',
    price: artwork.price ?? '',
    isPriceVisible: artwork.isPriceVisible,
    categoryId: artwork.categoryId ?? '',
  };
}

function payloadFromValues(values: ArtworkFormValues, mode: 'create' | 'edit') {
  return {
    title: values.title.trim(),
    slug: values.slug.trim() || undefined,
    description: values.description.trim() || null,
    status: values.status,
    year: values.year ? Number(values.year) : null,
    medium: values.medium.trim() || null,
    technique: values.technique.trim() || null,
    dimensions: values.dimensions.trim() || null,
    collection: values.collection.trim() || null,
    price: values.price === '' ? null : Number(values.price),
    isPriceVisible: values.isPriceVisible,
    categoryId:
      values.categoryId || (mode === 'edit' ? null : undefined),
  };
}

export function ArtworkForm({
  artwork,
  mode,
}: {
  artwork?: AdminArtwork;
  mode: 'create' | 'edit';
}) {
  const router = useRouter();
  const [values, setValues] = useState<ArtworkFormValues>(
    artwork ? fromArtwork(artwork) : emptyValues,
  );
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [baseline] = useState(() =>
    JSON.stringify(artwork ? fromArtwork(artwork) : emptyValues),
  );
  const dirty = JSON.stringify(values) !== baseline;

  useEffect(() => {
    fetch('/api/admin/categories?includeInactive=true')
      .then((response) => response.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);

    const url =
      mode === 'create' ? '/api/admin/artworks' : `/api/admin/artworks/${artwork?.id}`;
    const response = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadFromValues(values, mode)),
    });
    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string | string[];
    };

    if (!response.ok) {
      setError(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ?? 'Could not save artwork',
      );
      setPending(false);
      return;
    }

    router.push(mode === 'create' && data.id ? `/admin/artworks/${data.id}` : '/admin/artworks');
    router.refresh();
  }

  const field =
    'w-full border border-white/15 bg-transparent px-3 py-2 text-sm text-[#f5f0e8] outline-none focus:border-white/40';
  const selectable = categories.filter(
    (category) => category.isActive || category.id === values.categoryId,
  );

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
          Title
        </span>
        <input
          required
          minLength={2}
          maxLength={160}
          value={values.title}
          onChange={(event) => setValues({ ...values, title: event.target.value })}
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
          placeholder="generated-from-title"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
          Description
        </span>
        <textarea
          rows={5}
          maxLength={8000}
          value={values.description}
          onChange={(event) =>
            setValues({ ...values, description: event.target.value })
          }
          className={field}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
            Status
          </span>
          <select
            value={values.status}
            onChange={(event) =>
              setValues({ ...values, status: event.target.value as ArtworkStatus })
            }
            className={`${field} bg-[#111]`}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SOLD">Sold</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
            Category
          </span>
          <select
            value={values.categoryId}
            onChange={(event) =>
              setValues({ ...values, categoryId: event.target.value })
            }
            className={`${field} bg-[#111]`}
          >
            <option value="">Unassigned</option>
            {selectable.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.isActive ? '' : ' (inactive)'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
            Year
          </span>
          <input
            type="number"
            min={1000}
            max={2100}
            value={values.year}
            onChange={(event) => setValues({ ...values, year: event.target.value })}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
            Technique
          </span>
          <input
            maxLength={120}
            value={values.technique}
            onChange={(event) =>
              setValues({ ...values, technique: event.target.value })
            }
            className={field}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
            Medium
          </span>
          <input
            maxLength={120}
            value={values.medium}
            onChange={(event) => setValues({ ...values, medium: event.target.value })}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
            Dimensions
          </span>
          <input
            maxLength={120}
            value={values.dimensions}
            onChange={(event) =>
              setValues({ ...values, dimensions: event.target.value })
            }
            className={field}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
          Collection / Series
        </span>
        <input
          maxLength={120}
          value={values.collection}
          onChange={(event) =>
            setValues({ ...values, collection: event.target.value })
          }
          className={field}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
            Price
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(event) => setValues({ ...values, price: event.target.value })}
            className={field}
          />
        </label>
        <label className="flex items-end gap-3 pb-2 text-sm">
          <input
            type="checkbox"
            checked={values.isPriceVisible}
            onChange={(event) =>
              setValues({ ...values, isPriceVisible: event.target.checked })
            }
            className="h-4 w-4 accent-[#f5f0e8]"
          />
          <span className="text-white/75">Show price on the public site</span>
        </label>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="border border-white/30 px-4 py-2 text-sm hover:border-white/60 disabled:opacity-60"
        >
          {pending ? 'Saving…' : mode === 'create' ? 'Create artwork' : 'Save changes'}
        </button>
        {dirty ? (
          <p className="self-center text-xs text-white/45">Unsaved changes</p>
        ) : null}
      </div>
    </form>
  );
}
