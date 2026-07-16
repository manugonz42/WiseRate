/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async redirects() {
    return [
      {
        // Stable URL used by the email signature's YouTube button.
        // TODO: point at the channel URL once it exists (video pending upload).
        source: "/youtube",
        destination: "https://www.youtube.com/results?search_query=sulitsend",
        permanent: false,
      },
    ];
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
