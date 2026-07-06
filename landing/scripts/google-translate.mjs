import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Node's fetch/undici fails against translate.google* in this environment
// ("Premature close" on TLS renegotiation), but curl works fine here, so we
// shell out to it instead of adding an HTTP client dependency.
//
// The full URL (with the text already percent-encoded via URLSearchParams)
// is built in JS and passed as a single argv entry. Passing raw non-ASCII
// text as a separate --data-urlencode argument gets mangled by Windows'
// ANSI codepage translation of child_process argv, e.g. "€" becomes "�".
export async function googleTranslate(text, { from = "en", to = "tl" } = {}) {
  if (!text.trim()) return text;

  const params = new URLSearchParams({
    client: "gtx",
    sl: from,
    tl: to,
    dt: "t",
    q: text,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params.toString()}`;

  const { stdout } = await execFileAsync("curl", ["-s", url, "--max-time", "15"]);

  const parsed = JSON.parse(stdout);
  const sentences = parsed[0] ?? [];
  return sentences.map((s) => s[0]).join("");
}
