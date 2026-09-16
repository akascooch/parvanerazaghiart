import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeIn } from '@/components/public/FadeIn';
import { StudioVideoCard } from '@/components/public/StudioVideoCard';
import { artist } from '@/data/artist-data';
import { ogImages, serializeJsonLd, siteName, siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: `${artist.profile} ${artist.disciplines}.`,
  alternates: { canonical: '/about' },
  openGraph: {
    title: `About — ${siteName}`,
    description: artist.profile,
    url: siteUrl('/about'),
    type: 'profile',
    images: ogImages({
      url: artist.assets.portrait,
      alt: artist.name,
      width: artist.assets.portraitWidth,
      height: artist.assets.portraitHeight,
    }),
  },
  twitter: {
    card: 'summary_large_image',
    title: `About — ${siteName}`,
    description: artist.profile,
    images: [siteUrl(artist.assets.portrait)],
  },
};

function FactPill({ label, value }: { label: string; value: string }) {
  return (
    <p className="border border-ink/10 px-4 py-3">
      <span className="block text-[11px] uppercase tracking-[0.22em] text-muted">{label}</span>
      <span className="mt-1 block text-sm leading-snug text-ink">{value}</span>
    </p>
  );
}

export default function AboutPage() {
  const { assets } = artist;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.name,
    jobTitle: artist.profession,
    nationality: artist.nationality,
    url: siteUrl('/about'),
    image: siteUrl(assets.portrait),
    sameAs: [artist.socials.instagramUrl, artist.socials.websiteUrl],
    knowsAbout: [...artist.fields],
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <FadeIn>
        <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
          <figure className="mx-auto w-full max-w-sm overflow-hidden bg-ink/[0.03] ring-1 ring-ink/10 shadow-[0_24px_48px_-28px_rgba(26,24,20,0.45)] lg:mx-0 lg:max-w-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.portrait}
              alt={artist.name}
              width={assets.portraitWidth}
              height={assets.portraitHeight}
              className="aspect-[2/3] w-full object-cover object-top"
              fetchPriority="high"
              decoding="async"
            />
          </figure>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted">The artist</p>
            <h1 className="mt-3 font-display text-4xl tracking-tight md:text-6xl">{artist.name}</h1>
            <p className="mt-3 text-sm tracking-wide text-muted">
              {artist.profession} · {artist.disciplines}
            </p>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/90">{artist.statement}</p>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">{artist.profile}</p>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">{artist.experience}</p>

            <dl className="mt-10 grid gap-3 sm:grid-cols-3">
              <FactPill
                label="Education"
                value={artist.education.map((item) => item.institution).join(' · ')}
              />
              <FactPill label="Memberships" value={artist.memberships.join(' · ')} />
              <FactPill label="Mediums" value={artist.mediums.join(' · ')} />
            </dl>

            <p className="mt-8 text-sm text-muted">
              {artist.basedIn}
              {' · '}
              <a
                href={artist.socials.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                @{artist.socials.instagramHandle}
              </a>
            </p>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08} className="mt-24">
        <section aria-labelledby="atelier-heading">
          <header className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">The atelier</p>
            <h2 id="atelier-heading" className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              In the studio
            </h2>
            <p className="mt-4 text-muted">
              A working room of oil, mixed media, and slow looking. The still and the film below
              are from the studio — not catalogue works.
            </p>
          </header>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(14rem,0.55fr)] lg:gap-10">
            <figure className="overflow-hidden bg-ink/[0.03] ring-1 ring-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assets.atelier}
                alt={`${artist.name} painting in the studio`}
                width={assets.atelierWidth}
                height={assets.atelierHeight}
                className="aspect-[3/4] w-full object-cover object-center sm:aspect-[5/4] lg:aspect-[4/5]"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="px-1 pt-3 text-sm text-muted">
                At the canvas — oil and mixed media, Tehran.
              </figcaption>
            </figure>
            <div className="mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none">
              <StudioVideoCard />
              <p className="mt-3 text-sm text-muted">
                Studio film, played only when you choose. Reduced-motion visitors may remain with
                the still.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-24">
        <section aria-labelledby="cv-heading">
          <header className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Curriculum vitae</p>
            <h2 id="cv-heading" className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              Exhibitions
            </h2>
            <p className="mt-4 text-muted">
              Selected solo presentations in Iran, and group exhibitions including Switzerland,
              Italy, Russia, Portugal, France, and China.
            </p>
          </header>

          <div className="mt-12 grid gap-16 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-xl tracking-tight">Solo exhibitions</h3>
              <ol className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {artist.soloExhibitions.map((item) => (
                  <li
                    key={`${item.year}-${item.venue}`}
                    className="grid grid-cols-[4.5rem_1fr] gap-4 py-4 sm:grid-cols-[5rem_1fr]"
                  >
                    <span className="text-sm tabular-nums text-muted">{item.year}</span>
                    <span>
                      <span className="block text-ink">{item.venue}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {item.location}, {item.country}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="font-display text-xl tracking-tight">International group exhibitions</h3>
              <ol className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {artist.internationalGroupExhibitions.map((item) => (
                  <li
                    key={`${item.year}-${item.country}-${item.title}`}
                    className="grid grid-cols-[4.5rem_1fr] gap-4 py-4 sm:grid-cols-[5rem_1fr]"
                  >
                    <span className="text-sm tabular-nums text-muted">{item.year}</span>
                    <span>
                      <span className="block text-ink">{item.title}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {item.venue === item.title
                          ? item.country
                          : `${item.venue} · ${item.country}`}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="font-display text-xl tracking-tight">Selected group exhibitions</h3>
            <ol className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {artist.groupExhibitions.map((item) => (
                <li
                  key={`${item.year}-${item.venue}-${item.title}`}
                  className="grid grid-cols-[4.5rem_1fr] gap-4 py-4 sm:grid-cols-[5rem_1fr_auto]"
                >
                  <span className="text-sm tabular-nums text-muted">{item.year}</span>
                  <span>
                    <span className="block text-ink">{item.title}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {item.venue}
                      {item.venue !== item.location ? ` · ${item.location}` : ''}
                    </span>
                  </span>
                  <span className="hidden text-sm text-muted sm:block">{item.country}</span>
                </li>
              ))}
            </ol>
          </div>

          <ul className="mt-10 flex flex-wrap gap-2" aria-label="International presentations">
            {artist.internationalPresentations.map((country) => (
              <li
                key={country}
                className="border border-ink/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted"
              >
                {country}
              </li>
            ))}
          </ul>
        </section>
      </FadeIn>

      <FadeIn delay={0.12} className="mt-24">
        <section className="border border-ink/10 px-6 py-12 text-center sm:px-12">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Studio</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight">The collection, privately</h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Works currently on view may be requested in confidence. Prices marked as on request
            remain private.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/gallery"
              className="inline-flex min-h-11 items-center border border-ink/20 px-6 py-3 text-sm tracking-wide hover:border-ink/50"
            >
              Explore the Collection
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center px-6 py-3 text-sm tracking-wide text-ink/80 underline-offset-4 hover:text-ink hover:underline"
            >
              Private Acquisition Inquiry
            </Link>
          </div>
        </section>
      </FadeIn>
    </main>
  );
}
