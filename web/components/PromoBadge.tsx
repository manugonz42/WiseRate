"use client";

import { useTranslation } from "react-i18next";
import type { PromoKind } from "@/lib/models/types";

// One badge for both promo kinds — same labels/colors on Compare and Promos
// (docs/modules/promos.md acceptance criteria).
export function PromoBadge({ kind, title }: { kind: PromoKind; title?: string }) {
  const { t } = useTranslation();
  const referral = kind === "referral";
  return (
    <span
      title={title}
      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        referral ? "bg-accent/15 text-accent" : "bg-success/15 text-success"
      }`}
    >
      {referral ? t("promos.badgeReferral") : t("promos.badgeFirstTransfer")}
    </span>
  );
}
