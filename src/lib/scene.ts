import type { MapStyle } from "./map-styles";

export type CameraMode = "overview" | "follow" | "cinematic";
export type Aspect = "16:9" | "9:16" | "1:1";
export type MetricKey = "distance" | "elapsed" | "pace" | "elevation";
export type MetricLayout = "vertical" | "grid";
export type RouteStyle = "solid" | "heat";
export type HeatMetric = "pace" | "elevation";
export type OverlayPosition = "top-left" | "top-right" | "center-left" | "center-right" | "bottom-left" | "bottom-right";
export type ImagePosition = OverlayPosition | "center" | "custom";
export const WATERMARK_TEXT = "routelapse.web.app";

export type SceneSettings = {
  duration: number;
  cameraMode: CameraMode;
  pitch: number;
  cameraZoom: number;
  forwardUp: boolean;
  overviewAutoFit: boolean;
  lineColor: string;
  routeStyle: RouteStyle;
  heatMetric: HeatMetric;
  heatLowColor: string;
  heatHighColor: string;
  aspect: Aspect;
  mapStyle: MapStyle;
  showWatermark: boolean;
  showMetricCard: boolean;
  metricFields: MetricKey[];
  metricLayout: MetricLayout;
  metricScale: number;
  metricPosition: OverlayPosition;
  imagePosition: ImagePosition;
  imageX: number;
  imageY: number;
  imageScale: number;
  imageOverlaySrc?: string;
};

export const metricLabels: Record<MetricKey, string> = {
  distance: "Distance",
  elapsed: "Time",
  pace: "Pace",
  elevation: "Elevation",
};

export const overlayPositionLabels: Record<OverlayPosition, string> = {
  "top-left": "Top left",
  "top-right": "Top right",
  "center-left": "Center left",
  "center-right": "Center right",
  "bottom-left": "Bottom left",
  "bottom-right": "Bottom right",
};

export const imagePositionLabels: Record<Exclude<ImagePosition, "custom">, string> = {
  ...overlayPositionLabels,
  center: "Center",
};

export function imagePositionCoordinates(position: ImagePosition) {
  if (position === "top-left") return { x: 18, y: 22 };
  if (position === "top-right") return { x: 82, y: 22 };
  if (position === "center-left") return { x: 18, y: 50 };
  if (position === "center-right") return { x: 82, y: 50 };
  if (position === "bottom-left") return { x: 18, y: 78 };
  if (position === "bottom-right") return { x: 82, y: 78 };
  return { x: 50, y: 50 };
}

export const aspectRatio: Record<Aspect, string> = {
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "1:1": "1 / 1",
};

export function brandOutroStart(duration: number) {
  const safeDuration = Math.max(1, duration);
  const outroDuration = Math.min(1.8, Math.max(0.8, safeDuration * 0.12));
  return 1 - outroDuration / safeDuration;
}

export function endRevealProgress(progress: number, duration = 18) {
  const revealEnd = brandOutroStart(duration);
  const revealStart = Math.max(0, revealEnd - 0.18);
  const normalized = Math.max(0, Math.min(1, (progress - revealStart) / (revealEnd - revealStart)));
  return normalized * normalized * (3 - 2 * normalized);
}

export function brandOutroProgress(progress: number, duration: number) {
  const start = brandOutroStart(duration);
  const normalized = Math.max(0, Math.min(1, (progress - start) / (1 - start)));
  return normalized * normalized * (3 - 2 * normalized);
}

export function renderResolution(aspect: Aspect) {
  if (aspect === "9:16") return { width: 1080, height: 1920 };
  if (aspect === "1:1") return { width: 1080, height: 1080 };
  return { width: 1920, height: 1080 };
}
