import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { CORRIDORS, getCorridor } from "@/lib/data/corridors";
import { PROVIDERS } from "@/lib/data/providers";
import { getAggregatedQuotes } from "@/lib/services/quotes";
import { SITE_URL } from "@/lib/site";
import type { TransferQuote } from "@/lib/models/types";

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return CORRIDORS.map((c) => ({ corridor: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ corridor: string }>;
}): Promise<Metadata> {
  const { corridor: slug } = await params;
  const corridor = getCorridor(slug);
  if (!corridor) return {};
  return {
    title: corridor.title,
    description: corridor.metaDescription,
    alternates: { canonical: `/send/${corridor.slug}` },
    openGraph: {
      title: corridor.title,
      description: corridor.metaDescription,
      url: `${SITE_URL}/send/${corridor.slug}`,
    },
  };
}

// First ~2 sentences of an editorial description, for the per-provider blurb.
function firstSentences(text: string, n = 2): string {
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.slice(0, n).join(" ");
}

export default async function CorridorPage({
  params,
}: {
  params: Promise<{ corridor: string }>;
}) {
  const { corridor: slug } = await params;
  const corridor = getCorridor(slug);
  if (!corridor) notFound();

  let top: TransferQuote[] = [];
  try {
    const { quotes } = await getAggregatedQuotes(
      corridor.from,
      corridor.to,
      corridor.defaultAmount,
    );
    top = [...quotes].sort((a, b) => b.receiveAmount - a.receiveAmount).slice(0, 5);
  } catch {
    top = [];
  }

  const sendFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: corridor.from,
    maximumFractionDigits: 2,
  });
  const receiveFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: corridor.to,
    maximumFractionDigits: 0,
  });

  const compareSupported = corridor.hasCompareCTA;
  const otherCorridors = CORRIDORS.filter((c) => c.slug !== corridor.slug);
  const breadcrumbLabel = `Send ${corridor.from} to ${corridor.to}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: corridor.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/home` },
      {
        "@type": "ListItem",
        position: 2,
        name: breadcrumbLabel,
        item: `${SITE_URL}/send/${corridor.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <Link
            href="/home"
            className="text-base font-extrabold tracking-tight text-text-primary"
          >
            SulitSend
          </Link>
        </div>
      </header>

      <main className="mx-auto min-h-[100dvh] max-w-4xl px-4 pb-16 pt-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-tertiary">
          <Link href="/home" className="hover:text-text-secondary">
            Home
          </Link>{" "}
          / <span className="text-text-secondary">{breadcrumbLabel}</span>
        </nav>

        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
          {corridor.title}
        </h1>

        <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-text-secondary">
          {corridor.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {top.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold">
              Live comparison for {sendFmt.format(corridor.defaultAmount)}
            </h2>
            <div className="overflow-x-auto rounded bg-surface">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                    <th className="py-2.5 pl-4 pr-3 font-medium">Provider</th>
                    <th className="px-3 py-2.5 text-right font-medium">Rate</th>
                    <th className="px-3 py-2.5 text-right font-medium">Fee</th>
                    <th className="py-2.5 pl-3 pr-4 text-right font-medium">
                      Recipient gets
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((q) => (
                    <tr key={q.id} className="border-b border-border-subtle last:border-0">
                      <td className="py-3 pl-4 pr-3 font-semibold">
                        <Link
                          href={`/provider/${q.providerID}`}
                          className="hover:text-primary hover:underline"
                        >
                          {q.providerName}
                        </Link>
                      </td>
                      <td className="tabular px-3 py-3 text-right text-text-secondary">
                        {q.exchangeRate.toFixed(4)}
                      </td>
                      <td className="tabular px-3 py-3 text-right text-text-secondary">
                        {sendFmt.format(q.fee)}
                      </td>
                      <td className="tabular py-3 pl-3 pr-4 text-right text-[15px] font-bold">
                        {receiveFmt.format(q.receiveAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">
              Snapshot for {sendFmt.format(corridor.defaultAmount)}, refreshed hourly.
            </p>
          </section>
        ) : (
          <section className="mt-8 rounded bg-surface p-5 text-sm text-text-secondary">
            Live pricing is temporarily unavailable.{" "}
            {compareSupported && (
              <Link href="/compare" className="text-primary hover:underline">
                See the live comparison instead
              </Link>
            )}
          </section>
        )}

        {compareSupported && (
          <div className="mt-6">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-light transition active:scale-[0.97]"
            >
              Compare live rates
              <ArrowSquareOut size={14} weight="bold" />
            </Link>
          </div>
        )}

        {top.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-bold">Providers on this corridor</h2>
            <ul className="flex flex-col gap-3">
              {top
                .map((q) => PROVIDERS[q.providerID])
                .filter((p): p is NonNullable<typeof p> => Boolean(p))
                .map((p) => (
                  <li key={p.id} className="rounded bg-surface p-4">
                    <Link
                      href={`/provider/${p.id}`}
                      className="font-semibold hover:text-primary hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-text-secondary">
                      {firstSentences(p.description)}
                    </p>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">Frequently asked questions</h2>
          <div className="flex flex-col gap-4">
            {corridor.faq.map((f) => (
              <div key={f.question} className="rounded bg-surface p-4">
                <h3 className="text-sm font-semibold">{f.question}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {otherCorridors.length > 0 && (
          <section className="mt-10 rounded bg-surface p-4">
            <h2 className="mb-2 text-sm font-semibold text-text-secondary">
              Sending from somewhere else?
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {otherCorridors.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/send/${c.slug}`}
                    className="text-primary hover:underline"
                  >
                    {c.from} → {c.to}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="border-t border-border px-4 py-4 text-center text-xs text-text-tertiary sm:px-6">
        © 2026 SulitSend · Independent comparison site, not a payment
        institution ·{" "}
        <Link href="/privacy" className="underline hover:text-text-secondary">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/cookies" className="underline hover:text-text-secondary">
          Cookies
        </Link>
      </footer>
    </>
  );
}
