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
  title: {
    default: "PsychAI - AI-Powered Mental Health Support",
    template: "%s | PsychAI"
  },
  description: "Your AI-powered mental health companion. Get personalized support and guidance through evidence-based psychological techniques with advanced document understanding.",
  keywords: ["mental health", "AI therapy", "psychology", "CBT", "DBT", "therapeutic support", "mental wellness"],
  authors: [{ name: "PsychAI Team" }],
  creator: "PsychAI",
  publisher: "PsychAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://psychai.app",
    siteName: "PsychAI",
    title: "PsychAI - AI-Powered Mental Health Support",
    description: "Your AI-powered mental health companion. Get personalized support and guidance through evidence-based psychological techniques.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PsychAI - AI-Powered Mental Health Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PsychAI - AI-Powered Mental Health Support",
    description: "Your AI-powered mental health companion. Get personalized support and guidance through evidence-based psychological techniques.",
    images: ["/og-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ec4899" },
    { media: "(prefers-color-scheme: dark)", color: "#ec4899" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
