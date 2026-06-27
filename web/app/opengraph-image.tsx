import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic OG card (taste/seo). Brand-locked dark + purple, no external fonts.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0A0F0D 0%, #141A17 60%, #059669 140%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, color: "#34D399" }}>{SITE_NAME}</div>
        <div style={{ marginTop: 24, fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
          {`${SITE_TAGLINE}.`}
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "rgba(255,255,255,0.7)", maxWidth: 820 }}>
          Compare the real cost of EUR to PHP transfers across 15+ providers.
        </div>
      </div>
    ),
    size,
  );
}
