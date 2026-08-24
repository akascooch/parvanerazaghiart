import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtworkForm } from '@/components/admin/ArtworkForm';
import { ArtworkMediaPanel } from '@/components/admin/ArtworkMediaPanel';
import { SoftDeleteButton } from '@/components/admin/SoftDeleteButton';
import { AdminApiError, adminBackend } from '@/lib/admin-backend';
import type { AdminArtwork } from '@/types';

export default async function EditArtworkPage({
  params,
}: {
  params: { id: string };
}) {
  let artwork: AdminArtwork;
  try {
    artwork = await adminBackend<AdminArtwork>(`/admin/artworks/${params.id}`);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">Catalog</p>
      <h1 className="mt-2 font-display text-3xl">{artwork.title}</h1>
      <p className="mt-2 text-sm text-white/55">Slug: {artwork.slug}</p>
      <p className="mt-4">
        <Link href="/admin/artworks" className="text-sm text-white/55 hover:text-white">
          ← Back to collection
        </Link>
      </p>
      <div className="mt-8">
        <ArtworkForm mode="edit" artwork={artwork} />
      </div>
      <div className="mt-10">
        <ArtworkMediaPanel artworkId={artwork.id} media={artwork.media ?? []} />
      </div>
      <div className="mt-10 border-t border-white/10 pt-6">
        <SoftDeleteButton id={artwork.id} title={artwork.title} />
      </div>
    </main>
  );
}
