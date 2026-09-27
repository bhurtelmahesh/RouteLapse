import { describe, expect, it } from "vitest";
import { parseGpx } from "./gpx";
import { buildTrack, demoTrack, distanceBetween, formatDuration } from "./track";

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

  it("ships with a non-private demo route", () => {
    expect(demoTrack().points.length).toBeGreaterThan(10);
  });
});
