"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { segmentHeatColors } from "@/lib/heat-map";
import { endRevealProgress, type CameraMode, type HeatMetric, type RouteStyle } from "@/lib/scene";

export type { CameraMode } from "@/lib/scene";

type Props = {
  track: Track;
  progress: number;
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
  mapStyle: MapStyle;
};

function toLatLng(point: TrackPoint): [number, number] {
  return [point.latitude, point.longitude];
}

export function RouteMap({ track, progress, duration, cameraMode, pitch, cameraZoom, forwardUp, overviewAutoFit, lineColor, routeStyle, heatMetric, heatLowColor, heatHighColor, mapStyle }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const progressRef = useRef(progress);
  const tileLayersRef = useRef<TileLayer[]>([]);
  const fullRouteRef = useRef<LeafletPolyline | null>(null);
  const activeRouteRef = useRef<LeafletPolyline | null>(null);
  const heatSegmentsRef = useRef<LeafletPolyline[]>([]);
  const visibleHeatSegmentsRef = useRef(0);
  const markerRef = useRef<CircleMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const reveal = cameraMode === "overview" ? 0 : endRevealProgress(progress, duration);
  const displayedPitch = pitch * (1 - reveal);
  const pitchActive = cameraMode !== "overview" && displayedPitch > 0;
  const verticalScale = Math.cos((displayedPitch * 0.72 * Math.PI) / 180);
  const selectedVerticalScale = cameraMode === "overview" ? 1 : Math.cos((pitch * 0.72 * Math.PI) / 180);
  const headingOverscan = cameraMode !== "overview" && forwardUp;
  const frameDiagonal = Math.hypot(frameSize.width, frameSize.height);
  const mapWidth = headingOverscan ? frameDiagonal : frameSize.width;
  const mapHeight = (headingOverscan ? frameDiagonal : frameSize.height) / selectedVerticalScale;
  const heading = cameraMode !== "overview" && forwardUp ? headingAtProgress(track, progress) * (1 - reveal) : 0;
  const heatColors = useMemo(() => segmentHeatColors(track, heatMetric, heatLowColor, heatHighColor), [track, heatMetric, heatLowColor, heatHighColor]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const updateSize = () => {
      const bounds = frame.getBoundingClientRect();
      setFrameSize((current) =>
        Math.abs(current.width - bounds.width) < 0.5 && Math.abs(current.height - bounds.height) < 0.5
          ? current
          : { width: bounds.width, height: bounds.height },
      );
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInteracting) return;
    const endInteraction = () => setIsInteracting(false);
    window.addEventListener("pointerup", endInteraction);
    window.addEventListener("pointercancel", endInteraction);
    window.addEventListener("blur", endInteraction);
    return () => {
      window.removeEventListener("pointerup", endInteraction);
      window.removeEventListener("pointercancel", endInteraction);
      window.removeEventListener("blur", endInteraction);
    };
  }, [isInteracting]);

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
      heatSegmentsRef.current = [];
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => mapRef.current?.invalidateSize({ animate: false, pan: false }));
    return () => window.cancelAnimationFrame(frame);
  }, [mapWidth, mapHeight]);

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
    const activeRoute = activeRouteRef.current;
    if (!map || !activeRoute) return;
    let disposed = false;
    heatSegmentsRef.current.forEach((segment) => segment.remove());
    heatSegmentsRef.current = [];
    visibleHeatSegmentsRef.current = 0;
    activeRoute.setStyle({ opacity: routeStyle === "solid" ? 1 : 0 });
    if (routeStyle !== "heat") return;

    void import("leaflet").then(({ default: L }) => {
      if (disposed || !mapRef.current) return;
      const currentProgress = progressRef.current;
      const visibleCount = currentProgress <= 0 ? 0 : Math.min(track.points.length - 1, sampleTrackAtProgress(track, currentProgress).path.length - 1);
      heatSegmentsRef.current = track.points.slice(1).map((point, index) => L.polyline([toLatLng(track.points[index]), toLatLng(point)], {
        color: heatColors[index],
        opacity: index < visibleCount ? 1 : 0,
        weight: 7,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map));
      visibleHeatSegmentsRef.current = visibleCount;
    });

    return () => {
      disposed = true;
      heatSegmentsRef.current.forEach((segment) => segment.remove());
      heatSegmentsRef.current = [];
      visibleHeatSegmentsRef.current = 0;
    };
  }, [track, routeStyle, heatColors, mapReady]);

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
    activeRoute.setStyle({ color: lineColor, opacity: routeStyle === "solid" ? 1 : 0 });
    marker.setLatLng(markerPosition);
    const visibleHeatCount = progress <= 0 ? 0 : Math.min(heatSegmentsRef.current.length, sample.path.length - 1);
    const previousVisibleHeatCount = visibleHeatSegmentsRef.current;
    if (routeStyle === "heat" && visibleHeatCount !== previousVisibleHeatCount) {
      if (visibleHeatCount > previousVisibleHeatCount) {
        for (let index = previousVisibleHeatCount; index < visibleHeatCount; index += 1) heatSegmentsRef.current[index]?.setStyle({ opacity: 1 });
      } else {
        for (let index = visibleHeatCount; index < previousVisibleHeatCount; index += 1) heatSegmentsRef.current[index]?.setStyle({ opacity: 0 });
      }
      visibleHeatSegmentsRef.current = visibleHeatCount;
    }
    marker.setStyle({ color: routeStyle === "heat" ? heatColors[Math.max(0, visibleHeatCount - 1)] ?? heatHighColor : lineColor });

    if (cameraMode !== "overview" && !isInteracting) {
      const bounds = fullRouteRef.current?.getBounds();
      const routeCenter = bounds?.getCenter();
      const mapSize = map.getSize();
      const visibleWidth = frameSize.width || mapSize.x;
      const visibleHeight = (frameSize.height || mapSize.y) / verticalScale;
      const revealPadding: Point = {
        x: Math.max(0, (mapSize.x - visibleWidth) / 2) + Math.max(54, visibleWidth * 0.14),
        y: Math.max(0, (mapSize.y - visibleHeight) / 2) + Math.max(54, visibleHeight * 0.18),
      } as Point;
      const fittedZoom = bounds ? map.getBoundsZoom(bounds, false, revealPadding) : cameraZoom;
      const endReveal = endRevealProgress(progress, duration);
      const center: [number, number] = routeCenter
        ? [
            markerPosition[0] + (routeCenter.lat - markerPosition[0]) * endReveal,
            markerPosition[1] + (routeCenter.lng - markerPosition[1]) * endReveal,
          ]
        : markerPosition;
      map.setView(center, cameraZoom + (fittedZoom - cameraZoom) * endReveal, { animate: false });
    }
  }, [track, progress, duration, cameraMode, cameraZoom, lineColor, routeStyle, heatColors, heatHighColor, mapReady, isInteracting, frameSize.width, frameSize.height, verticalScale]);

  return (
    <div
      ref={frameRef}
      className="relative h-full w-full overflow-hidden rounded-[inherit] bg-[#080b0f]"
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
        className="absolute rounded-[inherit]"
        style={{
          height: mapHeight || "100%",
          left: "50%",
          top: "50%",
          transition: isInteracting ? "none" : "transform 500ms ease-out",
          width: mapWidth || "100%",
          transform: `translate(-50%, -50%)${pitchActive && !isInteracting ? ` scaleY(${verticalScale.toFixed(4)})` : ""}${heading && !isInteracting ? ` rotate(${-heading}deg)` : ""}`,
          transformOrigin: "50% 50%",
        }}
      />
      <div className="absolute right-3 top-3 z-[550] grid overflow-hidden rounded-lg border border-white/15 bg-[#090d12]/90 shadow-lg backdrop-blur-sm">
        <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn(0.5)} className="grid h-8 w-8 place-items-center border-b border-white/12 text-lg font-medium leading-none text-white transition hover:bg-white/10">+</button>
        <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut(0.5)} className="grid h-8 w-8 place-items-center text-lg font-medium leading-none text-white transition hover:bg-white/10">−</button>
      </div>
    </div>
  );
}
