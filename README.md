# RouteLapse

RouteLapse turns GPX activity tracks into customizable, cinematic route videos. It is being built as an installable Progressive Web App with a privacy-first local editing workflow and a cloud HD rendering pipeline.

Live app: [routelapse.web.app](https://routelapse.web.app/)

## Current foundation

- GPX drag-and-drop import and validation
- Multi-file and Adidas Running export ZIP import
- Searchable activity library with date and sport filtering
- Locally calculated distance, duration, elevation gain, and track-point metrics
- Synchronized elevation and pace profiles
- Smooth distance-interpolated Leaflet route preview without a WebGL requirement
- Switchable Street, Satellite, Hybrid, and Dark preview styles
- Overview, follow, and cinematic camera modes
- Video duration, camera pitch, aspect ratio, and route color controls
- Local Full HD MP4 rendering in Chrome with WebM fallback
- Local project-setting persistence
- Responsive editor for desktop and mobile
- Web app manifest and production service worker
- Offline shell and recently viewed map-tile caching
- Firebase Hosting with security and immutable-asset cache headers
- Canonical metadata, Open Graph image, structured data, robots.txt, and sitemap.xml
- Google Search Console ownership verification and sitemap submission
- Unit tests, linting, type checking, and GitHub Actions CI
- Secure Firebase Functions scaffold for Strava OAuth, token refresh, activity streams, and disconnect

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

See [the revised product plan](docs/PRODUCT_PLAN.md) for the ingestion, Strava OAuth, rendering, and production milestones.

## Map attribution

The preview and local renderer use OpenStreetMap, CARTO, and Esri tile services and keep each provider's attribution visible. Commercial/public rendering terms must be reviewed before offering paid or server-side exports.
