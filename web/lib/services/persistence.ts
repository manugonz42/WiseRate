// Typed localStorage wrapper — local data the user owns (docs/services/persistence.md).
// Web's persistence layer is spec'd as IndexedDB/Dexie long-term; Alerts (T06)
// pre-decided plain localStorage since the CRUD surface is small. SSR-safe:
// every read/write guards on `typeof window`.

import type { FavoriteProvider, RateAlert } from "@/lib/models/types";

const ALERTS_KEY = "sulitsend.alerts.v1";
const FAVORITES_KEY = "sulitsend.favorites.v1";
const PROVIDER_ACCOUNTS_KEY = "sulitsend.providerAccounts.v1";
const DEFAULT_AMOUNT_KEY = "sulitsend.defaultAmount.v1";

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

export function getDefaultAmount(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEFAULT_AMOUNT_KEY);
    return raw ? parseInt(raw, 10) : null;
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
