'use client';

import { useCallback, useRef, useState } from 'react';
import { artist } from '@/data/artist-data';

export function StudioVideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const { assets, name } = artist;

  const startPlayback = useCallback(async () => {
    const node = videoRef.current;
    if (!node) {
      return;
    }
    setStarted(true);
    try {
      await node.play();
    } catch {
      node.controls = true;
    }
  }, []);

  return (
    <figure className="relative overflow-hidden bg-ink/[0.04] ring-1 ring-ink/10">
      <video
        ref={videoRef}
        className="aspect-[9/16] w-full object-cover"
        poster={assets.atelier}
        preload="none"
        muted
        playsInline
        controls={started}
        width={assets.studioVideoWidth}
        height={assets.studioVideoHeight}
        aria-label={`${name} in the studio`}
      >
        <source src={assets.studioVideo} type="video/mp4" />
      </video>
      {started ? null : (
        <button
          type="button"
          onClick={() => {
            void startPlayback();
          }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/25 text-[#f5f0e8] transition-colors hover:bg-ink/35"
          aria-label="Play studio film"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f5f0e8]/70">
            <span className="ml-0.5 border-y-[7px] border-l-[12px] border-y-transparent border-l-[#f5f0e8]" />
          </span>
          <span className="text-xs uppercase tracking-[0.28em]">Studio film</span>
        </button>
      )}
      <figcaption className="sr-only">
        A short film from {name}&apos;s atelier. Playback is started by the visitor; the file is
        not autoplayed.
      </figcaption>
    </figure>
  );
}
