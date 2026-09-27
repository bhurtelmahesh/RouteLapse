import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const siteUrl = "https://routelapse.web.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RouteLapse — Create Cinematic Running Route Videos",
    template: "%s | RouteLapse",
  },
  description:
    "Turn GPX running routes into cinematic HD map videos. Customize playback speed, camera angle, aspect ratio, and route style directly in your browser.",
  applicationName: "RouteLapse",
  keywords: [
    "GPX video maker",
    "running route video",
    "Strava route animation",
    "GPS route animation",
    "map animation maker",
    "route video generator",
  ],
  authors: [{ name: "RouteLapse" }],
  creator: "RouteLapse",
  publisher: "RouteLapse",
  alternates: { canonical: "/" },
  category: "sports",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "RouteLapse",
    title: "RouteLapse — Create Cinematic Running Route Videos",
    description:
      "Turn GPX running routes into cinematic, share-ready map videos with customizable cameras and timing.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "RouteLapse route video studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RouteLapse — Create Cinematic Running Route Videos",
    description: "Turn GPX running routes into cinematic, share-ready map videos.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: { google: "dg6YVBmGolXuU_SUnhSHwQOul_ssSOEtyW0oQn4RpAQ" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RouteLapse",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#080b0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "RouteLapse",
    url: siteUrl,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern web browser with JavaScript enabled.",
    description:
      "A privacy-first web app for turning GPX running routes into cinematic map videos.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Import GPX running routes",
      "Animate routes on an interactive map",
      "Customize camera angle and video timing",
      "Create landscape, portrait, and square videos",
    ],
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
