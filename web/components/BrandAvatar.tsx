import { BRAND_HEX, type BrandColor } from "@/lib/models";

interface BrandAvatarProps {
  icon: string;
  color: BrandColor;
  size?: number;
}

export function BrandAvatar({ icon, color, size = 36 }: BrandAvatarProps) {
  return (
    <div
      className="flex items-center justify-center rounded-sm font-bold text-text-primary"
      style={{
        width: size,
        height: size,
        background: BRAND_HEX[color],
        fontSize: size * 0.36,
      }}
    >
      {icon}
    </div>
  );
}
