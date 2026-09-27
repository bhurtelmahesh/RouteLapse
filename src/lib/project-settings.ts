import type { SceneSettings } from "./scene";

export type ProjectSettings = SceneSettings;

const storageKey = "routelapse:project:v1";

export function loadProjectSettings(): ProjectSettings | null {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as ProjectSettings) : null;
  } catch {
    return null;
  }
}

export function saveProjectSettings(settings: ProjectSettings) {
  window.localStorage.setItem(storageKey, JSON.stringify(settings));
}
