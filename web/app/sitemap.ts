import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PROVIDERS } from "@/lib/data/providers";

const STATIC_ROUTES = [
  "/home",
  "/compare",
  "/analytics",
  "/alerts",
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

  return [...staticEntries, ...providerEntries];
}
