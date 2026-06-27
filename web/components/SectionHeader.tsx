interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-md">
      <div className="text-headline font-semibold">{title}</div>
      {subtitle && <div className="text-footnote text-text-secondary">{subtitle}</div>}
    </div>
  );
}
