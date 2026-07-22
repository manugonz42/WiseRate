import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "SulitSend — Compare EUR→PHP money transfers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read inside the component, never at module scope: Next imports this module
// on every runtime metadata resolution (just to read `alt`/`size`/
// `contentType`), and `public/` is not bundled into the serverless function —
// a module-scope read threw ENOENT there and took the whole metadata segment
// down with it (blank <title>, client error boundary on /provider/[id] and
// /send/[corridor]). next.config.mjs also traces the file into this route.
export default function Image() {
  const logo = readFileSync(
    join(process.cwd(), "public", "logomark.png")
  ).toString("base64");

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
          backgroundColor: "#1E2A12",
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
            fontSize: 96,
            fontWeight: 800,
            color: "#C6E84E",
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
            color: "rgba(242,246,228,0.75)",
          }}
        >
          Compare EUR→PHP money transfers
        </div>
      </div>
    ),
    { ...size }
  );
}
