import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // 安靜模式，不印多餘 log
  silent: true,

  // 不在 client bundle 塞太多東西
  disableLogger: true,
});
