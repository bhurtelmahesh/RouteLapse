import { Gauge, Mountain, Play, Route } from "lucide-react";

type Props = {
  accent: string;
  label: string;
  routeKind: string;
};

export function RoutePreviewVisual({ accent, label, routeKind }: Props) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#111820] shadow-[0_30px_80px_rgba(0,0,0,0.35)]" role="img" aria-label={`${label} animated route video example`}>
      <div className="absolute inset-0 opacity-65" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)", backgroundSize: "42px 42px", transform: "rotate(-8deg) scale(1.15)" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_44%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(135deg,rgba(22,42,37,.9),rgba(8,12,17,.9))]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 450" aria-hidden="true">
        <path d="M92 346 C176 316 156 226 254 220 C354 214 304 115 420 118 C520 122 501 261 618 242 C699 229 665 139 735 92" fill="none" stroke="rgba(255,255,255,.13)" strokeLinecap="round" strokeWidth="22" />
        <path d="M92 346 C176 316 156 226 254 220 C354 214 304 115 420 118 C520 122 501 261 618 242 C699 229 665 139 735 92" fill="none" stroke={accent} strokeLinecap="round" strokeWidth="9" />
        <circle cx="92" cy="346" fill="#fff" r="12" stroke={accent} strokeWidth="7" />
        <circle cx="735" cy="92" fill={accent} r="13" />
      </svg>
      <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/70 to-transparent p-5 sm:p-7">
        <div><div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>RouteLapse preview</div><div className="mt-1 text-lg font-bold sm:text-2xl">{label}</div></div>
        <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1 font-mono text-[9px] font-bold tracking-[0.16em] text-white/70">{routeKind}</span>
      </div>
      <div className="absolute bottom-5 left-5 rounded-xl border border-white/12 bg-black/55 p-3 backdrop-blur-md sm:bottom-7 sm:left-7">
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-white"><span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/55"><Gauge size={11} /> Distance</span><span className="font-mono text-xs font-bold">5.04 km</span><span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/55"><Mountain size={11} /> Climb</span><span className="font-mono text-xs font-bold">+50 m</span></div>
      </div>
      <span className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center rounded-full text-[#0c1003] shadow-lg sm:bottom-7 sm:right-7" style={{ background: accent }}><Play size={17} fill="currentColor" /></span>
      <Route className="absolute right-[18%] top-[41%] text-white/35" size={18} />
    </div>
  );
}
