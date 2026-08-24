export default function ArtworkLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-muted">Artwork</p>
      <div className="mt-4 h-10 w-2/3 max-w-md animate-pulse bg-ink/[0.06]" />
      <p className="mt-6 text-muted">Loading this work…</p>
      <div className="mt-12 aspect-[4/5] max-w-xl animate-pulse bg-ink/[0.06]" />
    </main>
  );
}
