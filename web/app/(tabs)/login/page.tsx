"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { signIn } from "@/lib/services/auth";
import { track } from "@/lib/analytics";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    track("auth.login");
    router.push("/account");
  };

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
          {t("auth.loginTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">{t("auth.loginSubtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded bg-surface p-5 shadow" noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-text-secondary">{t("auth.email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-text-secondary">{t("auth.password")}</span>
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
          {submitting ? t("auth.loggingIn") : t("auth.loginSubmit")}
        </button>

        <p className="text-center text-sm">
          <Link href="/reset-password" className="text-primary hover:underline">
            {t("auth.forgotPassword")}
          </Link>
        </p>
        <p className="text-center text-sm text-text-secondary">
          {t("auth.noAccount")}{" "}
          <Link href="/signup" className="text-primary hover:underline">
            {t("auth.signupLink")}
          </Link>
        </p>
      </form>
    </main>
  );
}
