// Stub screen for tabs not yet ported — keeps navigation functional.
// Ported one-per-PR in docs/MODULES.md order: Comparison → Provider Details → …
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-sm px-xl text-center">
      <div className="text-title2 font-extrabold">{title}</div>
      <p className="text-footnote text-text-secondary">Not yet ported to Next.js.</p>
    </div>
  );
}
