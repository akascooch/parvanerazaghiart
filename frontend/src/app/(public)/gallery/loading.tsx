export default function GalleryLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-muted">Collection</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Gallery</h1>
      <p className="mt-4 text-muted">Loading works…</p>
      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[4/5] bg-ink/[0.06]" />
            <div className="mt-3 h-5 w-2/3 bg-ink/[0.06]" />
            <div className="mt-2 h-4 w-1/2 bg-ink/[0.04]" />
          </div>
        ))}
      </div>
    </main>
  );
}
