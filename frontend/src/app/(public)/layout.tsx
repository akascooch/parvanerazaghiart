import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-canvas focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div id="content">{children}</div>
      <footer className="mt-24 border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 text-sm text-muted sm:px-6">
          <p>Parvane Razaghi Art</p>
          <Link href="/gallery" className="hover:text-ink">
            Collection
          </Link>
        </div>
      </footer>
    </div>
  );
}
