"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CaretLeft, Copy, ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import { getProfile } from "@/lib/services/auth";
import { track } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site";

interface ReferralStats {
  invitedCount?: number;
  convertedCount?: number;
  pendingMonths?: number;
  confirmedMonths?: number;
}

export default function ReferralPage() {
  const { t } = useTranslation();
  const [code, setCode] = useState<string | null>(null);
  const [invitedCount, setInvitedCount] = useState(0);
  const [convertedCount, setConvertedCount] = useState(0);
  const [pendingMonths, setPendingMonths] = useState(0);
  const [confirmedMonths, setConfirmedMonths] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      getProfile(),
      fetch("/api/referral/stats")
        .then((r) => (r.ok ? (r.json() as Promise<ReferralStats>) : ({} as ReferralStats)))
        .catch(() => ({}) as ReferralStats),
    ]).then(([profile, stats]) => {
      setCode(profile?.referralCode ?? null);
      setInvitedCount(stats.invitedCount ?? 0);
      setConvertedCount(stats.convertedCount ?? 0);
      setPendingMonths(stats.pendingMonths ?? 0);
      setConfirmedMonths(stats.confirmedMonths ?? 0);
      setLoading(false);
    });
  }, []);

  const shareUrl = `${SITE_URL}/?ref=${code ?? ""}`;
  const shareMessage = code ? t("referral.shareMessage", { code, link: shareUrl }) : "";

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      flashCopied();
    } catch {
      // clipboard unavailable — nothing more we can do
    }
  };

  const handleShare = async () => {
    if (!code) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: t("referral.pageTitle"), text: shareMessage, url: shareUrl });
        track("referral.shared", { channel: "native" });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareMessage);
      track("referral.shared", { channel: "clipboard" });
      flashCopied();
    } catch {
      // clipboard unavailable — nothing more we can do
    }
  };

  if (loading) return null;
  if (!code) return null; // middleware redirects unauthenticated /account/* to /login

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-16 pt-8 sm:px-6">
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <CaretLeft size={14} weight="bold" />
        {t("auth.accountTitle")}
      </Link>

      <header className="mb-6">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
          {t("referral.pageTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">{t("referral.pageSubtitle")}</p>
      </header>

      <div className="rounded bg-surface p-5 shadow">
        <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
          {t("auth.accountReferralCode")}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-3xl font-extrabold tracking-[0.2em]">{code}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-xs font-bold text-text-primary transition hover:bg-surface-hover"
          >
            <Copy size={14} weight="bold" />
            {copied ? t("referral.copied") : t("referral.copyCta")}
          </button>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="btn-pop mt-4 flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-2.5 text-sm font-bold text-primary-light"
        >
          <ShareNetwork size={16} weight="bold" />
          {t("referral.shareCta")}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded bg-surface p-4 shadow">
          <p className="text-2xl font-extrabold">{invitedCount}</p>
          <p className="text-xs text-text-tertiary">{t("referral.invitedLabel")}</p>
        </div>
        <div className="rounded bg-surface p-4 shadow">
          <p className="text-2xl font-extrabold">{convertedCount}</p>
          <p className="text-xs text-text-tertiary">{t("referral.convertedLabel")}</p>
        </div>
        <div className="rounded bg-surface p-4 shadow">
          <p className="text-2xl font-extrabold">{confirmedMonths}</p>
          <p className="text-xs text-text-tertiary">{t("referral.rewardsLabel")}</p>
        </div>
        <div className="rounded bg-surface p-4 shadow">
          <p className="text-2xl font-extrabold">{pendingMonths}</p>
          <p className="text-xs text-text-tertiary">{t("referral.monthsPendingLabel")}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setTermsOpen(true)}
        className="mt-4 w-full rounded bg-surface px-4 py-2.5 text-sm font-bold text-text-primary shadow transition hover:bg-surface-hover"
      >
        {t("referral.howItWorksCta")}
      </button>

      {termsOpen ? (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setTermsOpen(false)}
        >
          <div
            className="max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-elevated sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold">{t("referral.howItWorksCta")}</h2>
            {/* DRAFT — pending legal review before launch (docs/plan/T36-referral-attribution.md, docs/plan/T37-referral-rewards.md) */}
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {t("referral.termsBody")}
            </p>
            <button
              type="button"
              onClick={() => setTermsOpen(false)}
              className="mt-5 w-full rounded bg-bg px-4 py-2.5 text-sm font-bold text-text-primary transition hover:bg-surface-hover"
            >
              {t("auth.accountCancel")}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
