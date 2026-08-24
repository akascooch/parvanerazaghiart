export const DERIVATIVE_VARIANTS = ['thumb', 'preview', 'full'] as const;
export type DerivativeVariant = (typeof DERIVATIVE_VARIANTS)[number];

export const DERIVATIVE_SPECS: Record<
  DerivativeVariant,
  { maxEdge: number; label: string }
> = {
  thumb: { maxEdge: 480, label: 'thumbnail' },
  preview: { maxEdge: 1280, label: 'gallery preview' },
  full: { maxEdge: 2400, label: 'full-size optimized' },
};

export type DerivativeRecord = {
  storageKey: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
};

export type DerivativeMap = Partial<Record<DerivativeVariant, DerivativeRecord>>;

export function isDerivativeVariant(value: string): value is DerivativeVariant {
  return (DERIVATIVE_VARIANTS as readonly string[]).includes(value);
}

export function derivativeStorageKey(
  artworkId: string,
  mediaId: string,
  variant: DerivativeVariant,
): string {
  return `${artworkId}/deriv/${mediaId}.${variant}`;
}
