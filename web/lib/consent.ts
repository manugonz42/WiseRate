// Analytics consent state — read by T10's analytics wiring before firing events.
// SSR-safe: every read/write guards on `typeof window`.

const CONSENT_KEY = "sulitsend.consent.v1";

export type ConsentState = "granted" | "denied";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CONSENT_KEY);
  return raw === "granted" || raw === "denied" ? raw : null;
}

export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, state);
}
