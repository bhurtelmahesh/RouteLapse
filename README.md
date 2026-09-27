# RouteLapse

RouteLapse turns GPX activity tracks into customizable, cinematic route videos. It is being built as an installable Progressive Web App with a privacy-first local editing workflow and a cloud HD rendering pipeline.

Live app: [routelapse.web.app](https://routelapse.web.app/)

## Current foundation

- GPX drag-and-drop import and validation
- Locally calculated distance, duration, elevation gain, and track-point metrics
- Animated MapLibre route preview
- Overview, follow, and cinematic camera modes
- Video duration, camera pitch, aspect ratio, and route color controls
- Responsive editor for desktop and mobile
- Web app manifest and production service worker
- Firebase Hosting with security and immutable-asset cache headers
- Canonical metadata, Open Graph image, structured data, robots.txt, and sitemap.xml
- Google Search Console ownership verification and sitemap submission
- Unit tests, linting, type checking, and GitHub Actions CI

No personal GPX files are stored in this repository.

## Development

Use Node.js 20.9 or newer (Node.js 24 is used in CI).

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Roadmap

1. Deterministic Remotion scene model and HD MP4 render worker
2. Map themes, elevation-aware cameras, overlays, and timeline editing
3. Firebase authentication and project storage
4. Strava OAuth and activity import
5. 4K/60 fps, music, photos, reusable templates, and batch rendering

## Map attribution

The development preview uses OpenStreetMap tiles and preserves contributor attribution. A production tile provider and export licensing policy will be selected before public video rendering is enabled.
