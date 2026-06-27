import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
}

export function Button({ children, variant = "primary", className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "w-full rounded-sm px-lg py-md text-headline font-semibold transition duration-quick ease-standard active:scale-[0.98]",
        variant === "primary"
          ? "bg-primary text-on-primary hover:bg-primary-dark"
          : "bg-surface-elevated text-text-primary hover:bg-surface-hover",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
