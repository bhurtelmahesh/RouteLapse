"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import type { Track } from "@/lib/track";
import { bearingBetween } from "@/lib/track";

export type CameraMode = "overview" | "follow" | "cinematic";

type Props = {
  track: Track;
  progress: number;
  cameraMode: CameraMode;
  pitch: number;
  lineColor: string;
};

const emptyLine = {
  type: "Feature" as const,
  properties: {},
  geometry: { type: "LineString" as const, coordinates: [] as number[][] },
};

const emptyPoint = {
  type: "Feature" as const,
  properties: {},
  geometry: { type: "Point" as const, coordinates: [139.75, 35.68] },
};

function lineFeature(track: Track, end = track.points.length) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: track.points.slice(0, end).map((point) => [point.longitude, point.latitude]),
    },
  };
}

function FallbackRoute({ track, progress, lineColor }: Pick<Props, "track" | "progress" | "lineColor">) {
  const { routePath, progressPath, marker } = useMemo(() => {
    const width = 1000;
    const height = 600;
    const padding = 72;
    const longitudeSpan = Math.max(track.bounds.maxLongitude - track.bounds.minLongitude, 0.000001);
    const latitudeSpan = Math.max(track.bounds.maxLatitude - track.bounds.minLatitude, 0.000001);
    const projected = track.points.map((point) => ({
      x: padding + ((point.longitude - track.bounds.minLongitude) / longitudeSpan) * (width - padding * 2),
      y: height - padding - ((point.latitude - track.bounds.minLatitude) / latitudeSpan) * (height - padding * 2),
    }));
    const toPath = (points: typeof projected) =>
      points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const progressIndex = Math.max(1, Math.min(projected.length - 1, Math.round(progress * (projected.length - 1))));

    return {
      routePath: toPath(projected),
      progressPath: toPath(projected.slice(0, progressIndex + 1)),
      marker: projected[progressIndex],
    };
  }, [track, progress]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit] bg-[#11161c]" aria-label="Animated route preview map in compatibility mode">
      <svg className="h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Route preview for ${track.name}`}>
        <defs>
          <pattern id="fallback-grid" width="54" height="54" patternUnits="userSpaceOnUse">
            <path d="M 54 0 L 0 0 0 54" fill="none" stroke="#ffffff" strokeOpacity="0.055" strokeWidth="1" />
          </pattern>
          <filter id="route-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="fallback-vignette" cx="50%" cy="42%" r="70%">
            <stop offset="0%" stopColor="#26313a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#080b0f" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#fallback-vignette)" />
        <rect width="1000" height="600" fill="url(#fallback-grid)" />
        <path d="M60 140 C220 190 230 75 410 112 S690 236 960 156" fill="none" stroke="#ffffff" strokeOpacity="0.045" strokeWidth="26" />
        <path d="M95 510 C260 416 360 522 515 428 S784 332 940 412" fill="none" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="18" />
        <path d={routePath} fill="none" stroke="#020405" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.65" strokeWidth="18" />
        <path d={routePath} fill="none" stroke="#85919b" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.48" strokeWidth="8" />
        <path d={progressPath} fill="none" filter="url(#route-glow)" stroke={lineColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="10" />
        {marker && (
          <>
            <circle cx={marker.x} cy={marker.y} fill={lineColor} opacity="0.22" r="27" />
            <circle cx={marker.x} cy={marker.y} fill="#ffffff" r="10" stroke={lineColor} strokeWidth="7" />
          </>
        )}
      </svg>
      <div className="absolute bottom-3 right-3 rounded-md border border-white/10 bg-black/45 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/55 backdrop-blur-sm">
        Compatibility preview · WebGL2 unavailable
      </div>
    </div>
  );
}

export function RouteMap({ track, progress, cameraMode, pitch, lineColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const scheduleFallback = () => {
      const timer = window.setTimeout(() => setUseFallback(true), 0);
      return () => window.clearTimeout(timer);
    };

    const supportCanvas = document.createElement("canvas");
    if (!supportCanvas.getContext("webgl2")) {
      return scheduleFallback();
    }

    let map: MapLibreMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        center: [139.75, 35.685],
        zoom: 13.4,
        pitch: 0,
        attributionControl: false,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            { id: "background", type: "background", paint: { "background-color": "#11161c" } },
            { id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.8, "raster-brightness-max": 0.58 } },
          ],
        },
      });
    } catch {
      return scheduleFallback();
    }

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.on("load", () => {
      readyRef.current = true;
      map.addSource("route-full", { type: "geojson", data: emptyLine });
      map.addSource("route-progress", { type: "geojson", data: emptyLine });
      map.addSource("route-marker", { type: "geojson", data: emptyPoint });
      map.addLayer({
        id: "route-shadow",
        type: "line",
        source: "route-full",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#050607", "line-width": 9, "line-opacity": 0.45 },
      });
      map.addLayer({
        id: "route-base",
        type: "line",
        source: "route-full",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#8b949d", "line-width": 4, "line-opacity": 0.48 },
      });
      map.addLayer({
        id: "route-active",
        type: "line",
        source: "route-progress",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#d8ff52", "line-width": 5, "line-opacity": 1 },
      });
      map.addLayer({
        id: "route-dot-halo",
        type: "circle",
        source: "route-marker",
        paint: { "circle-radius": 12, "circle-color": "#d8ff52", "circle-opacity": 0.2 },
      });
      map.addLayer({
        id: "route-dot",
        type: "circle",
        source: "route-marker",
        paint: { "circle-radius": 5, "circle-color": "#ffffff", "circle-stroke-color": "#d8ff52", "circle-stroke-width": 3 },
      });
    });

    mapRef.current = map;
    return () => {
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRoute = () => {
      if (!readyRef.current) return;
      (map.getSource("route-full") as GeoJSONSource).setData(lineFeature(track));
      const { minLongitude, minLatitude, maxLongitude, maxLatitude } = track.bounds;
      map.fitBounds(
        [
          [minLongitude, minLatitude],
          [maxLongitude, maxLatitude],
        ],
        { padding: 72, duration: 850, pitch: cameraMode === "overview" ? 0 : pitch },
      );
    };

    if (readyRef.current) updateRoute();
    else map.once("load", updateRoute);
  }, [track, cameraMode, pitch]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const index = Math.max(1, Math.min(track.points.length - 1, Math.round(progress * (track.points.length - 1))));
    const point = track.points[index];
    const previous = track.points[Math.max(0, index - 2)];
    (map.getSource("route-progress") as GeoJSONSource).setData(lineFeature(track, index + 1));
    (map.getSource("route-marker") as GeoJSONSource).setData({
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
    });
    map.setPaintProperty("route-active", "line-color", lineColor);
    map.setPaintProperty("route-dot-halo", "circle-color", lineColor);
    map.setPaintProperty("route-dot", "circle-stroke-color", lineColor);

    if (cameraMode !== "overview") {
      map.jumpTo({
        center: [point.longitude, point.latitude],
        zoom: cameraMode === "follow" ? 15.2 : 14.5,
        pitch,
        bearing: bearingBetween(previous, point) + (cameraMode === "cinematic" ? 18 : 0),
      });
    }
  }, [track, progress, cameraMode, pitch, lineColor]);

  if (useFallback) {
    return <FallbackRoute track={track} progress={progress} lineColor={lineColor} />;
  }

  return <div ref={containerRef} className="h-full w-full rounded-[inherit]" aria-label="Animated route preview map" />;
}
