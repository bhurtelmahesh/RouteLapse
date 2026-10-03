import type { MapStyle } from "./map-styles";

export type CameraMode = "overview" | "follow" | "cinematic";
export type Aspect = "16:9" | "9:16" | "1:1";
export type MetricKey = "distance" | "elapsed" | "pace" | "elevation";
export type MetricLayout = "vertical" | "grid";
export type OverlayPosition = "top-left" | "top-right" | "center-left" | "center-right" | "bottom-left" | "bottom-right";

export type SceneSettings = {
  duration: number;
  cameraMode: CameraMode;
  pitch: number;
  cameraZoom: number;
  forwardUp: boolean;
  overviewAutoFit: boolean;
  lineColor: string;
  aspect: Aspect;
  mapStyle: MapStyle;
  showMetricCard: boolean;
  metricFields: MetricKey[];
  metricLayout: MetricLayout;
  metricScale: number;
  metricPosition: OverlayPosition;
  imagePosition: OverlayPosition;
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

export const aspectRatio: Record<Aspect, string> = {
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "1:1": "1 / 1",
};

export function endRevealProgress(progress: number) {
  const normalized = Math.max(0, Math.min(1, (progress - 0.82) / 0.18));
  return normalized * normalized * (3 - 2 * normalized);
}

export function renderResolution(aspect: Aspect) {
  if (aspect === "9:16") return { width: 1080, height: 1920 };
  if (aspect === "1:1") return { width: 1080, height: 1080 };
  return { width: 1920, height: 1080 };
}
