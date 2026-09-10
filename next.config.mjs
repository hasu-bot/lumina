/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // モデル写真は外部URL（Instagram CDN / Supabase Storage 等）を許可
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
