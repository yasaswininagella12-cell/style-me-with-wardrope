import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Uploaded wardrobe photos (src/lib/upload.ts -> Cloudinary secure_url)
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "http", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
