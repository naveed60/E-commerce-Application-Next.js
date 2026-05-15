import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { ScrollProgress } from "@/components/animations/scroll-progress";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextShop — Modern commerce kit",
  description:
    "A clean Next.js commerce starter with PostgreSQL, authentication, and a responsive admin dashboard.",
  openGraph: {
    title: "NextShop — Modern commerce kit",
    description:
      "A clean Next.js commerce starter with PostgreSQL, authentication, and a responsive admin dashboard.",
    type: "website",
    locale: "en_US",
    siteName: "NextShop",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextShop — Modern commerce kit",
    description:
      "A clean Next.js commerce starter with PostgreSQL, authentication, and a responsive admin dashboard.",
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
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-zinc-900 antialiased dark:bg-black dark:text-white`}
        suppressHydrationWarning
      >
        <ScrollProgress />
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
