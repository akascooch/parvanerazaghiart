import { SiteFooter } from '@/components/public/SiteFooter';
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-40 focus:bg-canvas focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div id="content" className="pt-20">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
