import Link from 'next/link';

export default function ArtworkNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Artwork not found</h1>
      <p className="mt-3 text-muted">
        This work is not in the public collection, or the link is no longer valid.
      </p>
      <Link href="/gallery" className="mt-8 inline-block text-sm underline">
        Return to the gallery
      </Link>
    </main>
  );
}
