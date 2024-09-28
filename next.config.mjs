/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fvceptuovueepqdjmick.supabase.co",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
