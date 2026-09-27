import { mapTileLayers, tileUrl, type MapTileLayer } from "./map-styles";
import { renderResolution, type SceneSettings } from "./scene";
import { formatDistance, sampleTrackAtProgress, type Track, type TrackPoint } from "./track";

type WorldPoint = { x: number; y: number };
type Camera = { center: WorldPoint; zoom: number };

export type RenderProgress = {
  phase: "preparing" | "recording" | "complete";
  progress: number;
};

export type RenderedVideo = {
  blob: Blob;
  extension: "mp4" | "webm";
  mimeType: string;
};

const TILE_SIZE = 256;
const FRAME_RATE = 30;

function project(point: TrackPoint, zoom: number): WorldPoint {
  const scale = TILE_SIZE * 2 ** zoom;
  const sine = Math.min(0.9999, Math.max(-0.9999, Math.sin((point.latitude * Math.PI) / 180)));
  return {
    x: ((point.longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale,
  };
}

function overviewCamera(track: Track, width: number, height: number, maximumZoom: number): Camera {
  const northWest = project(
    { latitude: track.bounds.maxLatitude, longitude: track.bounds.minLongitude },
    0,
  );
  const southEast = project(
    { latitude: track.bounds.minLatitude, longitude: track.bounds.maxLongitude },
    0,
  );
  const spanX = Math.max(0.000001, Math.abs(southEast.x - northWest.x));
  const spanY = Math.max(0.000001, Math.abs(southEast.y - northWest.y));
  const zoom = Math.max(
    1,
    Math.min(
      maximumZoom,
      Math.floor(Math.log2(Math.min((width * 0.72) / spanX, (height * 0.64) / spanY))),
    ),
  );
  const center = project(
    {
      latitude: (track.bounds.minLatitude + track.bounds.maxLatitude) / 2,
      longitude: (track.bounds.minLongitude + track.bounds.maxLongitude) / 2,
    },
    zoom,
  );
  return { center, zoom };
}

function cameraAt(track: Track, settings: SceneSettings, progress: number, width: number, height: number) {
  const maximumZoom = Math.min(...mapTileLayers[settings.mapStyle].map((layer) => layer.maxZoom));
  if (settings.cameraMode === "overview") return overviewCamera(track, width, height, maximumZoom);
  const point = sampleTrackAtProgress(track, progress).point;
  const zoom = Math.min(maximumZoom, settings.cameraMode === "follow" ? 16 : 15);
  return { center: project(point, zoom), zoom };
}

function visibleTiles(camera: Camera, width: number, height: number) {
  const left = camera.center.x - width / 2;
  const top = camera.center.y - height / 2;
  const firstX = Math.floor(left / TILE_SIZE);
  const lastX = Math.floor((left + width) / TILE_SIZE);
  const firstY = Math.max(0, Math.floor(top / TILE_SIZE));
  const lastY = Math.min(2 ** camera.zoom - 1, Math.floor((top + height) / TILE_SIZE));
  const tiles: Array<{ drawX: number; drawY: number; x: number; y: number }> = [];
  const worldTiles = 2 ** camera.zoom;
  for (let y = firstY; y <= lastY; y += 1) {
    for (let x = firstX; x <= lastX; x += 1) {
      tiles.push({
        drawX: x * TILE_SIZE - left,
        drawY: y * TILE_SIZE - top,
        x: ((x % worldTiles) + worldTiles) % worldTiles,
        y,
      });
    }
  }
  return tiles;
}

function urlsForFrame(track: Track, settings: SceneSettings, progress: number, width: number, height: number) {
  const camera = cameraAt(track, settings, progress, width, height);
  return mapTileLayers[settings.mapStyle].flatMap((layer) =>
    visibleTiles(camera, width, height).map((tile) => tileUrl(layer, camera.zoom, tile.x, tile.y)),
  );
}

function loadImage(url: string, signal: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    const abort = () => reject(new DOMException("Rendering cancelled", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    image.onload = () => {
      signal.removeEventListener("abort", abort);
      resolve(image);
    };
    image.onerror = () => {
      signal.removeEventListener("abort", abort);
      reject(new Error("A map tile could not be loaded for video rendering."));
    };
    image.src = url;
  });
}

async function preloadTiles(
  track: Track,
  settings: SceneSettings,
  width: number,
  height: number,
  signal: AbortSignal,
  onProgress: (progress: RenderProgress) => void,
) {
  const sampleCount = settings.cameraMode === "overview" ? 1 : Math.min(180, Math.max(24, settings.duration * 3));
  const urls = new Set<string>();
  for (let index = 0; index < sampleCount; index += 1) {
    const progress = sampleCount === 1 ? 0 : index / (sampleCount - 1);
    urlsForFrame(track, settings, progress, width, height).forEach((url) => urls.add(url));
  }

  const queue = [...urls];
  const images = new Map<string, HTMLImageElement>();
  let completed = 0;
  const workers = Array.from({ length: Math.min(8, queue.length) }, async () => {
    while (queue.length) {
      if (signal.aborted) throw new DOMException("Rendering cancelled", "AbortError");
      const url = queue.shift();
      if (!url) return;
      images.set(url, await loadImage(url, signal));
      completed += 1;
      onProgress({ phase: "preparing", progress: completed / urls.size });
    }
  });
  await Promise.all(workers);
  return images;
}

function drawTiles(
  context: CanvasRenderingContext2D,
  layers: MapTileLayer[],
  images: Map<string, HTMLImageElement>,
  camera: Camera,
  width: number,
  height: number,
) {
  for (const layer of layers) {
    for (const tile of visibleTiles(camera, width, height)) {
      const image = images.get(tileUrl(layer, camera.zoom, tile.x, tile.y));
      if (image) context.drawImage(image, tile.drawX, tile.drawY, TILE_SIZE, TILE_SIZE);
    }
  }
}

function screenPoint(point: TrackPoint, camera: Camera, width: number, height: number) {
  const world = project(point, camera.zoom);
  return { x: world.x - camera.center.x + width / 2, y: world.y - camera.center.y + height / 2 };
}

function drawPath(
  context: CanvasRenderingContext2D,
  points: TrackPoint[],
  camera: Camera,
  width: number,
  height: number,
  color: string,
  lineWidth: number,
) {
  if (points.length < 2) return;
  context.beginPath();
  points.forEach((point, index) => {
    const screen = screenPoint(point, camera, width, height);
    if (index === 0) context.moveTo(screen.x, screen.y);
    else context.lineTo(screen.x, screen.y);
  });
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
}

function drawFrame(
  context: CanvasRenderingContext2D,
  track: Track,
  settings: SceneSettings,
  images: Map<string, HTMLImageElement>,
  progress: number,
  width: number,
  height: number,
) {
  const camera = cameraAt(track, settings, progress, width, height);
  const sample = sampleTrackAtProgress(track, progress);
  context.fillStyle = "#11161c";
  context.fillRect(0, 0, width, height);
  drawTiles(context, mapTileLayers[settings.mapStyle], images, camera, width, height);

  const scale = Math.max(1, Math.min(width, height) / 720);
  drawPath(context, track.points, camera, width, height, "rgba(38,44,50,.7)", 10 * scale);
  drawPath(context, sample.path, camera, width, height, settings.lineColor, 11 * scale);
  const marker = screenPoint(sample.point, camera, width, height);
  context.beginPath();
  context.arc(marker.x, marker.y, 9 * scale, 0, Math.PI * 2);
  context.fillStyle = "#ffffff";
  context.fill();
  context.lineWidth = 5 * scale;
  context.strokeStyle = settings.lineColor;
  context.stroke();

  const topGradient = context.createLinearGradient(0, 0, 0, height * 0.3);
  topGradient.addColorStop(0, "rgba(0,0,0,.82)");
  topGradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = topGradient;
  context.fillRect(0, 0, width, height * 0.3);
  const bottomGradient = context.createLinearGradient(0, height * 0.72, 0, height);
  bottomGradient.addColorStop(0, "rgba(0,0,0,0)");
  bottomGradient.addColorStop(1, "rgba(0,0,0,.82)");
  context.fillStyle = bottomGradient;
  context.fillRect(0, height * 0.7, width, height * 0.3);

  const padding = 46 * scale;
  context.fillStyle = settings.lineColor;
  context.font = `700 ${13 * scale}px Arial`;
  context.fillText("ROUTELAPSE ORIGINAL", padding, padding);
  context.fillStyle = "#ffffff";
  context.font = `700 ${31 * scale}px Arial`;
  context.fillText(track.name.slice(0, 52), padding, padding + 40 * scale);
  context.textAlign = "right";
  context.font = `700 ${24 * scale}px monospace`;
  context.fillText(formatDistance(track.distanceMeters * progress), width - padding, padding + 12 * scale);
  context.font = `600 ${12 * scale}px Arial`;
  context.fillStyle = "rgba(255,255,255,.68)";
  context.fillText(`${Math.round(progress * 100)}% COMPLETE`, width - padding, height - padding);

  const attribution = Array.from(new Set(mapTileLayers[settings.mapStyle].map((layer) => layer.attribution))).join(" · ");
  context.textAlign = "left";
  context.font = `${9 * scale}px Arial`;
  context.fillStyle = "rgba(255,255,255,.72)";
  context.fillText(attribution.slice(0, 180), padding, height - padding);
  context.textAlign = "left";
}

function videoFormat() {
  const formats = [
    { mimeType: "video/mp4;codecs=avc1.42E01E", extension: "mp4" as const },
    { mimeType: "video/webm;codecs=vp9", extension: "webm" as const },
    { mimeType: "video/webm;codecs=vp8", extension: "webm" as const },
    { mimeType: "video/webm", extension: "webm" as const },
  ];
  return formats.find((format) => MediaRecorder.isTypeSupported(format.mimeType));
}

export async function renderRouteVideo(
  canvas: HTMLCanvasElement,
  track: Track,
  settings: SceneSettings,
  signal: AbortSignal,
  onProgress: (progress: RenderProgress) => void,
): Promise<RenderedVideo> {
  if (!("MediaRecorder" in window) || typeof canvas.captureStream !== "function") {
    throw new Error("Video export is not supported by this browser. Use current Chrome or Edge.");
  }
  const format = videoFormat();
  if (!format) throw new Error("This browser does not provide a supported video encoder.");
  const { width, height } = renderResolution(settings.aspect);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("The video canvas could not be created.");

  onProgress({ phase: "preparing", progress: 0 });
  const images = await preloadTiles(track, settings, width, height, signal, onProgress);
  if (signal.aborted) throw new DOMException("Rendering cancelled", "AbortError");
  drawFrame(context, track, settings, images, 0, width, height);

  const stream = canvas.captureStream(FRAME_RATE);
  const recorder = new MediaRecorder(stream, {
    mimeType: format.mimeType,
    videoBitsPerSecond: settings.aspect === "16:9" ? 14_000_000 : 12_000_000,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("The browser video encoder stopped unexpectedly."));
  });

  recorder.start(1_000);
  const startedAt = performance.now();
  try {
    await new Promise<void>((resolve, reject) => {
      const render = (now: number) => {
        if (signal.aborted) {
          reject(new DOMException("Rendering cancelled", "AbortError"));
          return;
        }
        const progress = Math.min(1, (now - startedAt) / (settings.duration * 1_000));
        drawFrame(context, track, settings, images, progress, width, height);
        onProgress({ phase: "recording", progress });
        if (progress >= 1) resolve();
        else window.requestAnimationFrame(render);
      };
      window.requestAnimationFrame(render);
    });
  } catch (error) {
    if (recorder.state !== "inactive") recorder.stop();
    await stopped.catch(() => undefined);
    stream.getTracks().forEach((mediaTrack) => mediaTrack.stop());
    throw error;
  }

  await new Promise((resolve) => window.setTimeout(resolve, 150));
  if (recorder.state !== "inactive") recorder.stop();
  await stopped;
  stream.getTracks().forEach((mediaTrack) => mediaTrack.stop());
  onProgress({ phase: "complete", progress: 1 });
  return { blob: new Blob(chunks, { type: format.mimeType }), extension: format.extension, mimeType: format.mimeType };
}

export function videoFileName(track: Track, extension: "mp4" | "webm") {
  const slug = track.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "route";
  return `${slug}-routelapse.${extension}`;
}
