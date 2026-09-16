import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { defaultOgImage } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Parvane Razaghi Art",
    template: "%s — Parvane Razaghi Art",
  },
  description:
    "Selected paintings and works on paper by Parvane Razaghi — a quiet public gallery.",
  applicationName: "Parvane Razaghi Art",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Parvane Razaghi Art",
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [defaultOgImage.url],
  },
  robots: { index: true, follow: true },
};

function FilmGrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-overlay"
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="pra-film-grain" x="0" y="0">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#pra-film-grain)" />
      </svg>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className={`${cormorant.variable} ${inter.variable} min-h-screen antialiased`}>
        {children}
        <FilmGrainOverlay />
      </body>
    </html>
  );
}
