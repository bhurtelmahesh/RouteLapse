"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CircleMarker,
  Map as LeafletMap,
  Point,
  Polyline as LeafletPolyline,
  TileLayer,
} from "leaflet";
import type { Track, TrackPoint } from "@/lib/track";
import { headingAtProgress, sampleTrackAtProgress } from "@/lib/track";
import { mapTileLayers, type MapStyle } from "@/lib/map-styles";
import { endRevealProgress, type CameraMode } from "@/lib/scene";

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
  const [isInteracting, setIsInteracting] = useState(false);
  const reveal = cameraMode === "overview" ? 0 : endRevealProgress(progress);
  const displayedPitch = pitch * (1 - reveal);
  const heading = cameraMode !== "overview" && forwardUp ? headingAtProgress(track, progress) * (1 - reveal) : 0;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;
    let map: LeafletMap | null = null;

    void import("leaflet").then(({ default: L }) => {
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, {
        attributionControl: true,
        zoomControl: false,
        scrollWheelZoom: false,
        zoomSnap: 0.1,
        zoomDelta: 0.5,
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
          keepBuffer: 4,
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

    if (cameraMode !== "overview" && !isInteracting) {
      const bounds = fullRouteRef.current?.getBounds();
      const routeCenter = bounds?.getCenter();
      const mapSize = map.getSize();
      const revealPadding: Point = { x: Math.max(54, mapSize.x * 0.14), y: Math.max(54, mapSize.y * 0.18) } as Point;
      const fittedZoom = bounds ? map.getBoundsZoom(bounds, false, revealPadding) : cameraZoom;
      const endReveal = endRevealProgress(progress);
      const center: [number, number] = routeCenter
        ? [
            markerPosition[0] + (routeCenter.lat - markerPosition[0]) * endReveal,
            markerPosition[1] + (routeCenter.lng - markerPosition[1]) * endReveal,
          ]
        : markerPosition;
      map.setView(center, cameraZoom + (fittedZoom - cameraZoom) * endReveal, { animate: false });
    }
  }, [track, progress, cameraMode, cameraZoom, lineColor, mapReady, isInteracting]);

  useEffect(() => {
    const map = mapRef.current;
    const mapPane = map?.getPane("mapPane");
    if (!map || !mapPane) return;
    const size = map.getSize();
    mapPane.style.transformOrigin = `${size.x / 2}px ${size.y / 2}px`;
    mapPane.style.rotate = heading && !isInteracting ? `${-heading}deg` : "none";
  }, [heading, mapReady, isInteracting]);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[inherit] bg-[#080b0f] [perspective:1200px]"
      aria-label="Animated route preview map"
      title="Drag to move. The camera flattens while interacting. Use +/−, double-click, or pinch to zoom."
    >
      <div
        ref={containerRef}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
        onPointerCancel={() => setIsInteracting(false)}
        onPointerLeave={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) setIsInteracting(false);
        }}
        className={`h-full w-full rounded-[inherit] ease-out ${isInteracting ? "transition-none" : "transition-transform duration-500"}`}
        style={{
          transform:
            cameraMode === "overview" || isInteracting
              ? "none"
              : `rotateX(${Math.round(displayedPitch * 0.68)}deg) scale(${(1 + displayedPitch / 260).toFixed(3)})`,
          transformOrigin: "50% 58%",
        }}
      />
      <div className="absolute right-3 top-3 z-[550] grid overflow-hidden rounded-lg border border-white/15 bg-[#090d12]/90 shadow-lg backdrop-blur-sm">
        <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn(0.5)} className="grid h-8 w-8 place-items-center border-b border-white/12 text-lg font-medium leading-none text-white transition hover:bg-white/10">+</button>
        <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut(0.5)} className="grid h-8 w-8 place-items-center text-lg font-medium leading-none text-white transition hover:bg-white/10">−</button>
      </div>
    </div>
  );
}
