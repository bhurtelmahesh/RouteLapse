"use client";

import {
  Clock3,
  Compass,
  Download,
  Film,
  Gauge,
  Layers3,
  LockKeyhole,
  MapPinned,
  Mountain,
  Pause,
  Play,
  RotateCcw,
  Route,
  Sparkles,
  Upload,
  WifiOff,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import { parseGpx } from "@/lib/gpx";
import { demoTrack, formatDistance, formatDuration, type Track } from "@/lib/track";
import { RouteMap, type CameraMode } from "./route-map";

type Aspect = "16:9" | "9:16" | "1:1";

const aspectRatio: Record<Aspect, string> = {
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "1:1": "1 / 1",
};

function Metric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7f8b97]">
        <Icon size={12} /> {label}
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export function Studio() {
  const [track, setTrack] = useState<Track>(() => demoTrack());
  const [progress, setProgress] = useState(0.22);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(18);
  const [cameraMode, setCameraMode] = useState<CameraMode>("cinematic");
  const [pitch, setPitch] = useState(48);
  const [lineColor, setLineColor] = useState("#d8ff52");
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const startedAt = performance.now() - progressRef.current * duration * 1000;
    const tick = (now: number) => {
      const nextProgress = Math.min(1, (now - startedAt) / (duration * 1000));
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      if (nextProgress >= 1) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);

  async function importFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (!file.name.toLowerCase().endsWith(".gpx")) throw new Error("Choose a .gpx activity file.");
      const imported = parseGpx(await file.text(), file.name);
      setTrack(imported);
      setProgress(0);
      progressRef.current = 0;
      setPlaying(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The GPX file could not be opened.");
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    void importFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void importFile(event.dataTransfer.files?.[0]);
  }

  function resetPlayback() {
    setPlaying(false);
    setProgress(0);
    progressRef.current = 0;
  }

  function showDemo() {
    setTrack(demoTrack());
    setError("");
    resetPlayback();
  }

  const activityMinutes = track.durationSeconds ? Math.round(track.durationSeconds / 60) : 0;
  const compressed = activityMinutes ? Math.max(1, Math.round((activityMinutes * 60) / duration)) : 1;

  return (
    <main className="min-h-screen bg-[#080b0f] text-[#f4f7f8]">
      <header className="flex h-16 items-center justify-between border-b border-white/8 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d8ff52] text-[#0c1003] shadow-[0_0_28px_rgba(216,255,82,0.2)]">
            <Route size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-[-0.02em]">RouteLapse</h1>
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#77838e]">Motion from movement</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#8d99a5] sm:flex">
            <LockKeyhole size={12} className="text-[#d8ff52]" /> Routes stay local
          </div>
          <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#c5ccd2] transition hover:bg-white/[0.08]">
            Save project
          </button>
        </div>
      </header>

      <div className="studio-grid">
        <aside className="library-panel border-r border-white/8 bg-[#0a0e13] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#83909c]">Activity</h2>
            <span className="rounded-md bg-[#d8ff52]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#d8ff52]">GPX ready</span>
          </div>

          <input ref={inputRef} type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" onChange={handleFile} className="hidden" />
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="group mb-3 rounded-2xl border border-dashed border-white/14 bg-white/[0.025] p-5 text-center transition hover:border-[#d8ff52]/60 hover:bg-[#d8ff52]/[0.035]"
          >
            <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/[0.055] text-[#d8ff52] transition group-hover:scale-105">
              <Upload size={18} />
            </div>
            <p className="text-sm font-semibold">Drop a GPX file</p>
            <p className="mt-1 text-[11px] leading-4 text-[#74808b]">or click to choose an activity</p>
          </div>

          {error && <p className="mb-3 rounded-lg border border-red-400/20 bg-red-400/8 p-2 text-[11px] leading-4 text-red-200">{error}</p>}

          <div className="rounded-2xl border border-white/9 bg-[#10151c] p-4 shadow-xl shadow-black/10">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{track.name}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#7e8994]">
                  <MapPinned size={11} /> {track.sport}
                </div>
              </div>
              <button onClick={showDemo} className="shrink-0 text-[#7f8b97] transition hover:text-white" title="Restore demo route">
                <RotateCcw size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Metric icon={Gauge} label="Distance" value={formatDistance(track.distanceMeters)} />
              <Metric icon={Clock3} label="Recorded" value={formatDuration(track.durationSeconds)} />
              <Metric icon={Mountain} label="Climb" value={`${Math.round(track.elevationGainMeters)} m`} />
              <Metric icon={Layers3} label="Points" value={track.points.length.toLocaleString()} />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/7 bg-white/[0.018] p-3 text-[10px] leading-4 text-[#6f7b86]">
            <div className="mb-1 flex items-center gap-2 font-semibold text-[#9ba5ae]"><WifiOff size={12} /> Privacy-first workspace</div>
            Files are parsed in this browser and are not uploaded during editing.
          </div>
        </aside>

        <section className="subtle-grid flex min-w-0 flex-col p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold"><Film size={15} className="text-[#d8ff52]" /> Preview</div>
              <p className="mt-1 text-[10px] text-[#75818c]">Frame-accurate scene controls arrive with the render engine.</p>
            </div>
            <div className="rounded-lg border border-white/8 bg-[#0b0f14]/90 px-2.5 py-1.5 font-mono text-[10px] text-[#8d99a4]">1080p · 30 fps</div>
          </div>

          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/9 bg-[#05070a] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
            <div
              className="map-shell relative w-full overflow-hidden rounded-xl bg-[#11161c]"
              style={{ "--preview-ratio": aspectRatio[aspect] } as React.CSSProperties}
            >
              <RouteMap track={track} progress={progress} cameraMode={cameraMode} pitch={pitch} lineColor={lineColor} />
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/65 to-transparent p-4 sm:p-6">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#d8ff52]">RouteLapse original</div>
                  <div className="mt-1 max-w-[300px] truncate text-lg font-semibold tracking-tight sm:text-2xl">{track.name}</div>
                </div>
                <div className="rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-right backdrop-blur-md">
                  <div className="font-mono text-sm font-semibold">{formatDistance(track.distanceMeters * progress)}</div>
                  <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/55">distance</div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 sm:p-6 sm:pt-16">
                <div className="text-[10px] text-white/60">{Math.round(progress * 100)}% complete</div>
                <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55"><Sparkles size={11} className="text-[#d8ff52]" /> cinematic preview</div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-[#0c1117] p-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (progress >= 1) resetPlayback();
                  setPlaying((value) => !value);
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d8ff52] text-[#0c1003] transition hover:brightness-110"
                aria-label={playing ? "Pause preview" : "Play preview"}
              >
                {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
              </button>
              <div className="min-w-0 flex-1">
                <input
                  aria-label="Preview progress"
                  className="range-track w-full"
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={progress}
                  onChange={(event) => {
                    setPlaying(false);
                    setProgress(Number(event.target.value));
                  }}
                />
                <div className="mt-1.5 flex justify-between font-mono text-[9px] text-[#67737e]"><span>00:00</span><span>00:{String(duration).padStart(2, "0")}</span></div>
              </div>
              <button onClick={resetPlayback} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/9 text-[#89949e] transition hover:bg-white/[0.05] hover:text-white" aria-label="Reset preview">
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </section>

        <aside className="inspector-panel border-l border-white/8 bg-[#0a0e13] p-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#83909c]">Direction</h2>
            <Compass size={15} className="text-[#d8ff52]" />
          </div>
          <div className="inspector-content">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]">Camera</label>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#111720] p-1">
                {(["overview", "follow", "cinematic"] as CameraMode[]).map((mode) => (
                  <button key={mode} onClick={() => setCameraMode(mode)} className={`rounded-lg px-2 py-2 text-[10px] font-semibold capitalize transition ${cameraMode === mode ? "bg-white/10 text-white" : "text-[#6f7c87] hover:text-white"}`}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 sm:mt-0 lg:mt-5">
              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]"><label htmlFor="duration">Video duration</label><span className="font-mono text-[#d8ff52]">{duration}s</span></div>
              <input id="duration" className="range-track w-full" type="range" min="8" max="60" step="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
              <div className="mt-2 text-[10px] text-[#697580]">About {compressed}× real-time compression</div>
            </div>

            <div className="mt-5 sm:mt-0 lg:mt-5">
              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]"><label htmlFor="pitch">Camera pitch</label><span className="font-mono text-[#d8ff52]">{pitch}°</span></div>
              <input id="pitch" className="range-track w-full" type="range" min="0" max="60" step="1" value={pitch} onChange={(event) => setPitch(Number(event.target.value))} disabled={cameraMode === "overview"} />
            </div>

            <div className="mt-5 border-t border-white/8 pt-5 sm:mt-0 sm:border-0 sm:pt-0 lg:mt-5 lg:border-t lg:pt-5">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]">Canvas</label>
              <div className="grid grid-cols-3 gap-2">
                {(["16:9", "9:16", "1:1"] as Aspect[]).map((value) => (
                  <button key={value} onClick={() => setAspect(value)} className={`rounded-lg border px-2 py-2 font-mono text-[10px] transition ${aspect === value ? "border-[#d8ff52]/50 bg-[#d8ff52]/8 text-[#d8ff52]" : "border-white/8 text-[#78848f] hover:border-white/16"}`}>
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 sm:mt-0 lg:mt-5">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]">Route color</label>
              <div className="flex gap-2">
                {["#d8ff52", "#ff6b45", "#6bdcff", "#f7f7f2"].map((color) => (
                  <button key={color} onClick={() => setLineColor(color)} aria-label={`Use route color ${color}`} className={`h-8 flex-1 rounded-lg border transition ${lineColor === color ? "border-white/70 scale-[1.03]" : "border-white/8"}`} style={{ background: color }} />
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#d8ff52]/15 bg-[#d8ff52]/[0.035] p-3 sm:mt-0 lg:mt-5">
              <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d8ff52]"><Sparkles size={12} /> Next milestone</div>
              <p className="text-[10px] leading-4 text-[#89958c]">Frame rendering, map themes, and downloadable MP4 output.</p>
            </div>

            <button disabled className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#d8ff52] px-4 py-3 text-xs font-bold text-[#0b0f03] opacity-60 sm:mt-0 lg:mt-5">
              <Download size={15} /> Render HD video
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
