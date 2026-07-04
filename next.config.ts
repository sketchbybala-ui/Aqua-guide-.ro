import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos are served from a public Supabase Storage bucket.
    // Any *.supabase.co project host is allowed since the project ref
    // varies per environment (local/dev/prod all use different projects).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
