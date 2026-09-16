import Link from 'next/link';
import { FadeIn } from '@/components/public/FadeIn';
import { artist } from '@/data/artist-data';

export function ArtistTeaser() {
  const { assets, name, philosophy } = artist;

  return (
    <FadeIn>
      <section
        aria-labelledby="artist-teaser-heading"
        className="mt-24 border-y border-ink/10 py-14 sm:py-16"
      >
        <div className="grid items-center gap-8 sm:grid-cols-[7.5rem_1fr] sm:gap-10">
          <figure className="mx-auto w-24 overflow-hidden bg-ink/[0.04] ring-1 ring-ink/10 sm:mx-0 sm:w-[7.5rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.portrait}
              alt={name}
              width={assets.portraitWidth}
              height={assets.portraitHeight}
              className="aspect-[2/3] w-full object-cover object-top"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">The artist & the atelier</p>
            <h2 id="artist-teaser-heading" className="mt-3 font-display text-2xl tracking-tight sm:text-3xl">
              {name}
            </h2>
            <blockquote className="mt-4 max-w-xl text-muted">
              <p>“{philosophy}”</p>
            </blockquote>
            <Link
              href="/about"
              className="mt-6 inline-flex min-h-11 items-center text-sm tracking-wide text-ink/80 underline-offset-4 hover:text-ink hover:underline"
            >
              Read Biography & Exhibitions →
            </Link>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
