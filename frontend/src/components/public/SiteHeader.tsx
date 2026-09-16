'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { artist, publicPrimaryNav } from '@/data/artist-data';
import { cn } from '@/lib/utils';

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const { assets, name } = artist;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="relative z-30 border-b border-ink/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="relative flex shrink-0 items-center"
          aria-label={`${name} — home`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.logo}
            alt={name}
            width={assets.logoWidth}
            height={assets.logoHeight}
            className="brand-mark h-9 w-auto sm:h-10 md:h-11"
          />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 text-sm text-muted md:flex"
        >
          {publicPrimaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'tracking-wide transition-colors hover:text-ink',
                isActivePath(pathname, link.href) && 'text-ink',
              )}
              aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {open ? (
        <div
          id={menuId}
          className="border-t border-ink/10 bg-canvas md:hidden"
        >
          <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {publicPrimaryNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'min-h-11 border-b border-ink/5 py-3 text-base tracking-wide text-muted last:border-b-0 hover:text-ink',
                  isActivePath(pathname, link.href) && 'text-ink',
                )}
                aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
