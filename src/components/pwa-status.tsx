"use client";

import { Download, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaStatus() {
  const [online, setOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstall);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstall);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (!online) {
    return <span className="hidden items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[10px] font-semibold text-amber-200 sm:flex"><WifiOff size={12} /> Offline</span>;
  }
  if (installPrompt) {
    return <button onClick={() => void install()} className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-[#aab3bb] transition hover:bg-white/[0.07] sm:flex"><Download size={12} className="text-[#d8ff52]" /> Install app</button>;
  }
  return null;
}
