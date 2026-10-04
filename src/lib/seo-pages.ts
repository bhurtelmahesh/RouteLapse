export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  visualLabel: string;
  visualCaption: string;
  accent: string;
  routeKind: string;
  benefits: Array<{ title: string; body: string }>;
  steps: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  related: string[];
};

export const seoPages: SeoPage[] = [
  {
    slug: "running-route-video-maker",
    title: "Free Running Route Video Maker",
    description: "Turn a recorded run into an animated HD route video with custom cameras, satellite maps, pace data, and elevation styling—free in your browser.",
    eyebrow: "Running route video maker",
    heading: "Turn your running route into a video",
    intro: "RouteLapse turns a GPX or TCX run into an animated running route that follows your progress across the map. Choose a cinematic camera, add live distance and pace, and export a landscape, square, or vertical HD video for sharing.",
    visualLabel: "Morning run · 5.04 km",
    visualCaption: "A running route video in RouteLapse with a moving camera, pace colors, and live activity metrics.",
    accent: "#d8ff52",
    routeKind: "RUN",
    benefits: [
      { title: "Animate the whole run", body: "Reveal the route progressively instead of showing a static GPS line from the start." },
      { title: "Show running metrics", body: "Add distance, elapsed time, pace, and elevation in a position and layout that fits the video." },
      { title: "Ready for social video", body: "Export in 16:9, 9:16, or 1:1 with an always-on RouteLapse outro and optional corner watermark." },
    ],
    steps: [
      { title: "Export the activity", body: "Download your run as GPX or TCX from your watch, fitness platform, or activity archive." },
      { title: "Direct the animation", body: "Choose Follow or Cinematic camera mode, set pitch and zoom, then select a street, satellite, hybrid, or dark map." },
      { title: "Render the route video", body: "Preview the animation, choose the canvas shape, and render a share-ready HD video locally in the browser." },
    ],
    faqs: [
      { question: "Can I make a running route video for free?", answer: "Yes. RouteLapse is a free browser-based running route video maker. You can try the included demo or import your own GPX or TCX activity." },
      { question: "Can the video follow my run instead of showing the full route?", answer: "Yes. Follow mode tracks the moving activity point, while Cinematic mode adds pitch and optional Forward-up orientation before finishing with a centered route reveal." },
      { question: "Does RouteLapse upload my running file?", answer: "The editor parses activity files in the current browser session. Route editing and HD rendering are performed locally." },
    ],
    related: ["gpx-to-video", "strava-route-animation", "pace-elevation-heat-map"],
  },
  {
    slug: "walking-route-video-maker",
    title: "Free Walking Route Video Maker",
    description: "Turn a walking route into an animated map video. Import GPX or TCX, choose street or satellite maps, add metrics, and export HD video.",
    eyebrow: "Walking route video maker",
    heading: "Turn your walking route into a video",
    intro: "Create a walking route video from a city walk, holiday track, charity walk, or daily activity. RouteLapse animates your GPS path over a detailed map and gives you control over speed, camera movement, labels, and video format.",
    visualLabel: "City walk · 7.8 km",
    visualCaption: "A walking route animation with a clear street map and a gentle follow camera for easy viewing.",
    accent: "#6bdcff",
    routeKind: "WALK",
    benefits: [
      { title: "Make long walks watchable", body: "Compress hours of movement into a smooth route animation lasting only a few seconds." },
      { title: "Keep place context", body: "Use street, satellite, or hybrid imagery to show neighborhoods, parks, paths, and landmarks around the walk." },
      { title: "Add the details you want", body: "Display time, distance, pace, and elevation—or hide the metrics card and use a transparent image overlay." },
    ],
    steps: [
      { title: "Record or export the walk", body: "Use any GPS watch or activity app that can provide a GPX or TCX file." },
      { title: "Choose a calm camera", body: "Use Overview for a stable map or Follow for a closer animation that travels with the walker." },
      { title: "Share the finished walk", body: "Render a horizontal recap or a 9:16 walking route video for Stories, Reels, Shorts, and TikTok." },
    ],
    faqs: [
      { question: "Which walking files does RouteLapse support?", answer: "RouteLapse supports GPX and TCX activities, plus ZIP activity exports containing supported files." },
      { question: "Can I make a vertical walking route video?", answer: "Yes. Select the 9:16 canvas for a vertical video, then adjust camera zoom and overlay positions for the narrower frame." },
      { question: "Can I use satellite maps for a walking route?", answer: "Yes. Satellite and hybrid map styles are available alongside street and dark maps. Map tiles require an internet connection." },
    ],
    related: ["gpx-to-video", "hiking-route-video", "running-route-video-maker"],
  },
  {
    slug: "gpx-to-video",
    title: "Free GPX to Video Converter",
    description: "Convert GPX and TCX tracks into animated HD map videos with camera controls, map styles, metrics, overlays, and social video formats.",
    eyebrow: "GPX to video converter",
    heading: "Convert a GPX route into an animated video",
    intro: "RouteLapse is a free GPX animation maker for runs, walks, hikes, rides, and other recorded activities. Drop in a GPX or TCX file, preview the route animation, customize the scene, and render the finished map video without installing desktop software.",
    visualLabel: "GPX → animated HD video",
    visualCaption: "The RouteLapse GPX-to-video workflow: a progressive route, moving marker, map imagery, and configurable overlays.",
    accent: "#ff6b45",
    routeKind: "GPX",
    benefits: [
      { title: "Works with common GPS exports", body: "Import individual GPX or TCX files and supported ZIP archives from activity services and GPS devices." },
      { title: "More than a line animation", body: "Control duration, pitch, zoom, route styling, camera behavior, output ratio, metrics, and image overlays." },
      { title: "Local browser rendering", body: "The activity is parsed and the video is rendered in your browser, with MP4 preferred when the browser exposes an encoder." },
    ],
    steps: [
      { title: "Choose a GPX or TCX file", body: "Open RouteLapse and drop the activity into the upload area. The included demo lets you test the editor first." },
      { title: "Preview the GPS route animation", body: "Scrub the timeline and refine duration, camera zoom, pitch, map style, route color, heat map, and overlays." },
      { title: "Convert and download", body: "Render the activity as Full HD video. Keep the tab open while RouteLapse loads map tiles and records the animation." },
    ],
    faqs: [
      { question: "Is RouteLapse a GPX to MP4 converter?", answer: "RouteLapse prefers MP4 when the current browser provides a compatible encoder. It uses WebM when MP4 encoding is unavailable." },
      { question: "Do I need to install an app to animate a GPX file?", answer: "No. RouteLapse runs as a web app and can also be installed as a PWA. Desktop Chrome or Edge is recommended for dependable HD rendering." },
      { question: "Can GPX elevation and timestamps be used?", answer: "Yes. When the file contains usable elevation and time data, RouteLapse can calculate activity metrics and color route segments by pace or elevation." },
    ],
    related: ["running-route-video-maker", "walking-route-video-maker", "pace-elevation-heat-map"],
  },
  {
    slug: "strava-route-animation",
    title: "Strava Route Animation Video Maker",
    description: "Animate a Strava activity by exporting its GPX route, importing it into RouteLapse, and creating a cinematic HD map video with metrics and overlays.",
    eyebrow: "Strava route animation",
    heading: "Animate a Strava route as a cinematic video",
    intro: "Turn a Strava run, walk, hike, or ride into a route animation by exporting the activity as GPX and opening it in RouteLapse. Add animated pace colors, choose a camera, and optionally place a transparent Strava-style metrics image over the video.",
    visualLabel: "Strava GPX · route replay",
    visualCaption: "A Strava route re-created in RouteLapse with a transparent metrics overlay positioned over the animated map.",
    accent: "#fc4c02",
    routeKind: "STRAVA",
    benefits: [
      { title: "Use your Strava activity route", body: "Export the activity GPX from Strava, then import the file into the RouteLapse editor." },
      { title: "Match your activity presentation", body: "Show RouteLapse metrics or upload a transparent PNG or WebP card and place it anywhere over the map." },
      { title: "Create social-ready replays", body: "Select portrait, square, or landscape output and tune the animation duration for the platform where you will share it." },
    ],
    steps: [
      { title: "Export GPX from Strava", body: "Open the individual activity on Strava and use its export option to download the route as a GPX file." },
      { title: "Import the activity", body: "Drop the exported GPX into RouteLapse. Direct Strava account connection is not active yet, so no Strava login is required." },
      { title: "Style and render", body: "Choose camera and map settings, add metrics or a transparent image, preview the route, and render the final HD video." },
    ],
    faqs: [
      { question: "Does RouteLapse connect directly to my Strava account?", answer: "Not currently. Export the individual Strava activity as GPX and import that file. This keeps the workflow simple and avoids granting account access." },
      { question: "Can I add Strava statistics to the video?", answer: "Yes. Use RouteLapse's built-in metrics or upload a transparent PNG or WebP metrics card, then adjust its size and position independently." },
      { question: "Can I animate Strava rides and hikes too?", answer: "Yes. RouteLapse animates the GPS route regardless of whether the activity is a run, walk, hike, or ride." },
    ],
    related: ["running-route-video-maker", "gpx-to-video", "hiking-route-video"],
  },
  {
    slug: "hiking-route-video",
    title: "Free Hiking Route Video Maker",
    description: "Create an animated hiking route video from GPX or TCX with satellite terrain, elevation heat maps, climb metrics, cinematic cameras, and HD export.",
    eyebrow: "Hiking route video maker",
    heading: "Turn a hiking route into a map video",
    intro: "Replay a trail, summit day, backpacking stage, or mountain walk as an animated hiking route. Satellite and hybrid maps preserve the landscape context, while elevation heat maps and climb metrics help tell the story of the terrain.",
    visualLabel: "Mountain hike · +842 m",
    visualCaption: "A hiking route video over satellite terrain with lower-to-higher elevation coloring and climb information.",
    accent: "#f4b860",
    routeKind: "HIKE",
    benefits: [
      { title: "Show the terrain", body: "Use satellite or hybrid imagery so ridges, valleys, forests, roads, and trail surroundings remain visible." },
      { title: "Visualize the climb", body: "Color the completed route from lower to higher elevation and add elevation or total climb to the metrics overlay." },
      { title: "Control route scale", body: "Set a close cinematic zoom for trail detail, use Overview for context, or finish with an automatic full-route reveal." },
    ],
    steps: [
      { title: "Import the hiking track", body: "Export GPX or TCX from your GPS watch, navigation app, or hiking platform and add it to RouteLapse." },
      { title: "Choose terrain-focused styling", body: "Select Satellite or Hybrid, enable the elevation heat map, and choose colors that remain clear over the imagery." },
      { title: "Build the hiking recap", body: "Add climb and distance metrics, set the camera pace, and render an HD hiking route video for your trip recap." },
    ],
    faqs: [
      { question: "Can RouteLapse show elevation changes on a hike?", answer: "Yes. If the activity includes altitude data, the elevation heat map colors lower and higher parts of the route and the metrics can show elevation." },
      { question: "Which map style is best for a hiking route video?", answer: "Satellite or Hybrid usually gives the most terrain context. Street can be clearer for urban paths, and Dark works well with bright route colors." },
      { question: "Can I make a video from a long hike?", answer: "Yes. Video duration is independent of the recorded activity length, so a multi-hour hike can be compressed into a short animation." },
    ],
    related: ["pace-elevation-heat-map", "walking-route-video-maker", "gpx-to-video"],
  },
  {
    slug: "pace-elevation-heat-map",
    title: "Pace & Elevation Heat Map Video Maker",
    description: "Create animated pace and elevation heat map videos from GPX or TCX activities with custom colors, map styles, metrics, and HD export.",
    eyebrow: "Pace and elevation heat maps",
    heading: "Animate pace and elevation along your route",
    intro: "RouteLapse can color every completed route segment by pace or elevation while the activity animates. Use pace to show slower and faster sections, or elevation to reveal lower and higher terrain, then reproduce the same heat map in the exported HD video.",
    visualLabel: "Slower → faster · lower → higher",
    visualCaption: "An animated route heat map that moves from cool to warm colors as pace or elevation values change.",
    accent: "#ef4444",
    routeKind: "HEAT",
    benefits: [
      { title: "Pace heat map video", body: "Use timestamps and distance between GPS points to color slower and faster sections of a run, walk, hike, or ride." },
      { title: "Elevation route animation", body: "Use recorded altitude to move each route segment from your chosen low color toward the high color." },
      { title: "Custom readable colors", body: "Select both ends of the gradient and keep the on-video legend visible over street, dark, satellite, or hybrid maps." },
    ],
    steps: [
      { title: "Import complete activity data", body: "Pace heat needs usable timestamps; elevation heat needs altitude values in the GPX or TCX activity." },
      { title: "Choose Heat map", body: "Open Route style, select Heat map, then choose Pace or Elevation and set the low and high colors." },
      { title: "Preview and export", body: "Scrub through the progressive route to check contrast. The rendered video keeps the heat colors and matching legend." },
    ],
    faqs: [
      { question: "What does a pace heat map show?", answer: "It compares speed along consecutive GPS segments. Slower sections move toward the low color and faster sections toward the high color." },
      { question: "Why is the heat map option missing data?", answer: "The imported file must contain the needed measurements. Pace requires valid timestamps and elevation requires altitude values." },
      { question: "Do GPS spikes ruin the heat map scale?", answer: "RouteLapse trims extreme values when choosing the useful color range so one unusual GPS point does not flatten the colors across the rest of the route." },
    ],
    related: ["running-route-video-maker", "hiking-route-video", "gpx-to-video"],
  },
];

export const seoPageBySlug = new Map(seoPages.map((page) => [page.slug, page]));
