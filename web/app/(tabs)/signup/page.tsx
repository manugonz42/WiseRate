"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CaretDown, CaretUp } from "@phosphor-icons/react/dist/ssr";
import { signUp } from "@/lib/services/auth";
import { getReferralCapture, type ReferralCapture } from "@/lib/services/persistence";
import { isAdult } from "@/lib/dob";
import { TERMS_VERSION } from "@/lib/legal";
import { track } from "@/lib/analytics";
import ProviderAccounts from "@/components/ProviderAccounts";
import { DateOfBirthField } from "@/components/auth/DateOfBirthField";
import { CountrySelect } from "@/components/auth/CountrySelect";
import type { HeardFrom } from "@/lib/models/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEARD_FROM_OPTIONS: HeardFrom[] = ["search", "friend", "social", "youtube", "other"];

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}

function SignupPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const hasRef = !!searchParams.get("ref");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState(hasRef);
  const [providersUsed, setProvidersUsed] = useState<string[]>([]);
  const [heardFrom, setHeardFrom] = useState<HeardFrom | "">(hasRef ? "friend" : "");
  const [referralInput, setReferralInput] = useState("");
  const [referralCapture, setReferralCapture] = useState<ReferralCapture | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    const stored = getReferralCapture();
    if (stored) {
      setReferralCapture(stored);
      setReferralInput(stored.code);
      setOptionalOpen(true);
    }
  }, []);

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = t("auth.errorRequired");
    if (!lastName.trim()) next.lastName = t("auth.errorRequired");
    if (!EMAIL_RE.test(email.trim())) next.email = t("auth.errorEmail");
    if (password.length < 8) next.password = t("auth.errorPasswordLength");
    if (!birthDate) {
      next.birthDate = t("auth.errorDate");
    } else if (!isAdult(birthDate)) {
      next.birthDate = t("auth.errorAge");
    }
    if (!countryCode) next.countryCode = t("auth.errorCountry");
    if (!termsAccepted) next.terms = t("auth.errorTerms");
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    const trimmedReferral = referralInput.trim().toUpperCase();
    const referralCode = trimmedReferral || undefined;
    const referralCapturedAt = !trimmedReferral
      ? undefined
      : trimmedReferral === referralCapture?.code
        ? referralCapture.at
        : new Date().toISOString();

    const result = await signUp({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate!,
      countryCode: countryCode!,
      emailNotifications,
      termsVersion: TERMS_VERSION,
      providersUsed: providersUsed.length > 0 ? providersUsed : undefined,
      heardFrom: heardFrom || undefined,
      referralCode,
      referralCapturedAt,
    });
    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    track("auth.signup", { heardFrom: heardFrom || undefined });
    if (result.referred) track("referral.attributed");
    setSentTo(email.trim());
  };

  if (sentTo) {
    return (
      <main className="mx-auto min-h-[60dvh] w-full max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold">{t("auth.checkEmailTitle")}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("auth.checkEmailDesc", { email: sentTo })}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
          {t("auth.signupTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">{t("auth.signupSubtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded bg-surface p-5 shadow" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("auth.firstName")} error={errors.firstName}>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={60}
              className={inputClass(!!errors.firstName)}
            />
          </Field>
          <Field label={t("auth.lastName")} error={errors.lastName}>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={60}
              className={inputClass(!!errors.lastName)}
            />
          </Field>
        </div>

        <Field label={t("auth.email")} error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass(!!errors.email)}
          />
        </Field>

        <Field label={t("auth.password")} error={errors.password} hint={t("auth.passwordHint")}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass(!!errors.password)}
          />
        </Field>

        <DateOfBirthField
          label={t("auth.birthDate")}
          value={birthDate}
          onChange={setBirthDate}
          error={errors.birthDate}
        />

        <CountrySelect
          label={t("auth.country")}
          value={countryCode}
          onChange={setCountryCode}
          error={errors.countryCode}
        />

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span className="text-sm text-text-secondary">{t("auth.emailNotifications")}</span>
        </label>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
            aria-invalid={!!errors.terms}
          />
          <span className="text-sm text-text-secondary">
            {t("auth.termsPrefix")}{" "}
            <Link href="/terms" target="_blank" className="text-primary hover:underline">
              {t("footer.terms")}
            </Link>{" "}
            {t("auth.termsAnd")}{" "}
            <Link href="/privacy" target="_blank" className="text-primary hover:underline">
              {t("footer.privacy")}
            </Link>
          </span>
        </label>
        {errors.terms ? <p className="text-xs font-medium text-error">{errors.terms}</p> : null}

        <div className="rounded border border-border">
          <button
            type="button"
            onClick={() => setOptionalOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-bold text-text-secondary"
          >
            {t("auth.optionalSection")}
            {optionalOpen ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
          </button>
          {optionalOpen ? (
            <div className="space-y-4 border-t border-border p-3">
              <p className="text-xs text-text-tertiary">{t("auth.optionalSectionDesc")}</p>
              <div>
                <label htmlFor="referralCode" className="mb-1 block text-sm font-bold text-text-secondary">
                  {t("auth.referralCodeLabel")}
                </label>
                <input
                  id="referralCode"
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  placeholder={t("auth.referralCodePlaceholder")}
                  maxLength={8}
                  className={inputClass(false)}
                />
              </div>
              <ProviderAccounts label={t("auth.providersUsedLabel")} onChange={setProvidersUsed} />
              <div>
                <label htmlFor="heardFrom" className="mb-1 block text-sm font-bold text-text-secondary">
                  {t("auth.heardFrom")}
                </label>
                <select
                  id="heardFrom"
                  value={heardFrom}
                  onChange={(e) => setHeardFrom(e.target.value as HeardFrom | "")}
                  className={inputClass(false)}
                >
                  <option value="">{t("auth.heardFromPlaceholder")}</option>
                  {HEARD_FROM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(`auth.heardFrom${opt[0].toUpperCase()}${opt.slice(1)}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </div>

        {submitError ? <p className="text-xs font-medium text-error">{submitError}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="btn-pop w-full rounded bg-primary px-4 py-3 text-sm font-bold text-primary-light disabled:opacity-60"
        >
          {submitting ? t("auth.submitting") : t("auth.submit")}
        </button>

        <p className="text-center text-sm text-text-secondary">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("auth.logIn")}
          </Link>
        </p>
      </form>
    </main>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full rounded border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
    hasError ? "border-error" : "border-border"
  }`;
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-text-secondary">{label}</span>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-text-tertiary">{hint}</p>
      ) : null}
    </label>
  );
}
