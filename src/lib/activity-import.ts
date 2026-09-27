import { strFromU8, unzipSync } from "fflate";
import { parseGpx } from "./gpx";
import type { Track } from "./track";

const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
const MAX_GPX_FILES = 2_000;

export function parseGpxArchive(bytes: Uint8Array): Track[] {
  const archive = unzipSync(bytes);
  const gpxEntries = Object.entries(archive)
    .filter(([path]) => path.toLowerCase().endsWith(".gpx"))
    .slice(0, MAX_GPX_FILES);

  if (!gpxEntries.length) {
    throw new Error("This archive does not contain GPX activities.");
  }

  const tracks: Track[] = [];
  for (const [path, contents] of gpxEntries) {
    try {
      tracks.push(parseGpx(strFromU8(contents), path.split("/").pop() ?? path));
    } catch {
      // A single damaged activity should not block a full Adidas export.
    }
  }

  if (!tracks.length) {
    throw new Error("The GPX activities in this archive could not be read.");
  }
  return tracks;
}

export async function importActivityFiles(files: File[]): Promise<Track[]> {
  const tracks: Track[] = [];

  for (const file of files) {
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith(".gpx")) {
      tracks.push(parseGpx(await file.text(), file.name));
      continue;
    }
    if (lowerName.endsWith(".zip")) {
      if (file.size > MAX_ARCHIVE_BYTES) {
        throw new Error("The activity archive is larger than the 250 MB browser limit.");
      }
      tracks.push(...parseGpxArchive(new Uint8Array(await file.arrayBuffer())));
      continue;
    }
    throw new Error("Choose GPX files or an Adidas activity-export ZIP archive.");
  }

  if (!tracks.length) throw new Error("No activities were found.");
  return tracks;
}
