import type { HistoricalRate } from "@/lib/models";

interface SparklineProps {
  data: HistoricalRate[];
  height?: number;
}

// Lightweight inline SVG area chart — no charting dependency for the scaffold.
export function Sparkline({ data, height = 120 }: SparklineProps) {
  const width = 320;
  if (data.length < 2) {
    return <div style={{ height }} className="rounded-sm bg-surface" />;
  }

  const rates = data.map((d) => d.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d.rate - min) / span) * (height - 8) - 4;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const rising = rates[rates.length - 1] >= rates[0];
  const stroke = rising ? "var(--success)" : "var(--error)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-[120px] w-full"
      role="img"
      aria-label="EUR to PHP rate trend"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
