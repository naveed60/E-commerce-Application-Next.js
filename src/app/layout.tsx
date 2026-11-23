import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
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
  title: "Drape & Line — Everyday, elevated",
  description:
    "Thoughtful essentials for everyday life.",
  openGraph: {
    title: "Drape & Line — Everyday, elevated",
    description:
      "Thoughtful essentials for everyday life.",
    type: "website",
    locale: "en_US",
    siteName: "Drape & Line",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drape & Line — Everyday, elevated",
    description:
      "Thoughtful essentials for everyday life.",
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
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
