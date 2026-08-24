const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function siteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return siteUrl(path.startsWith('/') ? path : `/${path}`);
}

export const siteName = 'Parvane Razaghi Art';

export const defaultDescription =
  'Selected paintings and works on paper by Parvane Razaghi — a quiet public gallery.';

export const defaultOgImage = {
  url: siteUrl('/og.jpg'),
  alt: siteName,
  width: 1200,
  height: 630,
};

export function ogImages(image?: {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  if (!image?.url) {
    return [defaultOgImage];
  }
  return [
    {
      url: absoluteUrl(image.url),
      alt: image.alt ?? siteName,
      width: image.width,
      height: image.height,
    },
  ];
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
