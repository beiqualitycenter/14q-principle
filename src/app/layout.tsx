import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://14q-principle.vercel.app"
  ),

  title: {
    default: "14Q Basics Principle | BUMJIN",
    template: "%s | 14Q Basics Principle",
  },

  description:
    "14Q Basics Principle Training Test - BUMJIN Electronics Indonesia",

  keywords: [
    "14Q Basics Principle",
    "14Q Principle",
    "BUMJIN Electronics Indonesia",
    "Quality Training",
    "Post Test",
    "Pre Test",
  ],

  openGraph: {
    title: "14Q Basics Principle | BUMJIN",
    description:
      "14Q Basics Principle Training Test - BUMJIN Electronics Indonesia",
    url: "https://14q-principle.vercel.app",
    siteName: "14Q Basics Principle",
    images: [
      {
        url: "/og_bei.png",
        width: 800,
        height: 450,
        alt: "14Q Basics Principle - BUMJIN Electronics Indonesia",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "14Q Basics Principle | BUMJIN",
    description:
      "14Q Basics Principle Training Test - BUMJIN Electronics Indonesia",
    images: ["/og_bei.png"],
  },

  icons: {
    icon: "/icon.png",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}