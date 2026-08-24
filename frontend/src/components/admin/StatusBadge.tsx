import type { ArtworkStatus } from '@/types';

const tones: Record<ArtworkStatus, string> = {
  DRAFT: 'border-white/20 text-white/60',
  PUBLISHED: 'border-emerald-400/40 text-emerald-200/90',
  SOLD: 'border-amber-400/40 text-amber-200/90',
};

export function StatusBadge({ status }: { status: ArtworkStatus }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] ${tones[status]}`}
    >
      {status}
    </span>
  );
}
