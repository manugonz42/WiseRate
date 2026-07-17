"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { UserCircle } from "@phosphor-icons/react/dist/ssr";
import { getProfile, getSession, onAuthStateChange } from "@/lib/services/auth";

// Header entry point for accounts (T35) — person-circle icon, avatar
// initials once logged in. Same two header spots as SettingsButton.
export function AccountButton() {
  const { t } = useTranslation();
  const [initials, setInitials] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const session = await getSession();
      if (!session) {
        if (!cancelled) setInitials(null);
        return;
      }
      const profile = await getProfile();
      if (!cancelled) {
        setInitials(profile ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase() : null);
      }
    };

    load();
    const unsubscribe = onAuthStateChange(() => load());
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <Link
      href={initials ? "/account" : "/login"}
      className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-surface-hover transition"
      aria-label={t("auth.myAccount")}
    >
      {initials ? (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-light">
          {initials}
        </span>
      ) : (
        <UserCircle size={20} weight="bold" className="text-text-secondary" />
      )}
    </Link>
  );
}
