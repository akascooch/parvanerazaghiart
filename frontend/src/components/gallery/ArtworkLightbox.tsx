'use client';

import { useEffect } from 'react';
import type { PublicMedia } from '@/types';
import { GalleryImage, mediaAspectStyle } from './GalleryImage';

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
              className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden border border-noir/5 bg-parchment p-4 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-ink/40 sm:p-5 hover:border-gold/30 hover:shadow-lg"
            >
              <GalleryImage
                media={item}
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 480px"
                className="h-auto w-auto max-h-full max-w-full min-h-0 min-w-0 object-contain drop-shadow-md"
                style={mediaAspectStyle(item.width, item.height)}
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
                className="mx-auto max-h-[86vh] w-auto max-w-full object-contain"
                style={mediaAspectStyle(item.width, item.height)}
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
