import { cn } from "@/lib/cn";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-md py-xs text-footnote font-medium transition-colors duration-quick ease-standard",
        active
          ? "border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.15)] text-primary-light"
          : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}
