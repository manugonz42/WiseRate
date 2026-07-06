/** @type {import('next').NextConfig} */
const nextConfig = {
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
