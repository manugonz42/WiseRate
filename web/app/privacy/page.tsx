// DRAFT — human/legal review required before launch (ROADMAP Phase 1)
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      {/* DRAFT — human/legal review required before launch (ROADMAP Phase 1) */}
      <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-text-tertiary">
        Last updated: July 3, 2026
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Who we are
          </h2>
          <p>
            SulitSend is an independent comparison site for international
            money transfers. We are <strong className="text-text-primary">
              not
            </strong>{" "}
            a payment institution, bank, or money transfer operator. We don&apos;t
            move your money — the actual transfer happens on the provider&apos;s
            own site once you click through from SulitSend.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            What we collect
          </h2>
          <p>
            We collect anonymous product analytics events (page views,
            comparisons run, outbound clicks) and your cookie consent choice.
            We don&apos;t require an account to use SulitSend, and we don&apos;t
            collect or store any data about the transfers you make with a
            provider.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Affiliate disclosure
          </h2>
          <p>
            We may earn a commission when you sign up with a provider or
            broker through a SulitSend link. This never affects ranking or
            pricing — we always show each provider&apos;s standard, no-promo
            price alongside any promotional rate, and you pay the same either
            way.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Cookies &amp; local storage
          </h2>
          <p className="mb-3">
            See the full breakdown on our{" "}
            <Link href="/cookies" className="text-primary underline">
              cookie notice
            </Link>
            . In short:
          </p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-left uppercase tracking-wide text-text-tertiary">
                <th className="py-2 pr-3 font-medium">Key</th>
                <th className="py-2 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-subtle">
                <td className="py-2 pr-3 font-mono">sulitsend.consent.v1</td>
                <td className="py-2">Your analytics consent choice</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="py-2 pr-3 font-mono">sulitsend.alerts.v1</td>
                <td className="py-2">Rate alerts you&apos;ve created, kept locally</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-mono">Analytics events</td>
                <td className="py-2">
                  Product usage, only sent once you accept analytics
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Your rights
          </h2>
          <p>
            Under GDPR you have the right to access, correct, or delete any
            personal data we hold, and to withdraw analytics consent at any
            time from the cookie banner. Since we don&apos;t use accounts, most
            of what we hold lives in your own browser&apos;s local storage —
            clearing it removes it. For anything else, contact us at{" "}
            <span className="font-mono">{CONTACT_EMAIL}</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
