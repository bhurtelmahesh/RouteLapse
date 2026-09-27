"use client";

import { Link2, LoaderCircle, Unplug } from "lucide-react";
import { useEffect, useState } from "react";
import { buildTrack, type Track, type TrackPoint } from "@/lib/track";

type Props = { onImport: (track: Track) => void };
type Activity = { id: number; name: string; distance: number; start_date: string; sport_type?: string; type?: string };
type Status = { connected: boolean; athlete?: { name?: string } };

const enabled = process.env.NEXT_PUBLIC_STRAVA_ENABLED === "true";

export function StravaImport({ onImport }: Props) {
  const [status, setStatus] = useState<Status>({ connected: false });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetch("/api/strava/status", { signal: controller.signal })
      .then(async (response) => response.ok ? response.json() as Promise<Status> : { connected: false })
      .then((value) => setStatus(value))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  async function loadActivities() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/strava/activities");
      if (!response.ok) throw new Error("Strava activities could not be loaded.");
      const value = await response.json() as Activity[];
      setActivities(value);
      setSelected(value[0] ? String(value[0].id) : "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Strava activities could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function importSelected() {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/strava/activities/${selected}/track`);
      if (!response.ok) throw new Error("This Strava route could not be imported.");
      const value = await response.json() as { name: string; sport: string; points: TrackPoint[] };
      onImport(buildTrack(value.name, value.sport, value.points));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "This Strava route could not be imported.");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    if (!window.confirm("Disconnect Strava and delete RouteLapse's stored Strava tokens?")) return;
    await fetch("/api/strava/disconnect", { method: "DELETE" });
    setStatus({ connected: false });
    setActivities([]);
  }

  if (!enabled) {
    return (
      <div className="mb-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
        <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#fc4c02]/25 bg-[#fc4c02]/8 px-3 py-2 text-xs font-semibold text-[#ff8755] opacity-75"><Link2 size={14} /> Connect Strava</button>
        <p className="mt-2 text-center text-[9px] leading-4 text-[#68747e]">Secure backend ready; activation needs the Strava client credentials.</p>
      </div>
    );
  }

  if (!status.connected) {
    return <a href="/api/strava/connect" className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#fc4c02]/30 bg-[#fc4c02]/10 px-3 py-2.5 text-xs font-semibold text-[#ff8755] transition hover:bg-[#fc4c02]/15"><Link2 size={14} /> Connect Strava</a>;
  }

  return (
    <div className="mb-3 rounded-xl border border-[#fc4c02]/20 bg-[#fc4c02]/[0.045] p-3">
      <div className="flex items-center justify-between gap-2"><span className="truncate text-[10px] font-semibold text-[#ff8755]">Strava · {status.athlete?.name || "Connected"}</span><button onClick={() => void disconnect()} title="Disconnect Strava" className="text-[#8a776f] hover:text-white"><Unplug size={13} /></button></div>
      {!activities.length ? (
        <button onClick={() => void loadActivities()} disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fc4c02] px-3 py-2 text-[10px] font-bold text-white disabled:opacity-60">{loading && <LoaderCircle size={12} className="animate-spin" />} Browse activities</button>
      ) : (
        <div className="mt-2 space-y-2">
          <select value={selected} onChange={(event) => setSelected(event.target.value)} aria-label="Strava activity" className="w-full rounded-lg border border-white/10 bg-[#10151c] px-2 py-2 text-[10px] text-white">
            {activities.map((activity) => <option key={activity.id} value={activity.id}>{new Date(activity.start_date).toLocaleDateString()} · {activity.name}</option>)}
          </select>
          <button onClick={() => void importSelected()} disabled={loading || !selected} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fc4c02] px-3 py-2 text-[10px] font-bold text-white disabled:opacity-60">{loading && <LoaderCircle size={12} className="animate-spin" />} Import route</button>
        </div>
      )}
      {error && <p className="mt-2 text-[9px] leading-4 text-red-200">{error}</p>}
    </div>
  );
}
