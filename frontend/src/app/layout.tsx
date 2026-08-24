import type { Metadata } from "next";
import { defaultOgImage } from "@/lib/site";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
