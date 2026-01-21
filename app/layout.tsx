import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lenny's Podcast AI - Search 269 Episodes",
  description:
    "AI-powered search through Lenny's Podcast transcripts. Find insights from world-class product leaders and growth experts.",
  keywords: [
    "product management",
    "growth",
    "startup",
    "podcast",
    "AI search",
    "Lenny Rachitsky",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
