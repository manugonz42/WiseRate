"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Info,
  Plus,
  Sparkle,
  ToggleLeft,
  ToggleRight,
  Trash,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { getQuotes } from "@/lib/services/rate";
import {
  deleteAlert,
  listAlerts,
  upsertAlert,
} from "@/lib/services/persistence";
import type {
  AlertNotifyType,
  QuotesResponse,
  RateAlert,
} from "@/lib/models/types";

const SEND_AMOUNT = 500;
const FREE_ALERT_CAP = 3;
const BANNER_KEY = "sulitsend.alerts.bannerDismissed.v1";

const TYPES: { id: AlertNotifyType; label: string }[] = [
  { id: "rateAbove", label: "Rate rises above" },
  { id: "rateBelow", label: "Rate falls below" },
  { id: "providerCheapest", label: "Provider is cheapest" },
];

function typeLabel(a: RateAlert, providerName: string): string {
  switch (a.notifyType) {
    case "rateAbove":
      return `€1 rises above ₱${a.targetRate.toFixed(2)}`;
    case "rateBelow":
      return `€1 falls below ₱${a.targetRate.toFixed(2)}`;
    case "providerCheapest":
      return `${providerName} is cheapest, target ₱${a.targetRate.toFixed(2)}`;
  }
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function AlertsPage() {
  return (
    <Suspense fallback={null}>
      <AlertsPageContent />
    </Suspense>
  );
}

function AlertsPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [quotes, setQuotes] = useState<QuotesResponse | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);

  const [targetRate, setTargetRate] = useState("");
  const [notifyType, setNotifyType] = useState<AlertNotifyType>("rateAbove");
  const [providerID, setProviderID] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    setAlerts(listAlerts());
    setBannerVisible(window.localStorage.getItem(BANNER_KEY) !== "1");
  }, []);

  useEffect(() => {
    getQuotes(SEND_AMOUNT)
      .then(setQuotes)
      .catch(() => setQuotes(null));
  }, []);

  useEffect(() => {
    const prefill = searchParams.get("rate");
    if (prefill && !Number.isNaN(Number(prefill))) setTargetRate(prefill);
  }, [searchParams]);

  const providers = useMemo(() => {
    const seen = new Map<string, string>();
    for (const q of quotes?.quotes ?? []) {
      if (!seen.has(q.providerID)) seen.set(q.providerID, q.providerName);
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [quotes]);

  const providerName = (id?: string) =>
    providers.find((p) => p.id === id)?.name ?? id ?? "";

  const active = alerts.filter((a) => !a.triggeredAt);
  const triggered = alerts.filter((a) => a.triggeredAt);
  // Free cap counts alerts that would actually fire — disabled ones don't.
  const enabledCount = active.filter((a) => a.isEnabled).length;

  const dismissBanner = () => {
    window.localStorage.setItem(BANNER_KEY, "1");
    setBannerVisible(false);
  };

  const refresh = () => setAlerts(listAlerts());

  const handleToggle = (alert: RateAlert) => {
    if (!alert.isEnabled && enabledCount >= FREE_ALERT_CAP) {
      setShowUpsell(true);
      return;
    }
    setShowUpsell(false);
    upsertAlert({ ...alert, isEnabled: !alert.isEnabled });
    refresh();
  };

  const handleDelete = (alert: RateAlert) => {
    if (!window.confirm("Delete this alert?")) return;
    deleteAlert(alert.id);
    refresh();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setShowUpsell(false);

    const rate = Number(targetRate);
    const mid = quotes?.rate.rate ?? null;
    if (!targetRate || Number.isNaN(rate) || rate <= 0) {
      setFormError("Enter a rate greater than 0.");
      return;
    }
    if (mid !== null && (rate < mid * 0.5 || rate > mid * 1.5)) {
      setFormError(
        `Rate must be within 50% of the current mid-market rate (₱${mid.toFixed(2)}).`,
      );
      return;
    }
    if (notifyType === "providerCheapest" && !providerID) {
      setFormError("Pick a provider.");
      return;
    }
    if (enabledCount >= FREE_ALERT_CAP) {
      setShowUpsell(true);
      return;
    }

    const alert: RateAlert = {
      id: crypto.randomUUID(),
      targetRate: rate,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      triggeredAt: null,
      notifyType,
      providerID: notifyType === "providerCheapest" ? providerID : undefined,
    };
    upsertAlert(alert);
    refresh();
    setTargetRate("");
    setProviderID("");
  };

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-5">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
          {t("alerts.title")}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Get notified when EUR → PHP crosses your target.
        </p>
      </header>

      {bannerVisible && (
        <div className="mb-5 flex items-start gap-3 rounded border border-primary/20 bg-primary/[0.08] px-4 py-3">
          <Info size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
          <p className="flex-1 text-sm text-text-secondary">
            Alerts are saved in this browser and checked while a tab is open.
            Email delivery is coming soon.
          </p>
          <button
            onClick={dismissBanner}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1 text-text-tertiary transition hover:bg-surface-hover"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="mb-6 rounded bg-surface p-5 shadow"
      >
        <h2 className="mb-4 text-base font-bold">New alert</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-2.5 rounded bg-bg px-4 py-3 focus-within:ring-1 focus-within:ring-primary">
            <span className="text-lg text-text-secondary">₱</span>
            <input
              type="number"
              step="0.01"
              min={0}
              placeholder="Target rate"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              className="tabular w-full bg-transparent text-lg font-bold outline-none"
              aria-label="Target rate"
            />
          </label>
          <button
            type="submit"
            className="btn-pop flex items-center justify-center gap-1.5 rounded bg-primary px-4 py-3 text-sm font-bold text-primary-light"
          >
            <Plus size={16} weight="bold" />
            Create alert
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setNotifyType(t.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
                notifyType === t.id
                  ? "bg-primary text-primary-light"
                  : "bg-bg text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {notifyType === "providerCheapest" && (
          <select
            value={providerID}
            onChange={(e) => setProviderID(e.target.value)}
            className="mt-3 w-full rounded bg-bg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            aria-label="Provider"
          >
            <option value="">Select a provider…</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        {formError && (
          <p className="mt-3 text-xs font-medium text-error">{formError}</p>
        )}

        {showUpsell && (
          <div className="mt-3 flex items-center gap-2 rounded bg-warning/[0.1] px-3 py-2.5 text-xs font-medium text-warning">
            <Sparkle size={14} weight="fill" className="shrink-0" />
            Premium — coming soon. Free plan is capped at {FREE_ALERT_CAP}{" "}
            active alerts.
          </div>
        )}
      </form>

      {/* Active */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-tertiary">
          Active
        </h2>
        {active.length === 0 ? (
          <div className="rounded bg-surface p-8 text-center text-sm text-text-secondary shadow">
            No alerts yet. Create one above.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {active.map((a) => (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded bg-surface p-4 shadow transition ${
                  a.isEnabled ? "" : "opacity-50"
                }`}
              >
                <Bell
                  size={18}
                  weight={a.isEnabled ? "fill" : "regular"}
                  className="shrink-0 text-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {typeLabel(a, providerName(a.providerID))}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    Created {relativeTime(a.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(a)}
                  aria-label={a.isEnabled ? "Disable alert" : "Enable alert"}
                  className="shrink-0 text-text-secondary transition hover:text-text-primary"
                >
                  {a.isEnabled ? (
                    <ToggleRight size={28} weight="fill" className="text-primary" />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  aria-label="Delete alert"
                  className="shrink-0 rounded-full p-1.5 text-text-tertiary transition hover:bg-surface-hover hover:text-error"
                >
                  <Trash size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Triggered */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-tertiary">
          Triggered
        </h2>
        {triggered.length === 0 ? (
          <div className="rounded bg-surface p-8 text-center text-sm text-text-secondary shadow">
            No alerts have fired yet.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {triggered.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded bg-surface p-4 shadow"
              >
                <Bell size={18} weight="fill" className="shrink-0 text-text-tertiary" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {typeLabel(a, providerName(a.providerID))}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    Fired {a.triggeredAt ? relativeTime(a.triggeredAt) : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
