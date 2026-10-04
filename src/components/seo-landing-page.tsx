import { ArrowRight, CheckCircle2, Route } from "lucide-react";
import Link from "next/link";
import { seoPageBySlug, type SeoPage } from "@/lib/seo-pages";
import { RoutePreviewVisual } from "./route-preview-visual";
import { SeoSiteHeader } from "./seo-site-header";

export function SeoLandingPage({ page }: { page: SeoPage }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "RouteLapse", item: "https://routelapse.web.app/" },
      { "@type": "ListItem", position: 2, name: page.heading, item: `https://routelapse.web.app/${page.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#080b0f] text-[#f4f7f8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <SeoSiteHeader />

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d8ff52]">{page.eyebrow}</div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-6xl">{page.heading}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#a0abb5] sm:text-lg">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#editor" className="inline-flex items-center gap-2 rounded-xl bg-[#d8ff52] px-5 py-3 text-sm font-bold text-[#0c1003] transition hover:brightness-110">Create a route video <ArrowRight size={16} /></Link>
            <Link href="/guide" className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.035] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.07]">Read the guide</Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#84909b]">
            {['Free to use', 'GPX & TCX', 'Local rendering'].map((item) => <span key={item} className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#d8ff52]" />{item}</span>)}
          </div>
        </div>
        <figure><RoutePreviewVisual accent={page.accent} label={page.visualLabel} routeKind={page.routeKind} /><figcaption className="mt-3 text-xs leading-5 text-[#74808b]">{page.visualCaption}</figcaption></figure>
      </section>

      <section className="border-y border-white/8 bg-white/[0.018]">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-14 sm:px-8 md:grid-cols-3">
          {page.benefits.map((benefit) => <article key={benefit.title} className="rounded-2xl border border-white/8 bg-[#0d1218] p-6"><Route size={18} className="text-[#d8ff52]" /><h2 className="mt-4 text-lg font-bold">{benefit.title}</h2><p className="mt-3 text-sm leading-6 text-[#8f9aa4]">{benefit.body}</p></article>)}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d8ff52]">How it works</div>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">From recorded route to finished video</h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {page.steps.map((step, index) => <article key={step.title}><div className="font-mono text-sm font-bold text-[#d8ff52]">0{index + 1}</div><h3 className="mt-3 text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#8f9aa4]">{step.body}</p></article>)}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8 sm:pb-24">
        <h2 className="text-3xl font-bold tracking-[-0.035em]">Frequently asked questions</h2>
        <div className="mt-7 divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.02] px-5 sm:px-7">
          {page.faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="cursor-pointer list-none pr-8 text-base font-bold marker:hidden">{faq.question}</summary><p className="mt-3 max-w-3xl text-sm leading-6 text-[#909ba5]">{faq.answer}</p></details>)}
        </div>
      </section>

      <section className="border-t border-white/8 bg-[#0b0f14]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <h2 className="text-2xl font-bold">Explore more RouteLapse guides</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {page.related.map((slug) => { const related = seoPageBySlug.get(slug); return related ? <Link key={slug} href={`/${slug}`} className="group rounded-xl border border-white/8 bg-white/[0.025] p-4 transition hover:border-[#d8ff52]/35"><span className="text-sm font-bold group-hover:text-[#d8ff52]">{related.heading}</span><ArrowRight className="mt-3 text-[#68747e] group-hover:text-[#d8ff52]" size={15} /></Link> : null; })}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-7 text-xs text-[#707b85]"><span>© RouteLapse · Free GPX route video maker</span><div className="flex gap-4"><Link href="/guide" className="hover:text-white">User guide</Link><Link href="/#editor" className="hover:text-white">Open editor</Link></div></div>
        </div>
      </section>
    </main>
  );
}
