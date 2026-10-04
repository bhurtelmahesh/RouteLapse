import { ArrowRight, CheckCircle2, FileUp, Film, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { seoPages } from "@/lib/seo-pages";
import { RoutePreviewVisual } from "./route-preview-visual";

const homeFaqs = [
  { question: "What is RouteLapse?", answer: "RouteLapse is a free GPX route video maker for runs, walks, hikes, rides, and other GPS activities. It turns GPX or TCX data into an animated map video in your browser." },
  { question: "Can I animate a Strava route?", answer: "Yes. Export an individual Strava activity as GPX, import it into RouteLapse, and customize the route animation. Direct Strava account connection is not active yet." },
  { question: "Does RouteLapse support vertical videos?", answer: "Yes. Choose 9:16 for vertical video, 1:1 for square, or 16:9 for landscape. Camera, overlays, and labels adapt to the selected canvas." },
  { question: "Is RouteLapse free?", answer: "Yes. You can import an activity, customize the animation, and render a route video without creating an account." },
];

export function HomeSeoContent() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: homeFaqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return (
    <section id="route-video-maker" className="border-t border-white/8 bg-[#080b0f] px-5 py-20 text-[#f4f7f8] sm:px-8 sm:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d8ff52]">Free GPX animation maker</div>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-6xl">Turn your running or walking route into a video</h1>
            <p className="mt-6 text-base leading-7 text-[#a0abb5] sm:text-lg">RouteLapse is a free GPX route video maker for runs, walks, hikes, and rides. Upload a GPX or TCX activity, animate it over street or satellite maps, add pace and elevation heat maps, and export a share-ready HD video.</p>
            <Link href="#editor" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#d8ff52] px-5 py-3 text-sm font-bold text-[#0c1003] transition hover:brightness-110">Open the route video editor <ArrowRight size={16} /></Link>
          </div>
          <RoutePreviewVisual accent="#d8ff52" label="Morning Run · 5.04 km" routeKind="HD VIDEO" />
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/8 bg-white/[0.025] p-6"><FileUp size={19} className="text-[#d8ff52]" /><h2 className="mt-4 text-lg font-bold">Import GPX, TCX, or ZIP</h2><p className="mt-3 text-sm leading-6 text-[#8e99a3]">Start with a GPS activity from a watch, Strava export, fitness service, or navigation app. RouteLapse also includes a real demo run.</p></article>
          <article className="rounded-2xl border border-white/8 bg-white/[0.025] p-6"><Sparkles size={19} className="text-[#d8ff52]" /><h2 className="mt-4 text-lg font-bold">Design the route animation</h2><p className="mt-3 text-sm leading-6 text-[#8e99a3]">Control speed, pitch, zoom, Forward-up orientation, satellite maps, route colors, metrics, and pace or elevation heat maps.</p></article>
          <article className="rounded-2xl border border-white/8 bg-white/[0.025] p-6"><Film size={19} className="text-[#d8ff52]" /><h2 className="mt-4 text-lg font-bold">Export a share-ready video</h2><p className="mt-3 text-sm leading-6 text-[#8e99a3]">Render an HD GPS route animation in landscape, portrait, or square format with customizable overlays and an animated outro.</p></article>
        </div>

        <section className="mt-24" aria-labelledby="route-video-guides">
          <div className="max-w-3xl"><div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d8ff52]">Use-case guides</div><h2 id="route-video-guides" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Create the route video you searched for</h2><p className="mt-4 text-sm leading-6 text-[#8f9aa4]">Detailed guides explain each workflow, from converting GPX to video to animating a Strava route or visualizing pace and elevation.</p></div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {seoPages.map((page) => <Link key={page.slug} href={`/${page.slug}`} className="group rounded-2xl border border-white/8 bg-[#0d1218] p-5 transition hover:border-[#d8ff52]/35 hover:bg-[#111820]"><div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#77838e]">{page.eyebrow}</div><h3 className="mt-2 text-base font-bold group-hover:text-[#d8ff52]">{page.heading}</h3><p className="mt-3 line-clamp-3 text-xs leading-5 text-[#828e98]">{page.intro}</p><ArrowRight className="mt-5 text-[#66727c] group-hover:text-[#d8ff52]" size={15} /></Link>)}
          </div>
        </section>

        <section className="mt-24 grid gap-10 lg:grid-cols-[0.75fr_1.25fr]" aria-labelledby="route-video-faq">
          <div><ShieldCheck size={22} className="text-[#d8ff52]" /><h2 id="route-video-faq" className="mt-4 text-3xl font-bold tracking-[-0.035em]">RouteLapse questions</h2><p className="mt-4 text-sm leading-6 text-[#8f9aa4]">No account is required. Activity editing and video rendering stay in the browser.</p><div className="mt-6 space-y-2 text-xs text-[#8d99a3]">{['Free route video maker', 'Street, satellite, hybrid, and dark maps', 'Pace and elevation animation', '16:9, 9:16, and 1:1 video'].map((item) => <div key={item} className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#d8ff52]" />{item}</div>)}</div></div>
          <div className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.02] px-5 sm:px-7">{homeFaqs.map((faq) => <details key={faq.question} className="py-5"><summary className="cursor-pointer list-none font-bold">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-[#8f9aa4]">{faq.answer}</p></details>)}</div>
        </section>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-8 text-xs text-[#6f7b85]"><span>© RouteLapse · Motion from movement</span><nav className="flex flex-wrap gap-5" aria-label="Footer navigation"><Link href="/guide" className="hover:text-white">User guide</Link><Link href="/gpx-to-video" className="hover:text-white">GPX to video</Link><Link href="/strava-route-animation" className="hover:text-white">Strava animation</Link></nav></footer>
      </div>
    </section>
  );
}
