import Link from 'next/link';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">Catalog</p>
      <h1 className="mt-2 font-display text-3xl">New category</h1>
      <p className="mt-4">
        <Link href="/admin/categories" className="text-sm text-white/55 hover:text-white">
          ← Back to categories
        </Link>
      </p>
      <div className="mt-8">
        <CategoryForm mode="create" />
      </div>
    </main>
  );
}
