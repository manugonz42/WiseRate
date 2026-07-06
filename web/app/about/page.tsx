import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "About",
  description:
    "SulitSend is an independent comparison for sending money from Europe to the Philippines. Here's how the data works and how we're funded.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
        About SulitSend
      </h1>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            What we are
          </h2>
          <p>
            SulitSend is an independent comparison site for sending money from
            Europe to the Philippines. We are{" "}
            <strong className="text-text-primary">not</strong> a bank, payment
            institution, or money transfer operator — we don&apos;t move your
            money. We compare what the providers who do publish, so you can
            see which one gets your recipient the most before you leave our
            site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            How the data works
          </h2>
          <p>
            Quotes are fetched live from each provider&apos;s own pricing
            endpoint where we have one. Where we don&apos;t, we show pricing
            attributed to that provider by Wise&apos;s public comparison API —
            those rows are marked{" "}
            <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
              via Wise
            </span>{" "}
            and aren&apos;t fetched from the provider directly. Quotes are
            cached briefly (a couple of minutes) so the page loads fast
            without hammering provider APIs — refresh to force a new check.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            How ranking works
          </h2>
          <p>
            Rows are sorted by whatever you pick — recipient amount, fee,
            speed, trust, or total cost. The default is best rate: whoever
            gets your recipient the most money, first.{" "}
            <strong className="text-text-primary">
              No provider pays for placement.
            </strong>{" "}
            Some outbound links are or will be affiliate links — see{" "}
            <Link
              href="/how-we-make-money"
              className="text-primary underline"
            >
              how we make money
            </Link>{" "}
            for the full disclosure.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Who runs this
          </h2>
          <p>
            SulitSend is a one-person project. Questions, corrections, or
            provider data that&apos;s gone stale — reach out at{" "}
            <span className="font-mono">{CONTACT_EMAIL}</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
