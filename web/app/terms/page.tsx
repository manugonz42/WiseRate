// DRAFT — human/legal review required before launch (ROADMAP Phase 1)
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Terms of Use",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      {/* DRAFT — human/legal review required before launch (ROADMAP Phase 1) */}
      <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
        Terms of Use
      </h1>
      <p className="mt-2 text-xs text-text-tertiary">
        Last updated: July 3, 2026
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            No financial advice
          </h2>
          <p>
            SulitSend is an independent comparison tool, not a bank, payment
            institution, or money transfer operator, and nothing on this site
            is financial advice. We don&apos;t move your money — the transfer
            happens on the provider&apos;s own site once you click through.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Rates are informational
          </h2>
          <p>
            Rates, fees, and delivery estimates shown here are informational
            and can differ from what you&apos;re quoted on the provider&apos;s
            own site at the time you transact — market rates move constantly
            and providers may apply promotions or conditions we don&apos;t
            see. Always confirm the final rate and fee with the provider
            before sending.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            No warranty
          </h2>
          <p>
            We make a good-faith effort to keep provider data accurate but
            give no warranty, express or implied, as to its accuracy,
            completeness, or fitness for a particular purpose. Use of this
            site is at your own risk.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Limitation of liability
          </h2>
          <p>
            To the fullest extent permitted by law, SulitSend is not liable
            for any loss or damage arising from your use of this site or any
            decision made based on the information shown here, including
            losses arising from a transfer made with a third-party provider.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Governing law
          </h2>
          <p>
            These terms are governed by the laws of Spain, without regard to
            conflict-of-law principles.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Contact
          </h2>
          <p>
            Questions about these terms:{" "}
            <span className="font-mono">{CONTACT_EMAIL}</span>. See also our{" "}
            <Link href="/privacy" className="text-primary underline">
              privacy policy
            </Link>{" "}
            and{" "}
            <Link
              href="/how-we-make-money"
              className="text-primary underline"
            >
              affiliate disclosure
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
