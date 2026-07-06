import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PROVIDERS } from "@/lib/data/providers";
import { CORRIDORS } from "@/lib/data/corridors";

const STATIC_ROUTES = [
  "/home",
  "/compare",
  "/analytics",
  "/alerts",
  "/about",
  "/how-we-make-money",
  "/terms",
  "/privacy",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
  }));

  const providerEntries: MetadataRoute.Sitemap = Object.keys(PROVIDERS).map(
    (id) => ({
      url: `${SITE_URL}/provider/${id}`,
    })
  );

  const corridorEntries: MetadataRoute.Sitemap = CORRIDORS.map((c) => ({
    url: `${SITE_URL}/send/${c.slug}`,
  }));

  return [...staticEntries, ...providerEntries, ...corridorEntries];
}
