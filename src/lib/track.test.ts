import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { parseGpxArchive } from "./activity-import";
import { parseGpx } from "./gpx";
import { buildTrack, demoTrack, distanceBetween, formatDuration, sampleTrackAtProgress } from "./track";

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
    const tracks = parseGpxArchive(archive);

    expect(tracks).toHaveLength(1);
    expect(tracks[0].name).toBe("Archive Run");
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
});
