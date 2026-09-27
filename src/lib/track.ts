export type TrackPoint = {
  latitude: number;
  longitude: number;
  elevation?: number;
  time?: string;
};

export type TrackBounds = {
  minLatitude: number;
  minLongitude: number;
  maxLatitude: number;
  maxLongitude: number;
};

export type Track = {
  name: string;
  sport: string;
  points: TrackPoint[];
  distanceMeters: number;
  durationSeconds: number;
  elevationGainMeters: number;
  bounds: TrackBounds;
};

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceBetween(a: TrackPoint, b: TrackPoint) {
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const latitudeA = toRadians(a.latitude);
  const latitudeB = toRadians(b.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function bearingBetween(a: TrackPoint, b: TrackPoint) {
  const latitudeA = toRadians(a.latitude);
  const latitudeB = toRadians(b.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const y = Math.sin(longitudeDelta) * Math.cos(latitudeB);
  const x =
    Math.cos(latitudeA) * Math.sin(latitudeB) -
    Math.sin(latitudeA) * Math.cos(latitudeB) * Math.cos(longitudeDelta);

  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function buildTrack(name: string, sport: string, points: TrackPoint[]): Track {
  if (points.length < 2) {
    throw new Error("This GPX file does not contain enough track points.");
  }

  let distanceMeters = 0;
  let elevationGainMeters = 0;

  for (let index = 1; index < points.length; index += 1) {
    distanceMeters += distanceBetween(points[index - 1], points[index]);
    const previousElevation = points[index - 1].elevation;
    const elevation = points[index].elevation;
    if (previousElevation !== undefined && elevation !== undefined) {
      const gain = elevation - previousElevation;
      if (gain > 0 && gain < 100) elevationGainMeters += gain;
    }
  }

  const timestamps = points
    .map((point) => (point.time ? Date.parse(point.time) : Number.NaN))
    .filter(Number.isFinite);

  const durationSeconds =
    timestamps.length > 1
      ? Math.max(0, (Math.max(...timestamps) - Math.min(...timestamps)) / 1000)
      : 0;

  return {
    name,
    sport: sport || "activity",
    points,
    distanceMeters,
    durationSeconds,
    elevationGainMeters,
    bounds: {
      minLatitude: Math.min(...points.map((point) => point.latitude)),
      minLongitude: Math.min(...points.map((point) => point.longitude)),
      maxLatitude: Math.max(...points.map((point) => point.latitude)),
      maxLongitude: Math.max(...points.map((point) => point.longitude)),
    },
  };
}

export function formatDistance(distanceMeters: number) {
  return `${(distanceMeters / 1000).toFixed(distanceMeters >= 10_000 ? 1 : 2)} km`;
}

export function formatDuration(durationSeconds: number) {
  if (!durationSeconds) return "—";
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = Math.round(durationSeconds % 60);
  if (hours) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function demoTrack(): Track {
  const points: TrackPoint[] = [
    [35.68175, 139.7505],
    [35.68352, 139.75366],
    [35.6857, 139.7554],
    [35.68845, 139.75486],
    [35.69045, 139.75245],
    [35.6914, 139.7487],
    [35.69072, 139.7449],
    [35.68866, 139.7424],
    [35.68587, 139.74163],
    [35.6831, 139.7428],
    [35.68095, 139.74555],
    [35.68028, 139.7485],
    [35.68175, 139.7505],
  ].map(([latitude, longitude], index) => ({
    latitude,
    longitude,
    elevation: 18 + Math.sin(index / 2) * 5,
    time: new Date(Date.UTC(2026, 8, 27, 6, 30, index * 135)).toISOString(),
  }));

  return buildTrack("Imperial Loop — Demo", "running", points);
}
