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
    "Turn GPX running routes into cinematic HD map videos with pace and elevation heat maps. Customize the camera, timing, overlays, and aspect ratio in your browser.",
  applicationName: "RouteLapse",
  keywords: [
    "GPX video maker",
    "running route video",
    "Strava route animation",
    "GPS route animation",
    "map animation maker",
    "route video generator",
    "running heat map video",
    "pace heat map",
    "elevation route map",
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
      "Create cinematic GPX route videos with animated pace and elevation heat maps, custom cameras, overlays, and Full HD export.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "RouteLapse cinematic GPX route videos with pace and elevation heat maps" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RouteLapse — Create Cinematic Running Route Videos",
    description: "Create cinematic GPX route videos with animated pace and elevation heat maps and Full HD export.",
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
      "A privacy-first web app for turning GPX running routes into cinematic Full HD map videos with pace and elevation heat maps.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Import GPX running routes",
      "Animate routes on an interactive map",
      "Visualize pace and elevation as animated route heat maps",
      "Customize camera angle and video timing",
      "Create landscape, portrait, and square videos",
      "Export Full HD route videos with metrics and image overlays",
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
