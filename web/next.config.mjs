/** @type {import('next').NextConfig} */
const nextConfig = {
  // `public/` is not bundled into serverless functions. The OG route reads the
  // logomark off disk, so trace it in explicitly — otherwise the route ENOENTs
  // whenever it renders at runtime instead of at build.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./public/logomark.png"],
  },
  images: {
    // Wise comparison logos are served from this CDN.
    remotePatterns: [
      { protocol: "https", hostname: "dq8dwmysp7hk1.cloudfront.net" },
    ],
  },
  async headers() {
    // Vercel preview deploys must never get indexed — only `production` is public.
    if (process.env.VERCEL_ENV === "production") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
