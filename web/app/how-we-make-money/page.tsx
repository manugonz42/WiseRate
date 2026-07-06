import Link from "next/link";

export const metadata = {
  title: "How We Make Money",
  description:
    "SulitSend's affiliate disclosure: how outbound links work, and why they never affect the rate shown or how providers rank.",
  alternates: { canonical: "/how-we-make-money" },
};

export default function HowWeMakeMoneyPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
        How we make money
      </h1>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-text-secondary">
        <section>
          <p>
            SulitSend is free to use and always will be. Some of the
            &quot;Send&quot; and &quot;Get a quote&quot; links on this site
            are, or will be, affiliate links: if you sign up with a provider
            or broker after clicking through, they may pay us a commission.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            What this doesn&apos;t affect
          </h2>
          <p>
            A commission never changes the rate a provider shows you, and it
            never affects ranking — every list on SulitSend is sorted by
            recipient amount, fee, speed, trust, or total cost, whichever you
            pick, never by who pays us. You pay the provider&apos;s standard
            price either way, whether we earn a commission on that click or
            not.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-text-primary">
            Where you&apos;ll see this
          </h2>
          <p>
            Look for the short &quot;we may earn a commission&quot; note next
            to any outbound link — on the{" "}
            <Link href="/compare" className="text-primary underline">
              Compare
            </Link>{" "}
            table, on provider pages, and next to the specialist broker
            listings.
          </p>
        </section>
      </div>
    </main>
  );
}
