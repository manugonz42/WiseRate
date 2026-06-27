import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

/** Pulsing placeholder block — Home loading state uses these, not spinners. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-sm bg-surface-elevated", className)} />;
}
