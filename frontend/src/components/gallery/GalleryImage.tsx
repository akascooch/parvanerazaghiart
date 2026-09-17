import type { CSSProperties } from 'react';
import type { PublicMedia } from '@/types';

type Props = {
  media: PublicMedia;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function mediaAspectStyle(
  width: number | null | undefined,
  height: number | null | undefined,
): CSSProperties | undefined {
  if (!width || !height) {
    return undefined;
  }
  return { aspectRatio: `${width} / ${height}` };
}

export function GalleryImage({
  media,
  sizes,
  priority = false,
  className,
  style,
}: Props) {
  return (
    // Native img + srcset: avoids Next image optimizer during mixed dev/prod runtimes.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.src.preview}
      srcSet={`${media.src.thumb} 480w, ${media.src.preview} 1280w, ${media.src.full} 2400w`}
      sizes={sizes}
      alt={media.alt}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={{ ...mediaAspectStyle(media.width, media.height), ...style }}
    />
  );
}
