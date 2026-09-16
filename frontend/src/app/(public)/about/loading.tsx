export default function AboutLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-muted">The artist</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Parvaneh Razaghi</h1>
      <p className="mt-4 text-muted">Loading biography…</p>
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div className="aspect-[2/3] animate-pulse bg-ink/[0.06]" />
        <div className="space-y-4">
          <div className="h-4 w-3/4 animate-pulse bg-ink/[0.05]" />
          <div className="h-4 w-full animate-pulse bg-ink/[0.04]" />
          <div className="h-4 w-5/6 animate-pulse bg-ink/[0.04]" />
        </div>
      </div>
    </main>
  );
}
