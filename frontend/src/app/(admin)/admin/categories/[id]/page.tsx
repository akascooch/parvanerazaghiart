import { notFound } from 'next/navigation';
import { CategoryEditor } from '@/components/admin/CategoryEditor';
import { AdminApiError, adminBackend } from '@/lib/admin-backend';
import type { AdminCategory } from '@/types';

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  let category: AdminCategory;
  try {
    category = await adminBackend<AdminCategory>(`/admin/categories/${params.id}`);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <CategoryEditor category={category} />;
}
