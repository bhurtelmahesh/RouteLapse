"use client";

import {
  Clock3,
  Compass,
  Download,
  Film,
  Gauge,
  HelpCircle,
  ImagePlus,
  Layers3,
  LockKeyhole,
  MapPinned,
  Mountain,
  Pause,
  Play,
  RotateCcw,
  Route,
  Search,
  Sparkles,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import { importActivityFiles } from "@/lib/activity-import";
import { loadProjectSettings, saveProjectSettings } from "@/lib/project-settings";
import type { MapStyle } from "@/lib/map-styles";
import { activityMetrics } from "@/lib/activity-metrics";
import { aspectRatio, metricLabels, overlayPositionLabels, type Aspect, type CameraMode, type MetricKey, type MetricLayout, type OverlayPosition } from "@/lib/scene";
import { demoTrack, formatDistance, formatDuration, type Track } from "@/lib/track";
import { renderRouteVideo, videoFileName, type RenderProgress } from "@/lib/video-renderer";
import { ActivityProfile } from "./activity-profile";
import { PwaStatus } from "./pwa-status";
import { RouteMap } from "./route-map";

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

const overlayPositionClass: Record<OverlayPosition, string> = {
  "top-left": "left-4 top-24 sm:left-6 sm:top-28",
  "top-right": "right-4 top-24 sm:right-6 sm:top-28",
  "center-left": "left-4 top-1/2 -translate-y-1/2 sm:left-6",
  "center-right": "right-4 top-1/2 -translate-y-1/2 sm:right-6",
  "bottom-left": "bottom-14 left-4 sm:bottom-16 sm:left-6",
  "bottom-right": "bottom-14 right-4 sm:bottom-16 sm:right-6",
};

export function Studio() {
  const [tracks, setTracks] = useState<Track[]>(() => [demoTrack()]);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [progress, setProgress] = useState(0.22);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(18);
  const [cameraMode, setCameraMode] = useState<CameraMode>("cinematic");
  const [pitch, setPitch] = useState(48);
  const [cameraZoom, setCameraZoom] = useState(16);
  const [forwardUp, setForwardUp] = useState(false);
  const [overviewAutoFit, setOverviewAutoFit] = useState(false);
  const [lineColor, setLineColor] = useState("#d8ff52");
  const [mapStyle, setMapStyle] = useState<MapStyle>("hybrid");
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [showMetricCard, setShowMetricCard] = useState(true);
  const [metricFields, setMetricFields] = useState<MetricKey[]>(["distance", "elapsed", "pace"]);
  const [metricLayout, setMetricLayout] = useState<MetricLayout>("vertical");
  const [metricScale, setMetricScale] = useState(1.2);
  const [metricPosition, setMetricPosition] = useState<OverlayPosition>("bottom-left");
  const [imagePosition, setImagePosition] = useState<OverlayPosition>("bottom-right");
  const [overlayImage, setOverlayImage] = useState<{ name: string; src: string } | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [renderedVideo, setRenderedVideo] = useState<{ url: string; name: string; type: string } | null>(null);
  const [renderError, setRenderError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef(progress);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderAbortRef = useRef<AbortController | null>(null);
  const track = tracks[selectedTrack] ?? tracks[0];
  const sports = Array.from(new Set(tracks.map((item) => item.sport))).sort();
  const filteredTracks = tracks
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => sportFilter === "all" || item.sport === sportFilter)
    .filter(({ item }) => item.name.toLowerCase().includes(search.trim().toLowerCase()));

  useEffect(() => {
    const settings = loadProjectSettings();
    const frame = window.requestAnimationFrame(() => {
      if (settings) {
        setDuration(settings.duration);
        setCameraMode(settings.cameraMode);
        setPitch(settings.pitch);
        setCameraZoom(settings.cameraZoom ?? 16);
        setForwardUp(settings.forwardUp ?? false);
        setOverviewAutoFit(settings.overviewAutoFit ?? false);
        setLineColor(settings.lineColor);
        setAspect(settings.aspect);
        setMapStyle(settings.mapStyle);
        setShowMetricCard(settings.showMetricCard ?? true);
        setMetricFields(settings.metricFields ?? ["distance", "elapsed", "pace"]);
        setMetricLayout(settings.metricLayout ?? "vertical");
        setMetricScale(settings.metricScale ?? 1.2);
        setMetricPosition(settings.metricPosition ?? "bottom-left");
        setImagePosition(settings.imagePosition ?? "bottom-right");
      }
      setSettingsLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    saveProjectSettings({ duration, cameraMode, pitch, cameraZoom, forwardUp, overviewAutoFit, lineColor, aspect, mapStyle, showMetricCard, metricFields, metricLayout, metricScale, metricPosition, imagePosition });
  }, [settingsLoaded, duration, cameraMode, pitch, cameraZoom, forwardUp, overviewAutoFit, lineColor, aspect, mapStyle, showMetricCard, metricFields, metricLayout, metricScale, metricPosition, imagePosition]);

  useEffect(() => () => renderAbortRef.current?.abort(), []);

  useEffect(() => {
    const src = overlayImage?.src;
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [overlayImage]);

  useEffect(() => {
    const url = renderedVideo?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [renderedVideo]);

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

  async function importFiles(files: File[]) {
    if (!files.length) return;
    setError("");
    try {
      const imported = await importActivityFiles(files);
      setTracks(
        [...imported].sort((a, b) =>
          (b.startedAt ?? "").localeCompare(a.startedAt ?? ""),
        ),
      );
      setSelectedTrack(0);
      setProgress(0);
      progressRef.current = 0;
      setPlaying(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The activity file could not be opened.");
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    void importFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void importFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function resetPlayback() {
    setPlaying(false);
    setProgress(0);
    progressRef.current = 0;
  }

  function showDemo() {
    setTracks([demoTrack()]);
    setSelectedTrack(0);
    setError("");
    resetPlayback();
  }

  function handleOverlayImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!(["image/png", "image/webp"] as string[]).includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Choose a transparent PNG or WebP image smaller than 10 MB.");
      return;
    }
    setError("");
    setOverlayImage({ name: file.name, src: URL.createObjectURL(file) });
  }

  async function renderVideo() {
    if (renderProgress && renderProgress.phase !== "complete") {
      renderAbortRef.current?.abort();
      return;
    }
    if (!renderCanvasRef.current) return;
    setPlaying(false);
    setRenderError("");
    if (renderedVideo) URL.revokeObjectURL(renderedVideo.url);
    setRenderedVideo(null);
    const controller = new AbortController();
    renderAbortRef.current = controller;
    try {
      const output = await renderRouteVideo(
        renderCanvasRef.current,
        track,
        { duration, cameraMode, pitch, cameraZoom, forwardUp, overviewAutoFit, lineColor, aspect, mapStyle, showMetricCard, metricFields, metricLayout, metricScale, metricPosition, imagePosition, imageOverlaySrc: overlayImage?.src },
        controller.signal,
        setRenderProgress,
      );
      setRenderedVideo({
        url: URL.createObjectURL(output.blob),
        name: videoFileName(track, output.extension),
        type: output.extension.toUpperCase(),
      });
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setRenderProgress(null);
      } else {
        setRenderError(caught instanceof Error ? caught.message : "The video could not be rendered.");
        setRenderProgress(null);
      }
    } finally {
      renderAbortRef.current = null;
    }
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
          <PwaStatus />
          <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#8d99a5] sm:flex">
            <LockKeyhole size={12} className="text-[#d8ff52]" /> Routes stay local
          </div>
          <Link href="/guide" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#c5ccd2] transition hover:bg-white/[0.08] hover:text-white">
            <HelpCircle size={14} /> User guide
          </Link>
        </div>
      </header>

      <div className="studio-grid">
        <aside className="library-panel border-r border-white/8 bg-[#0a0e13] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#83909c]">Activity</h2>
            <span className="rounded-md bg-[#d8ff52]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#d8ff52]">GPX/TCX ready</span>
          </div>

          <input ref={inputRef} type="file" multiple accept=".gpx,.tcx,.zip,application/gpx+xml,application/vnd.garmin.tcx+xml,application/zip,application/xml,text/xml" onChange={handleFile} className="hidden" />
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
            <p className="text-sm font-semibold">Drop activities here</p>
            <p className="mt-1 text-[11px] leading-4 text-[#74808b]">GPX or TCX files, or an activity export ZIP</p>
          </div>

          {error && <p className="mb-3 rounded-lg border border-red-400/20 bg-red-400/8 p-2 text-[11px] leading-4 text-red-200">{error}</p>}

          {tracks.length > 1 && (
            <div className="mb-3 space-y-2">
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-3 top-2.5 text-[#6f7b86]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activities" aria-label="Search activities" className="w-full rounded-lg border border-white/10 bg-[#10151c] py-2 pl-8 pr-3 text-xs text-white placeholder:text-[#59646e]" />
              </div>
              <select value={sportFilter} onChange={(event) => setSportFilter(event.target.value)} aria-label="Filter by sport" className="w-full rounded-lg border border-white/10 bg-[#10151c] px-3 py-2 text-xs text-white">
                <option value="all">All sports ({tracks.length})</option>
                {sports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}
              </select>
              <div className="max-h-44 space-y-1 overflow-y-auto pr-1" aria-label="Imported activities">
                {filteredTracks.map(({ item, index }) => (
                  <button key={`${item.name}-${index}`} onClick={() => { setSelectedTrack(index); resetPlayback(); }} className={`w-full rounded-lg border px-3 py-2 text-left transition ${selectedTrack === index ? "border-[#d8ff52]/40 bg-[#d8ff52]/7" : "border-white/7 bg-white/[0.02] hover:border-white/15"}`}>
                    <span className="block truncate text-[11px] font-semibold text-white">{item.name}</span>
                    <span className="mt-0.5 block text-[9px] uppercase tracking-wider text-[#74808b]">{item.startedAt ? new Date(item.startedAt).toLocaleDateString() : "Date unavailable"} · {item.sport}</span>
                  </button>
                ))}
                {!filteredTracks.length && <p className="py-3 text-center text-[10px] text-[#6f7b86]">No matching activities</p>}
              </div>
            </div>
          )}

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
              <RouteMap track={track} progress={progress} cameraMode={cameraMode} pitch={pitch} cameraZoom={cameraZoom} forwardUp={forwardUp} overviewAutoFit={overviewAutoFit} lineColor={lineColor} mapStyle={mapStyle} />
              {showMetricCard && !!metricFields.length && (
                <div data-testid="video-metrics-overlay" data-layout={metricLayout} className={`pointer-events-none absolute z-[500] rounded-xl border border-white/12 bg-black/45 p-2.5 shadow-xl backdrop-blur-md ${overlayPositionClass[metricPosition]}`} style={{ minWidth: `${96 * metricScale}px` }}>
                  <div className={metricLayout === "grid" ? "grid grid-cols-2 gap-x-5 gap-y-2.5" : "space-y-2.5"}>
                    {activityMetrics(track, progress, metricFields).map((metric) => (
                      <div key={metric.key}>
                        <div className="font-semibold uppercase tracking-[0.16em] text-white/55" style={{ fontSize: `${8 * metricScale}px` }}>{metric.label}</div>
                        <div className="mt-0.5 whitespace-nowrap font-mono font-bold text-white" style={{ fontSize: `${13 * metricScale}px` }}>{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {overlayImage && (
                // User-selected object URLs are local previews and cannot use Next's image optimizer.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={overlayImage.src} alt="Imported transparent metrics overlay" className={`pointer-events-none absolute z-[510] max-h-[30%] max-w-[46%] object-contain drop-shadow-xl ${overlayPositionClass[imagePosition]}`} />
              )}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/65 to-transparent p-4 sm:p-6">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#d8ff52]">RouteLapse original</div>
                  <div className="mt-1 max-w-[300px] truncate text-lg font-semibold tracking-tight sm:text-2xl">{track.name}</div>
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

          <div className="mt-3">
            <ActivityProfile track={track} progress={progress} />
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

            <div className="mt-5 sm:mt-0 lg:mt-5">
              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]"><label htmlFor="camera-zoom">Camera zoom</label><span className="font-mono text-[#d8ff52]">Level {cameraZoom.toFixed(1)}</span></div>
              <input id="camera-zoom" aria-label="Camera zoom" className="range-track w-full" type="range" min="12" max="18" step="0.5" value={cameraZoom} onChange={(event) => setCameraZoom(Number(event.target.value))} />
              <div className="mt-2 text-[10px] text-[#697580]">Sets detail in every mode; Follow and Cinematic also track the moving point.</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setOverviewAutoFit((value) => !value)} aria-pressed={overviewAutoFit} className={`rounded-lg border px-2 py-2 text-[10px] font-semibold transition ${overviewAutoFit ? "border-[#d8ff52]/45 bg-[#d8ff52]/8 text-[#d8ff52]" : "border-white/8 text-[#78848f]"}`}>Fit full route</button>
                <button onClick={() => setForwardUp((value) => !value)} aria-pressed={forwardUp} disabled={cameraMode === "overview"} className={`rounded-lg border px-2 py-2 text-[10px] font-semibold transition disabled:opacity-35 ${forwardUp ? "border-[#d8ff52]/45 bg-[#d8ff52]/8 text-[#d8ff52]" : "border-white/8 text-[#78848f]"}`}>Forward-up map</button>
              </div>
              <div className="mt-2 text-[9px] leading-4 text-[#616d77]">Forward-up rotates the map beneath a fixed video frame; overlays stay level.</div>
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
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]">Map style</label>
              <div className="grid grid-cols-2 gap-2">
                {(["street", "satellite", "hybrid", "dark"] as MapStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setMapStyle(style)}
                    aria-pressed={mapStyle === style}
                    className={`rounded-lg border px-3 py-2 text-[10px] font-semibold capitalize transition ${mapStyle === style ? "border-[#d8ff52]/50 bg-[#d8ff52]/8 text-[#d8ff52]" : "border-white/8 text-[#78848f] hover:border-white/16 hover:text-white"}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 sm:mt-0 lg:mt-5">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]">Video metrics</label>
              <button data-testid="metric-card-toggle" onClick={() => setShowMetricCard((value) => !value)} aria-pressed={showMetricCard} className={`mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-[10px] font-semibold transition ${showMetricCard ? "border-[#d8ff52]/45 bg-[#d8ff52]/8 text-[#d8ff52]" : "border-white/8 text-[#78848f]"}`}><span>Metrics card</span><span>{showMetricCard ? "Visible" : "Hidden"}</span></button>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(metricLabels) as MetricKey[]).map((metric) => {
                  const selected = metricFields.includes(metric);
                  return (
                    <button key={metric} onClick={() => setMetricFields((current) => selected ? current.filter((value) => value !== metric) : [...current, metric])} aria-pressed={selected} className={`rounded-lg border px-2 py-2 text-[10px] font-semibold transition ${selected ? "border-[#d8ff52]/45 bg-[#d8ff52]/8 text-[#d8ff52]" : "border-white/8 text-[#78848f] hover:border-white/16"}`}>
                      {metricLabels[metric]}
                    </button>
                  );
                })}
              </div>
              <select value={metricPosition} onChange={(event) => setMetricPosition(event.target.value as OverlayPosition)} aria-label="Metric position" className="mt-2 w-full rounded-lg border border-white/10 bg-[#10151c] px-3 py-2 text-[10px] text-white">
                {(Object.keys(overlayPositionLabels) as OverlayPosition[]).map((position) => <option key={position} value={position}>{overlayPositionLabels[position]}</option>)}
              </select>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["vertical", "grid"] as MetricLayout[]).map((layout) => <button key={layout} onClick={() => setMetricLayout(layout)} aria-pressed={metricLayout === layout} className={`rounded-lg border px-2 py-2 text-[10px] font-semibold capitalize transition ${metricLayout === layout ? "border-[#d8ff52]/45 bg-[#d8ff52]/8 text-[#d8ff52]" : "border-white/8 text-[#78848f]"}`}>{layout}</button>)}
              </div>
              <div className="mt-3 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.14em] text-[#77838f]"><label htmlFor="metric-size">Text size</label><span className="font-mono text-[#d8ff52]">{Math.round(metricScale * 100)}%</span></div>
              <input id="metric-size" aria-label="Metric text size" className="range-track mt-2 w-full" type="range" min="0.8" max="1.6" step="0.1" value={metricScale} onChange={(event) => setMetricScale(Number(event.target.value))} />
            </div>

            <div className="mt-5 sm:mt-0 lg:mt-5">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77838f]">Transparent overlay</label>
              <input ref={overlayInputRef} type="file" accept="image/png,image/webp,.png,.webp" onChange={handleOverlayImage} className="hidden" />
              {overlayImage ? (
                <div className="rounded-lg border border-white/9 bg-white/[0.025] p-2">
                  <div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-[10px] text-white">{overlayImage.name}</span><button onClick={() => setOverlayImage(null)} aria-label="Remove transparent overlay" className="text-[#7c8790] hover:text-white"><X size={13} /></button></div>
                  <select value={imagePosition} onChange={(event) => setImagePosition(event.target.value as OverlayPosition)} aria-label="Image overlay position" className="mt-2 w-full rounded-md border border-white/10 bg-[#10151c] px-2 py-1.5 text-[10px] text-white">
                    {(Object.keys(overlayPositionLabels) as OverlayPosition[]).map((position) => <option key={position} value={position}>{overlayPositionLabels[position]}</option>)}
                  </select>
                </div>
              ) : (
                <button onClick={() => overlayInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/14 px-3 py-2.5 text-[10px] font-semibold text-[#8a959e] transition hover:border-[#d8ff52]/40 hover:text-white"><ImagePlus size={14} /> Add Strava PNG/WebP</button>
              )}
              <p className="mt-2 text-[9px] leading-4 text-[#616d77]">Use a transparent screenshot or exported metrics card.</p>
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
              <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d8ff52]"><Sparkles size={12} /> Local HD renderer</div>
              <p className="text-[10px] leading-4 text-[#89958c]">Camera, overlays, and Full HD output stay in this browser.</p>
            </div>

            <div className="mt-5 sm:mt-0 lg:mt-5">
              <canvas ref={renderCanvasRef} className="hidden" aria-hidden="true" />
              {renderProgress && renderProgress.phase !== "complete" && (
                <div className="mb-2">
                  <div className="mb-1 flex justify-between text-[9px] font-semibold uppercase tracking-[0.14em] text-[#82909a]"><span>{renderProgress.phase === "preparing" ? "Loading HD map" : "Recording video"}</span><span>{Math.round(renderProgress.progress * 100)}%</span></div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d8ff52] transition-[width]" style={{ width: `${renderProgress.progress * 100}%` }} /></div>
                </div>
              )}
              {renderError && <p className="mb-2 rounded-lg border border-red-400/20 bg-red-400/8 p-2 text-[10px] leading-4 text-red-200">{renderError}</p>}
              {renderedVideo ? (
                <a href={renderedVideo.url} download={renderedVideo.name} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d8ff52] px-4 py-3 text-xs font-bold text-[#0b0f03] transition hover:brightness-110">
                  <Download size={15} /> Download {renderedVideo.type} video
                </a>
              ) : (
                <button onClick={() => void renderVideo()} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition ${renderProgress ? "border border-white/12 bg-white/[0.04] text-white hover:bg-white/[0.08]" : "bg-[#d8ff52] text-[#0b0f03] hover:brightness-110"}`}>
                  <Download size={15} /> {renderProgress ? "Cancel render" : "Render HD video"}
                </button>
              )}
              <p className="mt-2 text-center text-[9px] leading-4 text-[#64707a]">Rendered locally in real time. Keep this tab open.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
