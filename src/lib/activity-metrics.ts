import { metricLabels, type MetricKey } from "./scene";
import { formatDistance, formatDuration, sampleTrackAtProgress, type Track } from "./track";

export type ActivityMetric = { key: MetricKey; label: string; value: string };

export function activityMetrics(track: Track, progress: number, fields: MetricKey[]): ActivityMetric[] {
  const sample = sampleTrackAtProgress(track, progress);
  const pace = track.distanceMeters > 0 && track.durationSeconds > 0
    ? (track.durationSeconds / track.distanceMeters) * 1_000
    : 0;
  const values: Record<MetricKey, string> = {
    distance: formatDistance(track.distanceMeters * progress),
    elapsed: formatDuration(track.durationSeconds * progress),
    pace: pace ? `${Math.floor(pace / 60)}:${String(Math.round(pace) % 60).padStart(2, "0")} /km` : "—",
    elevation: sample.point.elevation === undefined ? "—" : `${Math.round(sample.point.elevation)} m`,
  };
  return fields.map((key) => ({ key, label: metricLabels[key], value: values[key] }));
}
