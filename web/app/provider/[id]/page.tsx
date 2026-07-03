import type { Metadata } from "next";
import Link from "next/link";
import { CORRIDORS } from "@/lib/data/corridors";
import { PROVIDERS } from "@/lib/data/providers";
import { SITE_URL } from "@/lib/site";
import ProviderDetailClient from "./ProviderDetailClient";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = PROVIDERS[id];

  if (!provider) {
    return {
      title: "Money Transfer Provider",
      robots: { index: false, follow: false },
    };
  }

  const title = `${provider.name} Review — EUR→PHP Fees & Rates`;
  const description = truncate(provider.description, 155);
  return {
    title,
    description,
    alternates: { canonical: `/provider/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/provider/${id}`,
    },
  };
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = PROVIDERS[id];
  const corridor = CORRIDORS.find((c) => c.from === "EUR" && c.to === "PHP");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/home` },
      { "@type": "ListItem", position: 2, name: "Providers", item: `${SITE_URL}/compare` },
      {
        "@type": "ListItem",
        position: 3,
        name: provider?.name ?? id,
        item: `${SITE_URL}/provider/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProviderDetailClient id={id} />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 pb-10 text-center text-sm sm:px-6">
        <Link href="/compare" className="text-primary hover:underline">
          Compare all EUR→PHP providers →
        </Link>
        {corridor && (
          <Link href={`/send/${corridor.slug}`} className="text-primary hover:underline">
            Sending EUR to PHP? See the full guide →
          </Link>
        )}
      </div>
    </>
  );
}
