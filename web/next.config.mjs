/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Wise comparison logos are served from this CDN.
    remotePatterns: [
      { protocol: "https", hostname: "dq8dwmysp7hk1.cloudfront.net" },
    ],
  },
};

export default nextConfig;
