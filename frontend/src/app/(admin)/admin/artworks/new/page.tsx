import Link from 'next/link';
import { ArtworkForm } from '@/components/admin/ArtworkForm';

export default function NewArtworkPage() {
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">Catalog</p>
      <h1 className="mt-2 font-display text-3xl">New artwork</h1>
      <p className="mt-2 max-w-xl text-sm text-white/55">
        Save the catalog record first. Media upload is intentionally deferred.
      </p>
      <p className="mt-4">
        <Link href="/admin/artworks" className="text-sm text-white/55 hover:text-white">
          ← Back to collection
        </Link>
      </p>
      <div className="mt-8">
        <ArtworkForm mode="create" />
      </div>
    </main>
  );
}
