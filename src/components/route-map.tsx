"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CircleMarker,
  Map as LeafletMap,
  Polyline as LeafletPolyline,
  TileLayer,
} from "leaflet";
import type { Track, TrackPoint } from "@/lib/track";
import { sampleTrackAtProgress } from "@/lib/track";

export type CameraMode = "overview" | "follow" | "cinematic";
export type MapStyle = "street" | "satellite" | "hybrid" | "dark";

type Props = {
  track: Track;
  progress: number;
  cameraMode: CameraMode;
  pitch: number;
  lineColor: string;
  mapStyle: MapStyle;
};

const imageryAttribution =
  "Tiles © Esri — Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community";

const referenceAttribution =
  "Esri, HERE, Garmin, © OpenStreetMap contributors, and the GIS User Community";

function toLatLng(point: TrackPoint): [number, number] {
  return [point.latitude, point.longitude];
}

export function RouteMap({ track, progress, cameraMode, pitch, lineColor, mapStyle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayersRef = useRef<TileLayer[]>([]);
  const fullRouteRef = useRef<LeafletPolyline | null>(null);
  const activeRouteRef = useRef<LeafletPolyline | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);

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

      const layers: TileLayer[] = [];
      if (mapStyle === "street") {
        layers.push(
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            className: "basemap-tiles basemap-street",
            crossOrigin: true,
            maxZoom: 19,
            subdomains: "abc",
          }),
        );
      } else if (mapStyle === "dark") {
        layers.push(
          L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: "© OpenStreetMap contributors © CARTO",
            className: "basemap-tiles basemap-dark",
            crossOrigin: true,
            maxZoom: 20,
            subdomains: "abcd",
          }),
        );
      } else {
        layers.push(
          L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: imageryAttribution,
              className: "basemap-tiles basemap-satellite",
              crossOrigin: true,
              maxZoom: 19,
            },
          ),
        );

        if (mapStyle === "hybrid") {
          layers.push(
            L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
              {
                attribution: referenceAttribution,
                className: "basemap-reference",
                crossOrigin: true,
                maxZoom: 19,
              },
            ),
            L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
              {
                attribution: referenceAttribution,
                className: "basemap-reference",
                crossOrigin: true,
                maxZoom: 19,
              },
            ),
          );
        }
      }

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
      map.fitBounds(fullRoute.getBounds(), { animate: true, duration: 0.65, padding: [54, 54] });
    }
  }, [track, cameraMode, mapReady]);

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
      const targetZoom = cameraMode === "follow" ? 16 : 14.4 + (pitch / 90) * 1.1;
      map.setView(markerPosition, targetZoom, { animate: false });
    }
  }, [track, progress, cameraMode, pitch, lineColor, mapReady]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-[inherit]"
      aria-label="Animated route preview map"
    />
  );
}
