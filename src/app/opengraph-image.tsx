import { ImageResponse } from "next/og";

export const alt = "RouteLapse cinematic GPX route videos with pace and elevation heat maps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(145deg, #080b0f 0%, #111820 62%, #1c2519 100%)",
        color: "#f4f7f8",
        display: "flex",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "76px 82px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 650 }}>
        <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
          <div
            style={{
              alignItems: "center",
              background: "#d8ff52",
              borderRadius: 18,
              color: "#0c1003",
              display: "flex",
              fontSize: 42,
              fontWeight: 800,
              height: 72,
              justifyContent: "center",
              width: 72,
            }}
          >
            R
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>RouteLapse</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 66, fontWeight: 800, letterSpacing: -3, lineHeight: 1.04, marginTop: 48 }}>
          Your route.<br />In motion.
        </div>
        <div style={{ color: "#aab4bd", fontSize: 25, lineHeight: 1.4, marginTop: 28 }}>
          Cinematic GPX videos with pace + elevation heat maps.
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          background: "#0d1218",
          border: "2px solid rgba(255,255,255,0.14)",
          borderRadius: 38,
          display: "flex",
          height: 420,
          justifyContent: "center",
          position: "relative",
          width: 370,
        }}
      >
        <div style={{ display: "flex", gap: 8, position: "absolute", top: 26 }}>
          <div style={{ background: "rgba(59,130,246,0.14)", border: "1px solid rgba(59,130,246,0.55)", borderRadius: 999, color: "#8db9ff", display: "flex", fontSize: 12, fontWeight: 800, letterSpacing: 1.5, padding: "7px 11px" }}>PACE</div>
          <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.5)", borderRadius: 999, color: "#ff9898", display: "flex", fontSize: 12, fontWeight: 800, letterSpacing: 1.5, padding: "7px 11px" }}>ELEVATION</div>
        </div>
        <svg height="280" viewBox="0 0 270 300" width="270">
          <defs>
            <linearGradient id="routeHeat" x1="0%" x2="100%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="52%" stopColor="#9b65a1" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M32 244 C76 232 60 177 111 166 C164 155 126 86 182 72 C219 63 230 33 242 24" fill="none" stroke="#38414a" strokeLinecap="round" strokeWidth="22" />
          <path d="M32 244 C76 232 60 177 111 166 C164 155 126 86 182 72 C219 63 230 33 242 24" fill="none" stroke="url(#routeHeat)" strokeLinecap="round" strokeWidth="9" />
          <circle cx="32" cy="244" fill="#ffffff" r="13" stroke="#3b82f6" strokeWidth="7" />
          <circle cx="242" cy="24" fill="#ef4444" r="13" />
        </svg>
        <div style={{ bottom: 26, color: "#d8ff52", display: "flex", fontSize: 16, fontWeight: 700, letterSpacing: 2.2, position: "absolute" }}>
          GPX → HEAT MAP → HD
        </div>
      </div>
    </div>,
    size,
  );
}
