import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Client-Side Configuration
 *
 * Captures errors that occur in the browser/client-side code.
 * This includes React component errors, browser API errors, etc.
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

  // Environment (development, staging, production)
  environment: process.env.NODE_ENV || "development",

  // Release version for tracking
  release: "solo-dev-mgr@0.1.0",

  // Performance Monitoring: Disabled per plan requirements (errors only)
  tracesSampleRate: 0,

  // Session Replay: Disabled per plan requirements
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Debug mode in development only
  debug: process.env.NODE_ENV === "development",

  // Enable automatic instrumentation (browser integrations)
  integrations: [
    Sentry.browserTracingIntegration({
      enableInp: false, // Disable performance tracking
    }),
  ],

  // Ignore common browser errors that aren't actionable
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    // Network errors
    "NetworkError",
    "Network request failed",
    // Third-party scripts
    "Script error",
  ],

  // Filter out local development errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Sentry would capture:", hint.originalException || hint.syntheticException);
      return null;
    }

    return event;
  },
});
