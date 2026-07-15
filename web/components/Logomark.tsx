import Image from "next/image";

// Brand mark: the light "Stripe S" tile (public/logomark.png).
// className carries the display size from consumers (e.g. h-8 w-8).
export function Logomark({ className }: { className?: string }) {
  return (
    <Image
      src="/logomark.png"
      alt=""
      aria-hidden
      width={64}
      height={64}
      className={className}
      priority
    />
  );
}
