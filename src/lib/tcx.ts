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
  const position = record(point.Position);
  const latitude = Number(position.LatitudeDegrees);
  const longitude = Number(position.LongitudeDegrees);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const elevation = Number(point.AltitudeMeters);
  return {
    latitude,
    longitude,
    elevation: Number.isFinite(elevation) ? elevation : undefined,
    time: text(point.Time) || undefined,
  };
}

export function parseTcx(source: string, fallbackName = "Imported route"): Track {
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
    throw new Error("The selected file is not valid TCX XML.");
  }

  const database = record(parsed.TrainingCenterDatabase);
  const activities = array(record(database.Activities).Activity).map(record);
  if (!activities.length) throw new Error("The selected file is not a TCX activity.");

  const points = activities
    .flatMap((activity) => array(activity.Lap).map(record))
    .flatMap((lap) => array(lap.Track).map(record))
    .flatMap((track) => array(track.Trackpoint))
    .map(pointFromXml)
    .filter((point): point is TrackPoint => point !== null);

  const firstActivity = activities[0] ?? {};
  const name = text(firstActivity.Id) || fallbackName.replace(/\.tcx$/i, "");
  const sport = text(firstActivity.Sport).toLowerCase() || "activity";

  return buildTrack(name, sport, points);
}
