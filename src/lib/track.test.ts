import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { activityMetrics } from "./activity-metrics";
import { parseActivityArchive } from "./activity-import";
import { parseGpx } from "./gpx";
import { parseTcx } from "./tcx";
import { endRevealProgress, renderResolution } from "./scene";
import { buildTrack, buildTrackProfile, demoTrack, distanceBetween, formatDuration, headingAtProgress, sampleTrackAtProgress } from "./track";

describe("track utilities", () => {
  it("calculates a geographic distance", () => {
    const distance = distanceBetween(
      { latitude: 35, longitude: 139 },
      { latitude: 35.001, longitude: 139 },
    );
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(112);
  });

  it("builds metrics from points", () => {
    const track = buildTrack("Test", "running", [
      { latitude: 35, longitude: 139, elevation: 10, time: "2026-01-01T00:00:00Z" },
      { latitude: 35.001, longitude: 139, elevation: 18, time: "2026-01-01T00:02:00Z" },
    ]);
    expect(track.durationSeconds).toBe(120);
    expect(track.elevationGainMeters).toBe(8);
    expect(formatDuration(track.durationSeconds)).toBe("2:00");
  });

  it("parses a GPX track", () => {
    const track = parseGpx(`<?xml version="1.0"?><gpx><trk><name>Morning Loop</name><type>running</type><trkseg><trkpt lat="35" lon="139"><ele>10</ele><time>2026-01-01T00:00:00Z</time></trkpt><trkpt lat="35.001" lon="139.001"><ele>12</ele><time>2026-01-01T00:01:00Z</time></trkpt></trkseg></trk></gpx>`);
    expect(track.name).toBe("Morning Loop");
    expect(track.sport).toBe("running");
    expect(track.points).toHaveLength(2);
  });

  it("imports GPX activities from an Adidas-style archive", () => {
    const gpx = `<?xml version="1.0"?><gpx><trk><name>Archive Run</name><trkseg><trkpt lat="35" lon="139"/><trkpt lat="35.001" lon="139.001"/></trkseg></trk></gpx>`;
    const archive = zipSync({ "Sport-sessions/GPS-data/run.gpx": strToU8(gpx) });
    const tracks = parseActivityArchive(archive);

    expect(tracks).toHaveLength(1);
    expect(tracks[0].name).toBe("Archive Run");
  });

  it("parses a TCX track", () => {
    const track = parseTcx(`<?xml version="1.0"?><TrainingCenterDatabase><Activities><Activity Sport="Biking"><Id>Evening Ride</Id><Lap><Track><Trackpoint><Time>2026-01-01T00:00:00Z</Time><Position><LatitudeDegrees>35</LatitudeDegrees><LongitudeDegrees>139</LongitudeDegrees></Position><AltitudeMeters>10</AltitudeMeters></Trackpoint><Trackpoint><Time>2026-01-01T00:01:00Z</Time><Position><LatitudeDegrees>35.001</LatitudeDegrees><LongitudeDegrees>139.001</LongitudeDegrees></Position><AltitudeMeters>12</AltitudeMeters></Trackpoint></Track></Lap></Activity></Activities></TrainingCenterDatabase>`);
    expect(track.name).toBe("Evening Ride");
    expect(track.sport).toBe("biking");
    expect(track.points).toHaveLength(2);
  });

  it("imports mixed GPX and TCX activities from an archive", () => {
    const gpx = `<?xml version="1.0"?><gpx><trk><name>Archive Run</name><trkseg><trkpt lat="35" lon="139"/><trkpt lat="35.001" lon="139.001"/></trkseg></trk></gpx>`;
    const tcx = `<?xml version="1.0"?><TrainingCenterDatabase><Activities><Activity Sport="Running"><Id>Archive Walk</Id><Lap><Track><Trackpoint><Position><LatitudeDegrees>1</LatitudeDegrees><LongitudeDegrees>1</LongitudeDegrees></Position></Trackpoint><Trackpoint><Position><LatitudeDegrees>1.001</LatitudeDegrees><LongitudeDegrees>1.001</LongitudeDegrees></Position></Trackpoint></Track></Lap></Activity></Activities></TrainingCenterDatabase>`;
    const archive = zipSync({ "run.gpx": strToU8(gpx), "walk.tcx": strToU8(tcx) });
    const tracks = parseActivityArchive(archive);

    expect(tracks).toHaveLength(2);
  });

  it("ships with a non-private demo route", () => {
    expect(demoTrack().points.length).toBeGreaterThan(10);
  });

  it("interpolates continuous motion by travelled distance", () => {
    const track = buildTrack("Uneven", "running", [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0.001 },
      { latitude: 0, longitude: 0.004 },
    ]);
    const halfway = sampleTrackAtProgress(track, 0.5);

    expect(halfway.point.longitude).toBeCloseTo(0.002, 4);
    expect(halfway.path).toHaveLength(3);
  });

  it("builds distance, elevation, and pace profile data", () => {
    const track = buildTrack("Profile", "running", [
      { latitude: 35, longitude: 139, elevation: 10, time: "2026-01-01T00:00:00Z" },
      { latitude: 35.001, longitude: 139, elevation: 15, time: "2026-01-01T00:01:00Z" },
    ]);
    const profile = buildTrackProfile(track);
    expect(profile[1].distanceMeters).toBeGreaterThan(100);
    expect(profile[1].paceSecondsPerKilometer).toBeGreaterThan(500);
  });

  it("uses Full HD dimensions for every aspect ratio", () => {
    expect(renderResolution("16:9")).toEqual({ width: 1920, height: 1080 });
    expect(renderResolution("9:16")).toEqual({ width: 1080, height: 1920 });
    expect(renderResolution("1:1")).toEqual({ width: 1080, height: 1080 });
  });

  it("builds only the video metrics selected by the user", () => {
    const metrics = activityMetrics(demoTrack(), 0.5, ["distance", "elevation"]);
    expect(metrics.map((metric) => metric.key)).toEqual(["distance", "elevation"]);
    expect(metrics[0].value).toMatch(/km$/);
  });

  it("computes a forward camera heading around the current position", () => {
    const eastbound = buildTrack("East", "running", [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0.01 },
    ]);
    expect(headingAtProgress(eastbound, 0.5)).toBeCloseTo(90, 1);
  });

  it("smoothly reveals the full route at the end", () => {
    expect(endRevealProgress(0.82)).toBe(0);
    expect(endRevealProgress(0.91)).toBeCloseTo(0.5, 5);
    expect(endRevealProgress(1)).toBe(1);
  });
});
