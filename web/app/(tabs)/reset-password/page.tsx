"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  getSession,
  onAuthStateChange,
  requestPasswordReset,
  updatePassword,
} from "@/lib/services/auth";
import { track } from "@/lib/analytics";

// Dual-purpose: "request a reset link" for anonymous visitors, or "choose a
// new password" once the emailed link lands here with a Supabase recovery
// session already established (docs/plan/T35-signup-ui.md route list).
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSession().then((session) => {
      if (!cancelled && session) setRecoveryMode(true);
    });
    const unsubscribe = onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-16 pt-8 sm:px-6">
      {recoveryMode ? <NewPasswordForm t={t} /> : <RequestResetForm t={t} />}
    </main>
  );
}

function RequestResetForm({ t }: { t: (key: string, opts?: Record<string, unknown>) => string }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await requestPasswordReset(email.trim());
    setSubmitting(false);
    setSent(true);
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
          {t("auth.resetTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">{t("auth.resetSubtitle")}</p>
      </header>

      {sent ? (
        <p className="rounded bg-surface p-5 text-sm text-text-secondary shadow">
          {t("auth.resetSent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded bg-surface p-5 shadow" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-text-secondary">
              {t("auth.email")}
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="btn-pop w-full rounded bg-primary px-4 py-3 text-sm font-bold text-primary-light disabled:opacity-60"
          >
            {submitting ? t("auth.resetSending") : t("auth.resetSubmit")}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-text-secondary">
        <Link href="/login" className="text-primary hover:underline">
          {t("auth.backToLogin")}
        </Link>
      </p>
    </>
  );
}

function NewPasswordForm({ t }: { t: (key: string, opts?: Record<string, unknown>) => string }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("auth.errorPasswordLength"));
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    track("auth.password_reset");
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="rounded bg-surface p-5 text-center shadow">
        <p className="text-sm text-text-secondary">{t("auth.newPasswordSaved")}</p>
        <Link href="/login" className="mt-3 inline-block text-sm text-primary hover:underline">
          {t("auth.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
          {t("auth.newPasswordTitle")}
        </h1>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4 rounded bg-surface p-5 shadow" noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-text-secondary">
            {t("auth.password")}
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="btn-pop w-full rounded bg-primary px-4 py-3 text-sm font-bold text-primary-light disabled:opacity-60"
        >
          {t("auth.newPasswordSubmit")}
        </button>
      </form>
    </>
  );
}
