import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "SulitSend — Compare, then send more home";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inlined at build time (Node runtime) so the mark ships inside the OG PNG.
const logo = readFileSync(
  join(process.cwd(), "public", "logomark.png")
).toString("base64");

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={128}
          height={128}
          src={`data:image/png;base64,${logo}`}
          style={{ marginBottom: 40 }}
          alt=""
        />
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
