// DRAFT — human/legal review required before launch (ROADMAP Phase 1)
import Link from "next/link";

export const metadata = {
  title: "Cookie Notice",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      {/* DRAFT — human/legal review required before launch (ROADMAP Phase 1) */}
      <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
        Cookie Notice
      </h1>
      <p className="mt-2 text-xs text-text-tertiary">
        Last updated: July 3, 2026
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-text-secondary">
        <section>
          <p>
            SulitSend is an independent comparison site, not a payment
            institution — we don&apos;t move your money. This page explains
            what we store in your browser and why. See our{" "}
            <Link href="/privacy" className="text-primary underline">
              privacy policy
            </Link>{" "}
            for the fuller picture.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            What we store
          </h2>
          <p className="mb-3">
            SulitSend doesn&apos;t use third-party ad or tracking cookies. We
            use browser local storage for a small set of first-party keys:
          </p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-left uppercase tracking-wide text-text-tertiary">
                <th className="py-2 pr-3 font-medium">Key</th>
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-subtle">
                <td className="py-2 pr-3 font-mono">sulitsend.consent.v1</td>
                <td className="py-2 pr-3">Essential</td>
                <td className="py-2">
                  Remembers your analytics consent choice so we don&apos;t ask
                  again
                </td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="py-2 pr-3 font-mono">sulitsend.alerts.v1</td>
                <td className="py-2 pr-3">Essential</td>
                <td className="py-2">
                  Rate alerts you&apos;ve created — stored locally, never sent
                  to us
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-mono">Product analytics</td>
                <td className="py-2 pr-3">Optional</td>
                <td className="py-2">
                  Anonymous usage events (pages viewed, comparisons run) — only
                  sent if you accept
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Your choice
          </h2>
          <p>
            You can accept or decline analytics from the banner shown on your
            first visit. Declining doesn&apos;t limit any feature of
            SulitSend — it only stops anonymous usage events from being sent.
            Clearing your browser&apos;s local storage resets your choice and
            any saved alerts.
          </p>
        </section>
      </div>
    </main>
  );
}
