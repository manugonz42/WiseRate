import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Allow the public landing; keep crawlers out of the app surfaces under (tabs).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/home", "/compare", "/analytics", "/alerts", "/profile"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
