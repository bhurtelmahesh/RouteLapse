"use client";

import { useEffect, useRef } from "react";
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

export function RouteMap({ track, progress, cameraMode, pitch, lineColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
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

  return <div ref={containerRef} className="h-full w-full rounded-[inherit]" aria-label="Animated route preview map" />;
}
