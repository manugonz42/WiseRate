// Typed localStorage wrapper — local data the user owns (docs/services/persistence.md).
// Web's persistence layer is spec'd as IndexedDB/Dexie long-term; Alerts (T06)
// pre-decided plain localStorage since the CRUD surface is small. SSR-safe:
// every read/write guards on `typeof window`.

import type { FavoriteProvider, RateAlert } from "@/lib/models/types";
import { REFERRAL_CODE_ALPHABET } from "@/lib/services/referral-code";

const KEY_PREFIX = "sulitsend.";
const ALERTS_KEY = "sulitsend.alerts.v1";
const FAVORITES_KEY = "sulitsend.favorites.v1";
const PROVIDER_ACCOUNTS_KEY = "sulitsend.providerAccounts.v1";
const DEFAULT_AMOUNT_KEY = "sulitsend.defaultAmount.v1";
const ONBOARDED_KEY = "sulitsend.onboarded.v1";
const LOCALE_KEY = "sulitsend.locale.v1";
const REFERRAL_KEY = "sulitsend.ref.v1";
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const REFERRAL_CODE_RE = new RegExp(`^[${REFERRAL_CODE_ALPHABET}]{8}$`);

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(list));
}

export function listAlerts(): RateAlert[] {
  return readList<RateAlert>(ALERTS_KEY);
}

export function upsertAlert(alert: RateAlert): RateAlert[] {
  const alerts = listAlerts();
  const idx = alerts.findIndex((a) => a.id === alert.id);
  if (idx >= 0) alerts[idx] = alert;
  else alerts.push(alert);
  writeList(ALERTS_KEY, alerts);
  return alerts;
}

export function deleteAlert(id: string): RateAlert[] {
  const alerts = listAlerts().filter((a) => a.id !== id);
  writeList(ALERTS_KEY, alerts);
  return alerts;
}

// Unused until Provider Detail's favorites toggle is revisited — kept here so
// the whole storage surface lives in one place.
export function listFavorites(): FavoriteProvider[] {
  return readList<FavoriteProvider>(FAVORITES_KEY);
}

export function toggleFavorite(providerID: string): FavoriteProvider[] {
  const favorites = listFavorites();
  const idx = favorites.findIndex((f) => f.providerID === providerID);
  if (idx >= 0) favorites.splice(idx, 1);
  else favorites.push({ providerID, addedAt: new Date().toISOString() });
  writeList(FAVORITES_KEY, favorites);
  return favorites;
}

export function listProviderAccounts(): string[] {
  return readList<string>(PROVIDER_ACCOUNTS_KEY);
}

export function toggleProviderAccount(providerID: string): string[] {
  const accounts = listProviderAccounts();
  const idx = accounts.indexOf(providerID);
  if (idx >= 0) accounts.splice(idx, 1);
  else accounts.push(providerID);
  writeList(PROVIDER_ACCOUNTS_KEY, accounts);
  return accounts;
}

// Seeds the local list from the server profile (T35 /account) — keeps
// ProviderAccounts (localStorage-backed) and `profiles.providers_used` in
// sync without a two-way store.
export function setProviderAccounts(accounts: string[]): void {
  writeList(PROVIDER_ACCOUNTS_KEY, accounts);
}

export function getDefaultAmount(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEFAULT_AMOUNT_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setDefaultAmount(n: number | null): void {
  if (typeof window === "undefined") return;
  if (n === null) {
    window.localStorage.removeItem(DEFAULT_AMOUNT_KEY);
  } else {
    window.localStorage.setItem(DEFAULT_AMOUNT_KEY, String(n));
  }
}

export function getOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) !== null;
  } catch {
    return false;
  }
}

export function setOnboarded(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDED_KEY, "1");
}

export function clearOnboarded(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDED_KEY);
}

export function getStoredLocale(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCALE_KEY);
  } catch {
    return null;
  }
}

export function setStoredLocale(code: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCALE_KEY, code);
}

export interface ReferralCapture {
  code: string;
  at: string; // ISO 8601
}

// Captures an incoming `?ref=` code (T36, docs/modules/referral.md): validates
// the Crockford-alphabet format, then overwrites any previously stored code —
// last-touch wins. No cookie (functional localStorage only, see /cookies).
// Returns false (no-op) for a malformed code.
export function captureReferralCode(rawCode: string): boolean {
  const code = rawCode.trim().toUpperCase();
  if (!REFERRAL_CODE_RE.test(code)) return false;
  if (typeof window === "undefined") return false;
  const entry: ReferralCapture = { code, at: new Date().toISOString() };
  window.localStorage.setItem(REFERRAL_KEY, JSON.stringify(entry));
  return true;
}

// Reads the stored capture, clearing + returning null once past the 30-day
// window.
export function getReferralCapture(): ReferralCapture | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REFERRAL_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as ReferralCapture;
    if (!entry.code || !entry.at) return null;
    if (Date.now() - new Date(entry.at).getTime() > REFERRAL_TTL_MS) {
      window.localStorage.removeItem(REFERRAL_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

// Wipes every sulitsend.* key — prefix scan on purpose, so feature-owned keys
// (e.g. the alerts banner dismissal) are cleared too.
export function clearAll(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(KEY_PREFIX)) keys.push(key);
  }
  keys.forEach((key) => window.localStorage.removeItem(key));
}
