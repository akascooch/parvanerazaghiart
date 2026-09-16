import Link from 'next/link';
import { FadeIn } from '@/components/public/FadeIn';
import { artist } from '@/data/artist-data';

export function ArtistTeaser() {
  const { assets, name, philosophy, basedIn, experience } = artist;

  return (
    <FadeIn>
      <section
        aria-labelledby="artist-teaser-heading"
        className="border-y border-noir/10 py-20 sm:py-24"
      >
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
          <figure className="mx-auto w-full max-w-sm overflow-hidden bg-ink/[0.03] ring-1 ring-noir/10 lg:mx-0 lg:max-w-none">
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
            <figcaption className="border-t border-noir/10 px-4 py-3 font-sans text-[10px] uppercase tracking-luxury text-muted">
              {name} · Studio portrait · {basedIn}
            </figcaption>
          </figure>
          <div className="border-l border-gold/40 pl-6 sm:pl-10">
            <p className="font-sans text-[11px] uppercase tracking-luxury text-muted">
              The artist & the atelier
            </p>
            <h2
              id="artist-teaser-heading"
              className="mt-4 font-serif text-4xl font-normal tracking-tight text-noir md:text-5xl"
            >
              {name}
            </h2>
            <blockquote className="mt-6 max-w-xl font-serif text-xl font-light italic leading-relaxed text-noir/80">
              <p>“{philosophy}”</p>
            </blockquote>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">{experience}</p>
            <Link
              href="/about"
              className="mt-8 inline-flex min-h-11 items-center font-sans text-xs uppercase tracking-luxury text-noir underline-offset-8 hover:text-gold hover:underline"
            >
              Biography & exhibitions
            </Link>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
