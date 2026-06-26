import type { ReactNode } from "react";

type Props = {
  /** Module title, e.g. "Home". */
  title: string;
  /** Path to the spec, e.g. "docs/modules/home.md". */
  spec: string;
  /** Acceptance criteria to render as placeholder rows (from the spec). */
  criteria: ReactNode[];
};

/**
 * Stub screen rendered while a module is being ported off
 * SendRate-Web/index.html. Mirrors the spec's acceptance criteria so the
 * scaffold is self-documenting — replace with the real screen, one PR each.
 */
export function ModulePlaceholder({ title, spec, criteria }: Props) {
  return (
    <section className="flex flex-col gap-[var(--space-xl)] px-[var(--space-xl)] pt-[var(--space-xxxl)]">
      <header className="flex flex-col gap-[var(--space-xs)]">
        <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
        <p className="text-[13px] text-text-tertiary">
          Placeholder · spec: <code>{spec}</code>
        </p>
      </header>
      <ul className="flex flex-col gap-[var(--space-md)]">
        {criteria.map((c, i) => (
          <li
            key={i}
            className="rounded-[var(--radius)] border border-border bg-surface p-[var(--space-lg)] text-[15px] text-text-secondary"
          >
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}
