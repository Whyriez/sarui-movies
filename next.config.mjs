/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
      },
      {
        protocol: "https",
        hostname: "vidsrc.xyz",
        port: "",
      },
      {
        protocol: "https",
        hostname: "vidlink.pro",
        port: "",
      },
      {
        protocol: "https",
        hostname: "multiembed.mov",
        port: "",
      },
    ],
  },
};

export default nextConfig;
