import Link from 'next/link';
import type { ArtworkStatus } from '@/types';

const filters: { label: string; value?: ArtworkStatus; deleted?: boolean }[] = [
  { label: 'All' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Sold', value: 'SOLD' },
  { label: 'Deleted', deleted: true },
];

export function ArtworkFilters({
  status,
  q,
  deleted,
}: {
  status?: string;
  q?: string;
  deleted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = filter.deleted
            ? Boolean(deleted)
            : !deleted && (filter.value ?? '') === (status ?? '');
          const href = filter.deleted
            ? '/admin/artworks?deleted=1'
            : filter.value
              ? `/admin/artworks?status=${filter.value}`
              : '/admin/artworks';
          return (
            <Link
              key={filter.label}
              href={href}
              className={`border px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${
                active
                  ? 'border-white/40 bg-white/10 text-[#f5f0e8]'
                  : 'border-white/15 text-white/55 hover:border-white/30'
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <form action="/admin/artworks" className="flex w-full max-w-sm gap-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        {deleted ? <input type="hidden" name="deleted" value="1" /> : null}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title or slug"
          className="w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
        />
        <button
          type="submit"
          className="border border-white/25 px-3 py-2 text-sm text-white/80 hover:border-white/50"
        >
          Search
        </button>
      </form>
    </div>
  );
}
