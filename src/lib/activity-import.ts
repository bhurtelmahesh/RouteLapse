import { strFromU8, unzipSync } from "fflate";
import { parseGpx } from "./gpx";
import { parseTcx } from "./tcx";
import type { Track } from "./track";

const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
const MAX_ACTIVITY_FILES = 2_000;

function parseActivityText(path: string, contents: string): Track {
  const name = path.split("/").pop() ?? path;
  return path.toLowerCase().endsWith(".tcx") ? parseTcx(contents, name) : parseGpx(contents, name);
}

export function parseActivityArchive(bytes: Uint8Array): Track[] {
  const archive = unzipSync(bytes);
  const entries = Object.entries(archive)
    .filter(([path]) => /\.(gpx|tcx)$/i.test(path))
    .slice(0, MAX_ACTIVITY_FILES);

  if (!entries.length) {
    throw new Error("This archive does not contain GPX or TCX activities.");
  }

  const tracks: Track[] = [];
  for (const [path, contents] of entries) {
    try {
      tracks.push(parseActivityText(path, strFromU8(contents)));
    } catch {
      // A single damaged activity should not block a full archive import.
    }
  }

  if (!tracks.length) {
    throw new Error("The activities in this archive could not be read.");
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
    if (lowerName.endsWith(".tcx")) {
      tracks.push(parseTcx(await file.text(), file.name));
      continue;
    }
    if (lowerName.endsWith(".zip")) {
      if (file.size > MAX_ARCHIVE_BYTES) {
        throw new Error("The activity archive is larger than the 250 MB browser limit.");
      }
      tracks.push(...parseActivityArchive(new Uint8Array(await file.arrayBuffer())));
      continue;
    }
    throw new Error("Choose GPX or TCX files, or an activity-export ZIP archive.");
  }

  if (!tracks.length) throw new Error("No activities were found.");
  return tracks;
}
