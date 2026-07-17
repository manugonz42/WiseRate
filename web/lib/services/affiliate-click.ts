// Browser-side counterpart to /api/click (docs/services/referral.md). CTAs
// keep their real `href` as a no-JS/view-source fallback (so the link still
// works with JS disabled — just without sub-ID credit) and call this from
// onClick to record the click and get the sub-ID-tagged redirect first.
//
// The tab must be opened synchronously inside the click's user gesture:
// Safari/iOS block a `window.open` issued after an `await`, which would
// silently kill the CTA. So open a blank tab first, then point it at the
// resolved URL when /api/click responds. (`window.open` with a "noopener"
// feature returns null, so the opener is severed manually instead.)
export async function openAffiliateLink(providerId: string, fallbackURL: string): Promise<void> {
  const tab = window.open("", "_blank");
  if (tab) tab.opener = null;

  let url = fallbackURL;
  try {
    const res = await fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId }),
    });
    if (res.ok) {
      url = ((await res.json()) as { redirectURL: string }).redirectURL;
    }
  } catch {
    // network error — fall through to the direct link
  }

  if (tab) {
    tab.location.href = url;
  } else {
    // popup blocked outright — same-tab navigation as the last resort
    window.location.href = url;
  }
}
