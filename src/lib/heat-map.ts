import type { HeatMetric } from "./scene";
import { distanceBetween, type Track } from "./track";

function channel(hex: string, offset: number) {
  return Number.parseInt(hex.slice(offset, offset + 2), 16);
}

function mixColor(low: string, high: string, amount: number) {
  const normalizedLow = /^#[0-9a-f]{6}$/i.test(low) ? low : "#3b82f6";
  const normalizedHigh = /^#[0-9a-f]{6}$/i.test(high) ? high : "#ef4444";
  const mix = (offset: number) => Math.round(channel(normalizedLow, offset) + (channel(normalizedHigh, offset) - channel(normalizedLow, offset)) * amount);
  return `#${[1, 3, 5].map((offset) => mix(offset).toString(16).padStart(2, "0")).join("")}`;
}

function percentile(sorted: number[], amount: number) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * amount)))];
}

export function heatLegendLabels(metric: HeatMetric) {
  return metric === "pace" ? { low: "Slower", high: "Faster" } : { low: "Lower", high: "Higher" };
}

export function segmentHeatColors(track: Track, metric: HeatMetric, lowColor: string, highColor: string) {
  const values = track.points.slice(1).map((point, index) => {
    const previous = track.points[index];
    if (metric === "elevation") {
      if (previous.elevation === undefined || point.elevation === undefined) return Number.NaN;
      return (previous.elevation + point.elevation) / 2;
    }
    const distance = distanceBetween(previous, point);
    const start = previous.time ? Date.parse(previous.time) : Number.NaN;
    const end = point.time ? Date.parse(point.time) : Number.NaN;
    const seconds = (end - start) / 1_000;
    return distance > 1 && Number.isFinite(seconds) && seconds > 0 ? (seconds / distance) * 1_000 : Number.NaN;
  });
  const finite = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!finite.length) return values.map(() => mixColor(lowColor, highColor, 0.5));
  const minimum = percentile(finite, 0.1);
  const maximum = percentile(finite, 0.9);
  const span = Math.max(0.0001, maximum - minimum);
  return values.map((value) => {
    const normalized = Number.isFinite(value) ? Math.max(0, Math.min(1, (value - minimum) / span)) : 0.5;
    const intensity = metric === "pace" ? 1 - normalized : normalized;
    return mixColor(lowColor, highColor, intensity);
  });
}
