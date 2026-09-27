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

export type TrackSample = {
  point: TrackPoint;
  previous: TrackPoint;
  path: TrackPoint[];
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

function interpolatePoint(a: TrackPoint, b: TrackPoint, amount: number): TrackPoint {
  const interpolateOptional = (start?: number, end?: number) =>
    start !== undefined && end !== undefined ? start + (end - start) * amount : start ?? end;
  const startTime = a.time ? Date.parse(a.time) : Number.NaN;
  const endTime = b.time ? Date.parse(b.time) : Number.NaN;

  return {
    latitude: a.latitude + (b.latitude - a.latitude) * amount,
    longitude: a.longitude + (b.longitude - a.longitude) * amount,
    elevation: interpolateOptional(a.elevation, b.elevation),
    time:
      Number.isFinite(startTime) && Number.isFinite(endTime)
        ? new Date(startTime + (endTime - startTime) * amount).toISOString()
        : a.time ?? b.time,
  };
}

export function sampleTrackAtProgress(track: Track, progress: number): TrackSample {
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  const segmentDistances = track.points.slice(1).map((point, index) =>
    distanceBetween(track.points[index], point),
  );
  const totalDistance = segmentDistances.reduce((total, distance) => total + distance, 0);
  const targetDistance = totalDistance * normalizedProgress;
  let travelledDistance = 0;

  for (let index = 0; index < segmentDistances.length; index += 1) {
    const segmentDistance = segmentDistances[index];
    const isLastSegment = index === segmentDistances.length - 1;
    if (travelledDistance + segmentDistance >= targetDistance || isLastSegment) {
      const segmentProgress = segmentDistance
        ? Math.max(0, Math.min(1, (targetDistance - travelledDistance) / segmentDistance))
        : 0;
      const point = interpolatePoint(track.points[index], track.points[index + 1], segmentProgress);
      return {
        point,
        previous: track.points[index],
        path: [...track.points.slice(0, index + 1), point],
      };
    }
    travelledDistance += segmentDistance;
  }

  const lastPoint = track.points[track.points.length - 1];
  return {
    point: lastPoint,
    previous: track.points[track.points.length - 2],
    path: track.points,
  };
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
