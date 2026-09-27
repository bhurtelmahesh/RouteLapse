import type { MapStyle } from "./map-styles";

export type CameraMode = "overview" | "follow" | "cinematic";
export type Aspect = "16:9" | "9:16" | "1:1";

export type SceneSettings = {
  duration: number;
  cameraMode: CameraMode;
  pitch: number;
  lineColor: string;
  aspect: Aspect;
  mapStyle: MapStyle;
};

export const aspectRatio: Record<Aspect, string> = {
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "1:1": "1 / 1",
};

export function renderResolution(aspect: Aspect) {
  if (aspect === "9:16") return { width: 1080, height: 1920 };
  if (aspect === "1:1") return { width: 1080, height: 1080 };
  return { width: 1920, height: 1080 };
}
