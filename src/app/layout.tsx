import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "sonner";
import { getSiteUrl, indexingEnabled, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: `${SITE_NAME} — Everyday, elevated`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  robots: { index: indexingEnabled(), follow: true, googleBot: { index: indexingEnabled(), follow: true, "max-image-preview": "large" } },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  openGraph: {
    title: "Drape & Line — Everyday, elevated",
    description:
      "Thoughtful essentials for everyday life.",
    type: "website",
    locale: "en_PK",
    siteName: "Drape & Line",
    images: [{ url: "/social-image", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drape & Line — Everyday, elevated",
    description:
      "Thoughtful essentials for everyday life.",
    images: ["/social-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
