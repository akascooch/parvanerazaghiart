'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type AmbientCinemaCanvasProps = {
  videoSrc: string;
  posterSrc: string;
  className?: string;
  overlayOpacity?: string;
  blurEffect?: boolean;
};

export function AmbientCinemaCanvas({
  videoSrc,
  posterSrc,
  className,
  overlayOpacity = 'opacity-40',
  blurEffect = false,
}: AmbientCinemaCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = videoRef.current;
    if (!node || reduceMotion) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          const playback = node.play();
          if (playback) {
            playback.catch(() => {
              /* Autoplay may be blocked; poster remains visible. */
            });
          }
        } else {
          node.pause();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      node.pause();
    };
  }, [reduceMotion, videoSrc]);

  return (
    <div
      className={cn('pointer-events-none relative isolate overflow-hidden bg-paper', className)}
      aria-hidden="true"
    >
      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full scale-[1.04] object-cover',
            blurEffect && 'blur-[2px]',
          )}
        />
      ) : (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            blurEffect && 'scale-105 blur-[1.5px]',
          )}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b from-noir/25 via-paper/10 to-paper',
          overlayOpacity,
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,#f7f4ef_92%)]" />
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,rgba(18,17,16,0.18)_0px,rgba(18,17,16,0.18)_1px,transparent_1px,transparent_3px)]" />
    </div>
  );
}
