'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { AmbientCinemaCanvas } from '@/components/public/AmbientCinemaCanvas';
import { artist } from '@/data/artist-data';

const luxuryEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function HeroCinematic() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate -mt-20 flex min-h-[100dvh] items-end overflow-hidden pb-16 pt-32 sm:items-center sm:pb-24 sm:pt-28">
      <AmbientCinemaCanvas
        videoSrc="/newv/5852479938275320255.mp4"
        posterSrc="/newv/IMG_20260913_102917_796.jpg"
        className="absolute inset-0 z-0 h-full w-full"
        overlayOpacity="opacity-30"
        blurEffect
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-paper via-paper/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-paper via-paper/55 to-transparent" />

      <div className="relative z-[2] mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: luxuryEase }}
          className="mb-4 font-sans text-[11px] uppercase tracking-luxury text-muted md:text-xs"
        >
          Contemporary Figurative Art & Expressionism
        </motion.p>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.08, ease: luxuryEase }}
          aria-label="Parvaneh Razaghi Art"
          className="max-w-[min(100%,20rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
        >
          <Image
            src={artist.assets.logo}
            alt="Parvaneh Razaghi Art"
            width={artist.assets.logoWidth}
            height={artist.assets.logoHeight}
            priority
            sizes="(max-width: 640px) 20rem, (max-width: 768px) 36rem, (max-width: 1024px) 42rem, 48rem"
            className="site-logo h-auto w-full object-contain"
          />
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.16, ease: luxuryEase }}
          className="mt-6 max-w-2xl font-serif text-lg font-light italic leading-relaxed text-noir/80 md:text-2xl"
        >
          Capturing the delicate tension between human vulnerability, classical form, and modern
          emotion.
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.24, ease: luxuryEase }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/gallery"
            className="inline-flex min-h-11 items-center justify-center bg-noir px-8 py-3.5 text-center font-sans text-xs uppercase tracking-luxury text-paper transition-all duration-300 hover:bg-gold"
          >
            View the collection
          </Link>
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center justify-center border border-noir/20 px-8 py-3.5 text-center font-sans text-xs uppercase tracking-luxury text-noir backdrop-blur-sm transition-all duration-300 hover:border-noir"
          >
            The artist
          </Link>
        </motion.div>
      </div>

      <a
        href="#curated-works"
        className="absolute bottom-8 left-1/2 z-[2] flex min-h-11 -translate-x-1/2 flex-col items-center justify-end gap-2 font-sans text-[10px] uppercase tracking-luxury text-muted hover:text-gold"
      >
        <span>Discover Works</span>
        <span className="h-8 w-px origin-top bg-noir/30 motion-safe:animate-pulse" />
      </a>
    </section>
  );
}
