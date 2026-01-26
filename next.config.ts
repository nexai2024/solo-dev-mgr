import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  // Enable instrumentation for Sentry
  experimental: {
    instrumentationHook: true,
  },
};

// Sentry configuration options
const sentryOptions = {
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  silent: true,

  // Upload source maps to Sentry for better error tracking
  widenClientFileUpload: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically annotates React components with origin information
  reactComponentAnnotation: {
    enabled: true,
  },

  // Disable Sentry during development builds to speed up build times
  disableLogger: true,
};

export default withSentryConfig(nextConfig, sentryOptions);
