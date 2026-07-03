import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SulitSend — Compare, then send more home";
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
          backgroundColor: "#101216",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#f2f3f5",
            letterSpacing: -2,
          }}
        >
          <span>Sulit</span>
          <span style={{ color: "#e8834e" }}>Send</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            fontWeight: 400,
            color: "rgba(242,243,245,0.66)",
          }}
        >
          Compare first. Send more home.
        </div>
      </div>
    ),
    { ...size }
  );
}
