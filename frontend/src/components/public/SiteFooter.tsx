import Link from 'next/link';
import { artist, publicFooterNav } from '@/data/artist-data';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-ink/10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-muted sm:px-6 md:grid-cols-3 md:items-center md:gap-6">
        <p className="md:justify-self-start">
          © {year} {artist.name}. All rights reserved.
        </p>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-center"
        >
          {publicFooterNav.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="md:justify-self-end">
          <a
            href="https://instagram.com/techooch"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-xs tracking-wide text-[#6b6560] transition-colors hover:text-[#1a1814]"
          >
            <span>Powered by</span>
            <span className="font-semibold uppercase tracking-widest text-[#1a1814] underline-offset-4 group-hover:underline">
              TECHOOCH
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
