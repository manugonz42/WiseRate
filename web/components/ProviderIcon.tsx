// Provider avatar: logo image when we have one, first-letter tile otherwise.
// `shape` covers the two existing treatments: Home's square tiles and
// Compare's circular chips.
type Props = {
  icon?: string | null;
  name: string;
  size: number;
  shape?: "square" | "circle";
};

export function ProviderIcon({ icon, name, size, shape = "square" }: Props) {
  if (!icon) {
    // Direct sources don't ship a logo URL (only the Wise CDN does).
    return (
      <span
        style={{ width: size, height: size }}
        className={`flex shrink-0 items-center justify-center text-primary ${
          shape === "circle"
            ? "rounded-full bg-primary/20 text-xs font-bold"
            : "rounded-sm bg-surface text-sm font-extrabold shadow"
        }`}
        aria-hidden
      >
        {name.charAt(0)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 bg-surface object-contain shadow ${
        shape === "circle" ? "rounded-full" : "rounded-sm"
      }`}
    />
  );
}
