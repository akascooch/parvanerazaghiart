import type { Metadata } from 'next';
import { InquiryForm } from '@/components/public/InquiryForm';
import { fetchPublicArtwork } from '@/lib/public-gallery';
import { defaultDescription, siteName, siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: { work?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const work = searchParams.work?.trim();
  const title = work ? `Enquire · ${work}` : 'Contact';
  const description = work
    ? `Private enquiry about ${work} from the Parvane Razaghi studio.`
    : 'Enquire about available works by Parvane Razaghi. Prices on request are handled privately.';
  const canonical = work ? `/contact?work=${encodeURIComponent(work)}` : '/contact';
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} — ${siteName}`,
      description,
      url: siteUrl(canonical),
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  };
}

export default async function ContactPage({ searchParams }: Props) {
  const work = searchParams.work?.trim();
  const artwork = work ? await fetchPublicArtwork(work) : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-muted">Studio</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Contact</h1>
      <p className="mt-4 text-muted">
        {defaultDescription} Prices marked as on request stay private. This form
        never displays a hidden price.
      </p>
      <div className="mt-10">
        <InquiryForm
          artworkSlug={artwork?.slug ?? work}
          artworkTitle={artwork?.title}
        />
      </div>
    </main>
  );
}
