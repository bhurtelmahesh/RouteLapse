# RouteLapse

RouteLapse turns GPX activity tracks into customizable, cinematic route videos. It is being built as an installable Progressive Web App with a privacy-first local editing workflow and a cloud HD rendering pipeline.

Live app: [routelapse.web.app](https://routelapse.web.app/)

## Current foundation

- GPX drag-and-drop import and validation
- Multi-file and Adidas Running export ZIP import
- Locally calculated distance, duration, elevation gain, and track-point metrics
- Smooth distance-interpolated Leaflet route preview without a WebGL requirement
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

See [the revised product plan](docs/PRODUCT_PLAN.md) for the ingestion, Strava OAuth, rendering, and production milestones.

## Map attribution

The development preview uses OpenStreetMap tiles and preserves contributor attribution. A production tile provider and export licensing policy will be selected before public video rendering is enabled.
