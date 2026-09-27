# RouteLapse product plan

## Product promise

RouteLapse turns a recorded outdoor activity into a smooth, cinematic, share-ready video. Importing data, editing a scene, previewing motion, and exporting a real video are separate product stages; the UI must not imply that a preview is already a rendered video.

## Architecture

1. **Activity ingestion** normalizes every provider into one `Track` model.
   - GPX files and multi-file drops
   - Adidas Running export ZIP archives containing `Sport-sessions/GPS-data/*.gpx`
   - Strava OAuth with `activity:read_all`, activity selection, and detailed activity streams
2. **Timeline engine** converts geographic distance into continuous time. Position, heading, distance, elevation, camera target, and overlays are sampled at each frame instead of jumping between recorded GPS points.
3. **Interactive editor** controls camera mode, duration, aspect ratio, route styling, overlays, and music while keeping source activities private by default.
4. **Render pipeline** creates deterministic 1080p/4K frames and encodes MP4/H.264. Preview playback and exported output must use the same scene model.
5. **Project storage** uses Firebase Authentication, Firestore, and Cloud Storage for opted-in saved projects and renders. OAuth tokens and provider secrets stay server-side.

## Delivery milestones

### M1 — Reliable local studio

- [x] PWA shell and Firebase Hosting
- [x] GPX parsing and metrics
- [x] Continuous distance-based route sampling
- [x] Interactive map that does not require WebGL
- [x] Multi-GPX and Adidas export ZIP import
- [x] Activity library with dates, sport filtering, and search
- [x] Elevation and pace timeline
- [x] Local project-setting persistence

### M2 — Strava connection

- [ ] Register the RouteLapse Strava application with callback domain `routelapse.web.app`
- [ ] Deploy a Firebase 2nd-gen HTTPS function for OAuth code exchange and token refresh
- [ ] Store the Strava client secret in Firebase Secret Manager
- [ ] Store per-user refresh tokens encrypted and inaccessible to browser JavaScript
- [ ] Fetch activities and latitude/longitude streams on demand
- [ ] Let the athlete disconnect and delete imported provider data

The secure 2nd-generation function, refresh flow, activity endpoints, and disconnect path are implemented in `functions/`. Deployment remains blocked on the external app registration, secrets, Firestore activation, and Blaze billing.

Strava requires a server-side client secret for the authorization-code exchange. It must not be embedded in the static PWA.

### M3 — Real video rendering

- [x] Shared deterministic scene/timeline model
- [x] Full HD browser frame renderer with attributed map tiles
- [x] Chrome H.264/MP4 encoding with WebM fallback
- [ ] Render-job API, progress reporting, cancellation, and retry
- [x] Local progress reporting and cancellation
- [ ] Cloud FFmpeg encoding for 1080p/4K render jobs
- [x] Downloadable local output
- [ ] Short-lived Cloud Storage URLs for cloud renders
- [ ] Visual regression tests comparing preview and rendered frames

### M4 — Production hardening

- [ ] Firebase Authentication and saved projects
- [ ] Rate limits, quotas, abuse protection, and render budgets
- [ ] Privacy controls, retention policy, data export, and account deletion
- [ ] Accessibility, Core Web Vitals, analytics consent, and error monitoring
- [x] Install prompt, offline shell, and bounded recent map-tile cache
- [ ] 4K/60 fps, photos, music, templates, and batch rendering

## Immediate next decisions

1. Enable Firebase billing for Cloud Functions and rendering resources.
2. Create the Strava developer application and securely set `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET`.
3. Choose a production map provider whose terms permit video rendering and exported media.
