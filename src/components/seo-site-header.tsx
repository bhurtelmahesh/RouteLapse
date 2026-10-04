import { Route } from "lucide-react";
import Link from "next/link";

export function SeoSiteHeader() {
  return (
    <header className="border-b border-white/8 bg-[#080b0f]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="RouteLapse home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d8ff52] text-[#0c1003]"><Route size={20} strokeWidth={2.4} /></span>
          <span><span className="block text-[15px] font-bold">RouteLapse</span><span className="block text-[8px] font-semibold uppercase tracking-[0.22em] text-[#77838e]">Motion from movement</span></span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Primary navigation">
          <Link href="/guide" className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-[#9aa5af] transition hover:text-white sm:block">User guide</Link>
          <Link href="/#editor" className="rounded-lg bg-[#d8ff52] px-4 py-2 text-xs font-bold text-[#0c1003] transition hover:brightness-110">Open editor</Link>
        </nav>
      </div>
    </header>
  );
}
