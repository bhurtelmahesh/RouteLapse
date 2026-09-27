import { buildTrackProfile, type Track } from "@/lib/track";

type Props = {
  track: Track;
  progress: number;
};

function chartPoints(values: number[], width: number, height: number) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
      const y = height - ((value - minimum) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ActivityProfile({ track, progress }: Props) {
  const profile = buildTrackProfile(track);
  const elevations = profile.map((point) => point.elevation).filter((value): value is number => value !== undefined);
  const paces = profile
    .map((point) => point.paceSecondsPerKilometer)
    .filter((value): value is number => value !== undefined);
  const markerX = Math.max(0, Math.min(100, progress * 100));

  if (elevations.length < 2 && paces.length < 2) return null;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {elevations.length > 1 && (
        <ProfileChart label="Elevation" value={`${Math.round(elevations[Math.min(elevations.length - 1, Math.round(progress * (elevations.length - 1)))])} m`} values={elevations} markerX={markerX} />
      )}
      {paces.length > 1 && (
        <ProfileChart label="Pace" value={`${Math.floor(paces[Math.min(paces.length - 1, Math.round(progress * (paces.length - 1)))] / 60)}:${String(Math.round(paces[Math.min(paces.length - 1, Math.round(progress * (paces.length - 1)))]) % 60).padStart(2, "0")} /km`} values={paces.map((value) => -value)} markerX={markerX} />
      )}
    </div>
  );
}

function ProfileChart({ label, value, values, markerX }: { label: string; value: string; values: number[]; markerX: number }) {
  const points = chartPoints(values, 100, 30);
  return (
    <div className="rounded-xl border border-white/8 bg-[#0c1117] px-3 py-2">
      <div className="mb-1 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.16em] text-[#77838f]">
        <span>{label}</span><span className="font-mono text-[#d8ff52]">{value}</span>
      </div>
      <svg viewBox="0 0 100 32" role="img" aria-label={`${label} profile`} className="h-10 w-full overflow-visible">
        <polyline points={points} fill="none" stroke="#d8ff52" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <line x1={markerX} x2={markerX} y1="0" y2="32" stroke="rgba(255,255,255,.65)" strokeWidth="0.7" />
      </svg>
    </div>
  );
}
