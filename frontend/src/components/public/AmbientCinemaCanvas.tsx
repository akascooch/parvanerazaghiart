'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
  const [shouldStream, setShouldStream] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || reduceMotion) {
      return undefined;
    }

    let cancelled = false;
    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const clearDeferred = () => {
      if (idleHandle !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        clearTimeout(timeoutHandle);
      }
      idleHandle = null;
      timeoutHandle = null;
    };

    const beginStream = () => {
      if (cancelled) {
        return;
      }
      setShouldStream(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          // Keep the first paint free for HTML/CSS/JS on slow domestic links.
          if ('requestIdleCallback' in window) {
            idleHandle = window.requestIdleCallback(beginStream, { timeout: 2500 });
          } else {
            timeoutHandle = setTimeout(beginStream, 1200);
          }
        } else {
          clearDeferred();
          node.pause();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      clearDeferred();
      observer.disconnect();
      node.pause();
    };
  }, [reduceMotion, videoSrc]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !shouldStream || reduceMotion) {
      return;
    }
    node.load();
    const playback = node.play();
    if (playback) {
      playback.catch(() => {
        /* Autoplay may be blocked; poster remains visible. */
      });
    }
  }, [shouldStream, reduceMotion, videoSrc]);

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
          muted
          loop
          playsInline
          preload="none"
        >
          {shouldStream ? <source src={videoSrc} type="video/mp4" /> : null}
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
