import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SulitSend — Compare EUR→PHP money transfers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: -2,
          }}
        >
          SulitSend
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Compare EUR→PHP money transfers
        </div>
      </div>
    ),
    { ...size }
  );
}
