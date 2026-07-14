"use client";

import { useEffect, useState } from "react";
import {
  getDefaultAmount,
  setDefaultAmount,
} from "@/lib/services/persistence";

// Shared default-send-amount control (Settings + Onboarding): one place owns
// the read-on-mount, parse/validate and persist rules.
export function DefaultAmountField({ id }: { id: string }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const stored = getDefaultAmount();
    setValue(stored ? String(stored) : "");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    if (next === "" || next === "0") {
      setDefaultAmount(null);
    } else {
      const num = parseInt(next, 10);
      if (!Number.isNaN(num) && num >= 1) {
        setDefaultAmount(num);
      }
    }
  };

  return (
    <input
      id={id}
      type="number"
      value={value}
      onChange={handleChange}
      placeholder="1000"
      className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      min="1"
    />
  );
}
