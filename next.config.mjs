/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/film-festival", destination: "/film-festival/index.html" },
      { source: "/film-festival/", destination: "/film-festival/index.html" },
      { source: "/last-call", destination: "/last-call/index.html" },
      { source: "/last-call/", destination: "/last-call/index.html" },
    ];
  },
  images: {
    // モデル写真は外部URL（Instagram CDN / Supabase Storage 等）を許可
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
