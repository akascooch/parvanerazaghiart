import Link from 'next/link';
import { AdminApiError, adminBackend } from '@/lib/admin-backend';
import type { AdminCategory } from '@/types';

export default async function AdminCategoriesPage() {
  let categories: AdminCategory[] = [];
  let error: string | null = null;
  try {
    categories = await adminBackend<AdminCategory[]>(
      '/admin/categories?includeInactive=true',
    );
  } catch (caught) {
    error =
      caught instanceof AdminApiError
        ? caught.message
        : 'Could not load categories';
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Catalog</p>
          <h1 className="mt-2 font-display text-3xl">Categories</h1>
          <p className="mt-2 text-sm text-white/55">
            Assignable groups for the public gallery. Categories in use are
            deactivated instead of deleted.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="border border-white/25 px-4 py-2 text-sm text-white/80 hover:border-white/50"
        >
          Add category
        </Link>
      </div>

      {error ? (
        <p className="mt-8 border border-red-400/20 px-4 py-6 text-sm text-red-200/90">
          {error}
        </p>
      ) : categories.length === 0 ? (
        <section className="mt-8 border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl">No categories yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
            Create a category, then bind it to artworks from the collection form.
          </p>
        </section>
      ) : (
        <div className="mt-8 overflow-x-auto border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-white/45">
              <tr>
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Slug</th>
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal">Works</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="hover:text-white"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/55">{category.slug}</td>
                  <td className="px-4 py-3 text-white/55">{category.sortOrder}</td>
                  <td className="px-4 py-3 text-white/55">{category.artworkCount ?? 0}</td>
                  <td className="px-4 py-3 text-white/55">
                    {category.isActive ? 'Active' : 'Inactive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
