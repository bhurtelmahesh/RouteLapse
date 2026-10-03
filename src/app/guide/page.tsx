import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Camera, Download, FileUp, Gauge, ImagePlus, LockKeyhole, Route } from "lucide-react";

export const metadata: Metadata = {
  title: "User Guide",
  description: "Learn how to import GPX and TCX activities, customize RouteLapse cameras and overlays, and render Full HD running-route videos.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "RouteLapse User Guide",
    description: "A step-by-step guide to creating cinematic running-route videos from GPX and TCX files.",
    url: "/guide",
  },
};

const steps = [
  { icon: Route, title: "Start with the demo", body: "The studio opens with a real Morning Run route so you can try every control before importing your own activity." },
  { icon: FileUp, title: "Import an activity", body: "Drop a GPX or TCX file into the Activity panel. ZIP exports containing GPX or TCX activities are also supported." },
  { icon: Camera, title: "Direct the camera", body: "Choose Overview, Follow, or Cinematic. Set pitch and zoom, optionally fit the whole route, or enable Forward-up to rotate the map beneath a fixed frame. The preview temporarily flattens while you drag for precise movement; use the fixed +/− controls, double-click, or pinch to zoom without capturing page scrolling." },
  { icon: Gauge, title: "Design the metrics", body: "Choose a solid route or a progressive Pace/Elevation heat map with custom low/high colors and a video legend. Show or hide the metrics card, choose its fields, select Vertical or Grid, adjust text size, and place it in any of six positions." },
  { icon: ImagePlus, title: "Add a transparent overlay", body: "Import a transparent PNG or WebP—such as a Strava-style metrics card—then drag, resize, center, or position it independently from RouteLapse metrics." },
  { icon: Download, title: "Render and download", body: "Choose 16:9, 9:16, or 1:1, decide whether to show the optional routelapse.web.app corner watermark, then select Render HD video. Every export includes the animated RouteLapse outro. Keep the tab open until the MP4 or WebM download is ready." },
];

const cameraRows = [
  ["Overview", "A static route-centered camera. Your chosen zoom is used unless Fit full route is enabled."],
  ["Follow", "Tracks the moving activity point at your chosen zoom and finishes with a centered full-route reveal."],
  ["Cinematic", "Combines tracking, pitch, optional Forward-up orientation, and the final full-route reveal."],
];

export default function GuidePage() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to create a running route video with RouteLapse",
    description: "Import an activity, customize its map animation, and render a Full HD route video.",
    step: steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.title, text: step.body })),
  };

  return (
    <main className="min-h-screen bg-[#080b0f] text-[#f4f7f8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo).replace(/</g, "\\u003c") }} />
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/8 bg-[#080b0f]/90 px-4 backdrop-blur-xl sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="RouteLapse studio">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d8ff52] text-[#0c1003]"><Route size={20} strokeWidth={2.4} /></span>
          <span><span className="block text-[15px] font-bold">RouteLapse</span><span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#77838e]">User guide</span></span>
        </Link>
        <Link href="/" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#c5ccd2] transition hover:bg-white/[0.08] hover:text-white"><ArrowLeft size={14} /> Back to studio</Link>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-3xl">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#d8ff52]">RouteLapse user guide</div>
          <h1 className="text-4xl font-bold tracking-[-0.045em] sm:text-6xl">Turn a recorded route into a cinematic video.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#9aa5af] sm:text-lg">RouteLapse edits and renders locally in your browser. This guide walks through the complete workflow from activity import to a share-ready Full HD video.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#d8ff52] px-5 py-3 text-sm font-bold text-[#0b0f03] transition hover:brightness-110">Open the studio <Route size={16} /></Link>
        </div>

        <section className="mt-20" aria-labelledby="quick-start">
          <h2 id="quick-start" className="text-2xl font-bold tracking-tight sm:text-3xl">Quick start</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return <article key={step.title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d8ff52]/10 text-[#d8ff52]"><Icon size={18} /></span><div><div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#77838f]">Step {index + 1}</div><h3 className="mt-1 text-base font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#8d99a4]">{step.body}</p></div></div></article>;
            })}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="camera-modes">
          <h2 id="camera-modes" className="text-2xl font-bold tracking-tight sm:text-3xl">Camera modes</h2>
          <div className="mt-7 overflow-hidden rounded-2xl border border-white/8">
            {cameraRows.map(([name, description]) => <div key={name} className="grid gap-2 border-b border-white/8 bg-white/[0.02] p-5 last:border-b-0 sm:grid-cols-[140px_1fr]"><h3 className="font-bold text-[#d8ff52]">{name}</h3><p className="text-sm leading-6 text-[#929da7]">{description}</p></div>)}
          </div>
        </section>

        <section className="mt-20 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-white/8 bg-white/[0.025] p-6"><LockKeyhole className="text-[#d8ff52]" size={20} /><h2 className="mt-4 text-xl font-bold">Privacy and saving</h2><p className="mt-3 text-sm leading-6 text-[#929da7]">Imported activity files stay in the current browser session and are not uploaded by the editor. Design settings save automatically in local browser storage; there is no manual Save button.</p></article>
          <article className="rounded-2xl border border-white/8 bg-white/[0.025] p-6"><Download className="text-[#d8ff52]" size={20} /><h2 className="mt-4 text-xl font-bold">Browser and device support</h2><p className="mt-3 text-sm leading-6 text-[#929da7]">The responsive editor, route preview, activity import, overlay controls, and installable PWA work on mobile devices. For dependable Full HD export, use a current desktop version of Chrome or Edge. Android Chrome may render shorter videos on capable phones if RouteLapse remains in the foreground; iPhone and iPad editing works, but local HD export is not yet guaranteed. An internet connection is required to load map tiles. MP4 is preferred, with WebM used when available encoders require it.</p></article>
        </section>

        <section className="mt-20 rounded-2xl border border-[#d8ff52]/15 bg-[#d8ff52]/[0.035] p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Using Strava data</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#9aa59d]">Export the activity as GPX from Strava and import that file into RouteLapse. Direct Strava account connection is not active yet. You can add a transparent PNG or WebP metrics card over the video and hide RouteLapse’s built-in metrics card.</p>
        </section>
      </div>
    </main>
  );
}
