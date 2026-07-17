"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { getProfile, getSession, signOut, updateProfile } from "@/lib/services/auth";
import { setProviderAccounts } from "@/lib/services/persistence";
import { track } from "@/lib/analytics";
import { formatIsoToDisplay } from "@/lib/dob";
import ProviderAccounts from "@/components/ProviderAccounts";
import { CountrySelect } from "@/components/auth/CountrySelect";
import type { HeardFrom, Profile } from "@/lib/models/types";

const HEARD_FROM_OPTIONS: HeardFrom[] = ["search", "friend", "social", "youtube", "other"];

export default function AccountPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [providersUsed, setProvidersUsed] = useState<string[]>([]);
  const [heardFrom, setHeardFrom] = useState<HeardFrom | "">("");

  useEffect(() => {
    Promise.all([getProfile(), getSession()]).then(([p, session]) => {
      setProfile(p);
      setEmail(session?.user.email ?? null);
      setLoading(false);
      if (p) {
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setCountryCode(p.countryCode);
        setEmailNotifications(p.emailNotifications);
        setHeardFrom(p.heardFrom ?? "");
        if (p.providersUsed) setProviderAccounts(p.providersUsed);
      }
    });
  }, []);

  const startEdit = () => {
    setSaved(false);
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setCountryCode(profile.countryCode);
    setEmailNotifications(profile.emailNotifications);
    setHeardFrom(profile.heardFrom ?? "");
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      countryCode: countryCode ?? undefined,
      emailNotifications,
      providersUsed,
      heardFrom: heardFrom || undefined,
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            countryCode: countryCode ?? prev.countryCode,
            emailNotifications,
            providersUsed,
            heardFrom: heardFrom || null,
          }
        : prev,
    );
    setEditing(false);
    setSaved(true);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/home");
  };

  const handleDelete = async () => {
    if (!window.confirm(t("auth.accountDeleteConfirm"))) return;
    setDeleting(true);
    const response = await fetch("/api/account/delete", { method: "POST" });
    if (!response.ok) {
      setDeleting(false);
      setError(t("auth.errorGeneric"));
      return;
    }
    track("auth.account_deleted");
    await signOut();
    router.push("/home");
  };

  if (loading) return null;
  if (!profile) return null; // middleware redirects unauthenticated /account/* to /login

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
          {t("auth.accountTitle")}
        </h1>
      </header>

      <div className="space-y-4 rounded bg-surface p-5 shadow">
        {editing ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-text-secondary">
                  {t("auth.firstName")}
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={60}
                  className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-text-secondary">
                  {t("auth.lastName")}
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={60}
                  className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>

            <CountrySelect label={t("auth.country")} value={countryCode} onChange={setCountryCode} />

            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="text-sm text-text-secondary">{t("auth.emailNotifications")}</span>
            </label>

            <ProviderAccounts label={t("auth.providersUsedLabel")} onChange={setProvidersUsed} />

            <label className="block">
              <span className="mb-1 block text-sm font-bold text-text-secondary">
                {t("auth.heardFrom")}
              </span>
              <select
                value={heardFrom}
                onChange={(e) => setHeardFrom(e.target.value as HeardFrom | "")}
                className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t("auth.heardFromPlaceholder")}</option>
                {HEARD_FROM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(`auth.heardFrom${opt[0].toUpperCase()}${opt.slice(1)}`)}
                  </option>
                ))}
              </select>
            </label>

            {error ? <p className="text-xs font-medium text-error">{error}</p> : null}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-pop flex-1 rounded bg-primary px-4 py-2.5 text-sm font-bold text-primary-light disabled:opacity-60"
              >
                {saving ? t("auth.accountSaving") : t("auth.accountSave")}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded px-4 py-2.5 text-sm font-bold text-text-secondary transition hover:bg-surface-hover"
              >
                {t("auth.accountCancel")}
              </button>
            </div>
          </>
        ) : (
          <>
            <dl className="space-y-3 text-sm">
              <Row label={t("auth.firstName")} value={profile.firstName} />
              <Row label={t("auth.lastName")} value={profile.lastName} />
              <Row label={t("auth.email")} value={email ?? "—"} />
              <Row label={t("auth.birthDate")} value={formatIsoToDisplay(profile.birthDate)} />
              <Row label={t("auth.country")} value={profile.countryCode} />
            </dl>
            {saved ? <p className="text-xs font-medium text-success">{t("auth.accountSaved")}</p> : null}
            <button
              type="button"
              onClick={startEdit}
              className="w-full rounded bg-bg px-4 py-2.5 text-sm font-bold text-text-primary transition hover:bg-surface-hover"
            >
              {t("auth.accountEdit")}
            </button>
          </>
        )}
      </div>

      <Link
        href="/account/referral"
        className="mt-4 flex w-full items-center justify-between rounded bg-surface px-4 py-3 text-sm font-bold text-text-primary shadow transition hover:bg-surface-hover"
      >
        {t("auth.accountReferralCta")}
        <CaretRight size={16} weight="bold" />
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 w-full rounded bg-surface px-4 py-2.5 text-sm font-bold text-text-primary shadow transition hover:bg-surface-hover"
      >
        {t("auth.accountLogout")}
      </button>

      <div className="mt-8 rounded border border-error/30 bg-error/[0.05] p-4">
        <h2 className="text-sm font-bold text-error">{t("auth.accountDeleteTitle")}</h2>
        <p className="mt-1 text-xs text-text-secondary">{t("auth.accountDeleteDesc")}</p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mt-3 rounded bg-error px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {deleting ? t("auth.accountDeleting") : t("auth.accountDeleteButton")}
        </button>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
