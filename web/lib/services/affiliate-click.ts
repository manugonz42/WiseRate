// Browser-side counterpart to /api/click (docs/services/referral.md). CTAs
// keep their real `href` as a no-JS/view-source fallback (so the link still
// works with JS disabled — just without sub-ID credit) and call this from
// onClick to record the click and get the sub-ID-tagged redirect first.
export async function openAffiliateLink(providerId: string, fallbackURL: string): Promise<void> {
  try {
    const res = await fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId }),
    });
    if (res.ok) {
      const { redirectURL } = (await res.json()) as { redirectURL: string };
      window.open(redirectURL, "_blank", "noopener");
      return;
    }
  } catch {
    // network error — fall through to the direct link
  }
  window.open(fallbackURL, "_blank", "noopener");
}
