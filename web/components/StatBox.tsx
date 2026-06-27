import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StatBoxProps {
  label: string;
  value: ReactNode;
  tone?: "default" | "success" | "error";
}

export function StatBox({ label, value, tone = "default" }: StatBoxProps) {
  return (
    <div className="rounded-xs bg-surface-elevated p-md">
      <div className="text-caption text-text-tertiary">{label}</div>
      <div
        className={cn(
          "mt-xs text-title3 font-bold tabular-nums",
          tone === "success" && "text-success",
          tone === "error" && "text-error",
        )}
      >
        {value}
      </div>
    </div>
  );
}
