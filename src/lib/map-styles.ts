export type MapStyle = "street" | "satellite" | "hybrid" | "dark";

export type MapTileLayer = {
  url: string;
  attribution: string;
  className: string;
  maxZoom: number;
  subdomains?: string;
};

const imageryAttribution =
  "Tiles © Esri — Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community";
const referenceAttribution =
  "Esri, HERE, Garmin, © OpenStreetMap contributors, and the GIS User Community";

// CARTO requires a key for unwatermarked tiles. When none is configured, the
// Dark style uses Esri's attributed dark-gray basemap instead.
const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
const cartoKeyParam = cartoApiKey ? `?key=${cartoApiKey}` : "";

export const mapTileLayers: Record<MapStyle, MapTileLayer[]> = {
  street: [
    {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      className: "basemap-tiles basemap-street",
      maxZoom: 19,
      subdomains: "abc",
    },
  ],
  dark: cartoApiKey
    ? [
        {
          url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKeyParam}`,
          attribution: "© OpenStreetMap contributors © CARTO",
          className: "basemap-tiles basemap-dark",
          maxZoom: 20,
          subdomains: "abcd",
        },
      ]
    : [
        {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          attribution: referenceAttribution,
          className: "basemap-tiles basemap-dark",
          maxZoom: 16,
        },
        {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
          attribution: referenceAttribution,
          className: "basemap-reference",
          maxZoom: 16,
        },
      ],
  satellite: [
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: imageryAttribution,
      className: "basemap-tiles basemap-satellite",
      maxZoom: 19,
    },
  ],
  hybrid: [
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: imageryAttribution,
      className: "basemap-tiles basemap-satellite",
      maxZoom: 19,
    },
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      attribution: referenceAttribution,
      className: "basemap-reference",
      maxZoom: 19,
    },
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      attribution: referenceAttribution,
      className: "basemap-reference",
      maxZoom: 19,
    },
  ],
};

export function tileUrl(layer: MapTileLayer, zoom: number, x: number, y: number) {
  const subdomains = layer.subdomains ?? "a";
  const subdomain = subdomains[Math.abs(x + y) % subdomains.length];
  return layer.url
    .replace("{s}", subdomain)
    .replace("{z}", String(zoom))
    .replace("{x}", String(x))
    .replace("{y}", String(y))
    .replace("{r}", window.devicePixelRatio > 1 ? "@2x" : "");
}
