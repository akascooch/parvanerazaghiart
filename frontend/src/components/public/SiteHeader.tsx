'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { artist, publicPrimaryNav } from '@/data/artist-data';
import { cn } from '@/lib/utils';

const luxuryEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const reduceMotion = useReducedMotion();
  const { assets, name } = artist;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const frosted = scrolled || open;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-luxury',
        frosted
          ? 'border-b border-noir/5 bg-paper/75 shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="relative flex min-h-11 shrink-0 items-center"
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

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {publicPrimaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative py-2 font-sans text-xs uppercase tracking-luxury text-muted transition-colors duration-300 hover:text-gold',
                'after:absolute after:bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full',
                isActivePath(pathname, link.href) && 'text-noir after:w-full after:bg-gold',
              )}
              aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center text-noir md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            key="mobile-nav"
            initial={reduceMotion ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: luxuryEase }}
            className="border-t border-noir/5 bg-paper/95 backdrop-blur-md md:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6">
              {publicPrimaryNav.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index, ease: luxuryEase }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'flex min-h-11 items-center border-b border-noir/5 py-3 font-sans text-sm uppercase tracking-luxury text-muted last:border-b-0 hover:text-gold',
                      isActivePath(pathname, link.href) && 'text-noir',
                    )}
                    aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
