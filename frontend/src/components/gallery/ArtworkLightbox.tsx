'use client';

import { useEffect } from 'react';
import type { PublicMedia } from '@/types';
import { GalleryImage } from './GalleryImage';

export function ArtworkLightbox({
  title,
  media,
}: {
  title: string;
  media: PublicMedia[];
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const match = window.location.hash.match(/^#lightbox-(\d+)$/);
      if (!match) {
        return;
      }
      const index = Number(match[1]);
      if (event.key === 'Escape') {
        window.location.hash = '';
      }
      if (event.key === 'ArrowRight') {
        window.location.hash = `#lightbox-${(index + 1) % media.length}`;
      }
      if (event.key === 'ArrowLeft') {
        window.location.hash = `#lightbox-${(index - 1 + media.length) % media.length}`;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [media.length]);

  if (media.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <ul className="grid gap-4 sm:grid-cols-2">
        {media.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#lightbox-${index}`}
              className="block overflow-hidden bg-ink/[0.03] focus:outline-none focus:ring-2 focus:ring-ink/40"
            >
              <GalleryImage
                media={item}
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 480px"
                className="aspect-[4/5] w-full object-cover"
              />
              <span className="sr-only">View larger: {item.alt || title}</span>
            </a>
          </li>
        ))}
      </ul>

      {media.map((item, index) => {
        const prev = (index - 1 + media.length) % media.length;
        const next = (index + 1) % media.length;
        return (
          <section
            key={item.id}
            id={`lightbox-${index}`}
            className="lightbox"
            aria-label={`${title} image ${index + 1} of ${media.length}`}
          >
            <a href="#content" className="lightbox-backdrop" aria-label="Close image viewer">
              Close
            </a>
            <div className="lightbox-stage">
              <GalleryImage
                media={item}
                priority={false}
                sizes="100vw"
                className="max-h-[86vh] w-auto max-w-full object-contain"
              />
              <p className="mt-3 text-sm text-white/70">{item.alt || title}</p>
              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <a href={`#lightbox-${prev}`} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/30 px-3">
                  Previous
                </a>
                <a href="#content" className="text-white/70">
                  Close
                </a>
                <a href={`#lightbox-${next}`} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/30 px-3">
                  Next
                </a>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
