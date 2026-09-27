import { XMLParser } from "fast-xml-parser";
import { buildTrack, type Track, type TrackPoint } from "./track";

type XmlRecord = Record<string, unknown>;

function record(value: unknown): XmlRecord {
  return value && typeof value === "object" ? (value as XmlRecord) : {};
}

function array(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function pointFromXml(value: unknown): TrackPoint | null {
  const point = record(value);
  const latitude = Number(point.lat);
  const longitude = Number(point.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const elevation = Number(point.ele);
  return {
    latitude,
    longitude,
    elevation: Number.isFinite(elevation) ? elevation : undefined,
    time: text(point.time) || undefined,
  };
}

export function parseGpx(source: string, fallbackName = "Imported route"): Track {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    removeNSPrefix: true,
    trimValues: true,
    parseTagValue: false,
    parseAttributeValue: false,
  });

  let parsed: XmlRecord;
  try {
    parsed = record(parser.parse(source));
  } catch {
    throw new Error("The selected file is not valid GPX XML.");
  }

  const gpx = record(parsed.gpx);
  if (!Object.keys(gpx).length) throw new Error("The selected file is not a GPX document.");

  const tracks = array(gpx.trk).map(record);
  const trackPoints = tracks.flatMap((track) =>
    array(track.trkseg)
      .map(record)
      .flatMap((segment) => array(segment.trkpt)),
  );
  const routePoints = array(gpx.rte).map(record).flatMap((route) => array(route.rtept));
  const points = [...trackPoints, ...routePoints]
    .map(pointFromXml)
    .filter((point): point is TrackPoint => point !== null);

  const firstTrack = tracks[0] ?? {};
  const metadata = record(gpx.metadata);
  const name = text(firstTrack.name) || text(metadata.name) || fallbackName.replace(/\.gpx$/i, "");
  const sport = text(firstTrack.type).toLowerCase() || "activity";

  return buildTrack(name, sport, points);
}
