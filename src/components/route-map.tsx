"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CircleMarker,
  Map as LeafletMap,
  Polyline as LeafletPolyline,
  TileLayer,
} from "leaflet";
import type { Track, TrackPoint } from "@/lib/track";
import { headingAtProgress, sampleTrackAtProgress } from "@/lib/track";
import { mapTileLayers, type MapStyle } from "@/lib/map-styles";
import type { CameraMode } from "@/lib/scene";

export type { CameraMode } from "@/lib/scene";

type Props = {
  track: Track;
  progress: number;
  cameraMode: CameraMode;
  pitch: number;
  cameraZoom: number;
  forwardUp: boolean;
  overviewAutoFit: boolean;
  lineColor: string;
  mapStyle: MapStyle;
};

function toLatLng(point: TrackPoint): [number, number] {
  return [point.latitude, point.longitude];
}

export function RouteMap({ track, progress, cameraMode, pitch, cameraZoom, forwardUp, overviewAutoFit, lineColor, mapStyle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayersRef = useRef<TileLayer[]>([]);
  const fullRouteRef = useRef<LeafletPolyline | null>(null);
  const activeRouteRef = useRef<LeafletPolyline | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const heading = cameraMode !== "overview" && forwardUp ? headingAtProgress(track, progress) : 0;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;
    let map: LeafletMap | null = null;

    void import("leaflet").then(({ default: L }) => {
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, {
        attributionControl: true,
        zoomControl: true,
        preferCanvas: true,
      });
      fullRouteRef.current = L.polyline([], {
        color: "#87929c",
        opacity: 0.52,
        weight: 7,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      activeRouteRef.current = L.polyline([], {
        color: "#d8ff52",
        opacity: 1,
        weight: 7,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      markerRef.current = L.circleMarker([0, 0], {
        color: "#d8ff52",
        fillColor: "#ffffff",
        fillOpacity: 1,
        opacity: 1,
        radius: 7,
        weight: 4,
      }).addTo(map);

      mapRef.current = map;
      window.requestAnimationFrame(() => map?.invalidateSize());
      setMapReady(true);
    });

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
      tileLayersRef.current = [];
      fullRouteRef.current = null;
      activeRouteRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let disposed = false;

    void import("leaflet").then(({ default: L }) => {
      if (disposed || !mapRef.current) return;
      tileLayersRef.current.forEach((layer) => layer.remove());

      const layers: TileLayer[] = mapTileLayers[mapStyle].map((layer) =>
        L.tileLayer(layer.url, {
          attribution: layer.attribution,
          className: layer.className,
          crossOrigin: true,
          maxZoom: layer.maxZoom,
          ...(layer.subdomains ? { subdomains: layer.subdomains } : {}),
        }),
      );

      layers.forEach((layer) => layer.addTo(map));
      tileLayersRef.current = layers;
    });

    return () => {
      disposed = true;
    };
  }, [mapStyle, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const fullRoute = fullRouteRef.current;
    if (!map || !fullRoute) return;

    fullRoute.setLatLngs(track.points.map(toLatLng));
    if (cameraMode === "overview") {
      if (overviewAutoFit) map.fitBounds(fullRoute.getBounds(), { animate: false, padding: [54, 54] });
      else map.setView(fullRoute.getBounds().getCenter(), cameraZoom, { animate: false });
    }
  }, [track, cameraMode, cameraZoom, overviewAutoFit, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const activeRoute = activeRouteRef.current;
    const marker = markerRef.current;
    if (!map || !activeRoute || !marker) return;

    const sample = sampleTrackAtProgress(track, progress);
    const markerPosition = toLatLng(sample.point);
    activeRoute.setLatLngs(sample.path.map(toLatLng));
    activeRoute.setStyle({ color: lineColor });
    marker.setLatLng(markerPosition);
    marker.setStyle({ color: lineColor });

    if (cameraMode !== "overview") {
      map.setView(markerPosition, cameraZoom, { animate: false });
    }
  }, [track, progress, cameraMode, cameraZoom, lineColor, mapReady]);

  return (
    <div
      className="h-full w-full overflow-hidden rounded-[inherit] bg-[#080b0f] [perspective:1200px]"
      aria-label="Animated route preview map"
    >
      <div
        ref={containerRef}
        className="h-full w-full rounded-[inherit] transition-transform duration-500 ease-out"
        style={{
          transform:
            cameraMode === "overview"
              ? "none"
              : `rotateX(${Math.round(pitch * 0.68)}deg) rotateZ(${-Math.round(heading)}deg) scale(${(1 + pitch / 260).toFixed(3)})`,
          transformOrigin: "50% 58%",
        }}
      />
    </div>
  );
}
