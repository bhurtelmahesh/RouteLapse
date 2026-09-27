import { ImageResponse } from "next/og";

export const alt = "RouteLapse route video studio";
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
        <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: -3, lineHeight: 1.04, marginTop: 48 }}>
          Turn movement into motion.
        </div>
        <div style={{ color: "#aab4bd", fontSize: 25, lineHeight: 1.4, marginTop: 28 }}>
          Create cinematic route videos from your GPX runs.
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
        <svg height="300" viewBox="0 0 270 300" width="270">
          <path d="M32 244 C76 232 60 177 111 166 C164 155 126 86 182 72 C219 63 230 33 242 24" fill="none" stroke="#38414a" strokeLinecap="round" strokeWidth="22" />
          <path d="M32 244 C76 232 60 177 111 166 C164 155 126 86 182 72 C219 63 230 33 242 24" fill="none" stroke="#d8ff52" strokeLinecap="round" strokeWidth="9" />
          <circle cx="32" cy="244" fill="#ffffff" r="13" stroke="#d8ff52" strokeWidth="7" />
          <circle cx="242" cy="24" fill="#d8ff52" r="13" />
        </svg>
        <div style={{ bottom: 28, color: "#d8ff52", display: "flex", fontSize: 18, fontWeight: 700, letterSpacing: 3, position: "absolute" }}>
          GPX → HD VIDEO
        </div>
      </div>
    </div>,
    size,
  );
}
