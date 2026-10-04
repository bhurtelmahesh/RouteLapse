import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/seo-landing-page";
import { seoPageBySlug, seoPages } from "@/lib/seo-pages";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return seoPages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPageBySlug.get(slug);
  if (!page) return {};
  const url = `/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${page.title} | RouteLapse`, description: page.description, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "RouteLapse GPX route video maker" }] },
    twitter: { card: "summary_large_image", title: `${page.title} | RouteLapse`, description: page.description, images: ["/opengraph-image"] },
  };
}

export default async function SeoPage({ params }: Props) {
  const { slug } = await params;
  const page = seoPageBySlug.get(slug);
  if (!page) notFound();
  return <SeoLandingPage page={page} />;
}
