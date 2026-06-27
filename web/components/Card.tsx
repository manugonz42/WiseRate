import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  /** Purple brand gradient (hero card). */
  gradient?: boolean;
  className?: string;
}

export function Card({ children, gradient, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded border border-border p-lg shadow",
        gradient
          ? "bg-[linear-gradient(135deg,var(--primary-dark),var(--primary))]"
          : "bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}
