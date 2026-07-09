"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react/dist/ssr";
import { LanguageSelect } from "@/components/LanguageSelect";
import ProviderAccounts from "@/components/ProviderAccounts";
import {
  getDefaultAmount,
  setDefaultAmount,
} from "@/lib/services/persistence";

const ONBOARDING_FLAG = "sulitsend.onboarded.v1";
const STEPS = 3;

export function Onboarding() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [defaultAmount, setDefaultAmountState] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mounted && typeof window !== "undefined") {
      const hasOnboarded = window.localStorage.getItem(ONBOARDING_FLAG);
      if (!hasOnboarded) {
        setIsOpen(true);
        const stored = getDefaultAmount();
        setDefaultAmountState(stored ? String(stored) : "");
      }
      setMounted(true);
    }
  }, [mounted]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
      if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, input, select, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    window.localStorage.setItem(ONBOARDING_FLAG, "1");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  const handleDefaultAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDefaultAmountState(value);
    if (value === "" || value === "0") {
      setDefaultAmount(null);
    } else {
      const num = parseInt(value, 10);
      if (!Number.isNaN(num) && num >= 1) {
        setDefaultAmount(num);
      }
    }
  };

  if (!isOpen || !mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-2xl bg-surface-elevated p-6 shadow-elevated"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition"
        >
          <X size={20} weight="bold" />
        </button>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                i + 1 === step ? "bg-primary w-6" : "bg-surface-hover"
              }`}
              aria-hidden
            />
          ))}
        </div>

        {/* Step 1: Value proposition */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                {t("onboarding.valueProp")}
              </h2>
              <p className="text-text-secondary mb-4">
                {t("onboarding.valueDesc")}
              </p>
              <div className="rounded-lg bg-surface p-4 border border-border">
                <p className="text-sm text-text-secondary mb-2">
                  {t("onboarding.monetizationLine")}
                </p>
                <Link
                  href="/how-we-make-money"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {t("onboarding.monetizationLink")} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                {t("onboarding.preferences")}
              </h2>
              <p className="text-text-secondary mb-6">
                {t("onboarding.preferencesDesc")}
              </p>

              <div className="space-y-4">
                {/* Language */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">
                    {t("settings.language")}
                  </label>
                  <div className="flex justify-start">
                    <LanguageSelect />
                  </div>
                </div>

                {/* Default amount */}
                <div className="space-y-2">
                  <label
                    htmlFor="onboarding-amount"
                    className="text-sm font-bold text-text-secondary"
                  >
                    {t("settings.defaultAmount")}
                  </label>
                  <input
                    id="onboarding-amount"
                    type="number"
                    value={defaultAmount}
                    onChange={handleDefaultAmountChange}
                    placeholder="1000"
                    className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Promos */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                {t("onboarding.promos")}
              </h2>
              <p className="text-text-secondary mb-6">
                {t("onboarding.promosDesc")}
              </p>

              <ProviderAccounts
                label={t("settings.whichProviders") || "Which providers do you already use?"}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={close}
            className="text-sm font-bold text-text-secondary hover:text-text-primary transition"
          >
            {t("onboarding.skip")}
          </button>

          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 bg-surface hover:bg-surface-hover text-text-primary font-bold text-sm transition"
              >
                <CaretLeft size={16} weight="bold" />
                {t("onboarding.back")}
              </button>
            )}

            {step < STEPS ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 rounded-lg px-4 py-2 bg-primary hover:bg-primary-dark text-primary-light font-bold text-sm transition active:scale-[0.98]"
              >
                {t("onboarding.next")}
                <CaretRight size={16} weight="bold" />
              </button>
            ) : (
              <button
                onClick={close}
                className="rounded-lg px-6 py-2 bg-primary hover:bg-primary-dark text-primary-light font-bold text-sm transition active:scale-[0.98]"
              >
                {t("onboarding.done")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
