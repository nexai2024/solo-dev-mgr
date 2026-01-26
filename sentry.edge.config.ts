import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Edge Runtime Configuration
 *
 * Captures errors that occur in Edge Runtime (middleware, edge functions, etc.)
 */

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Environment (development, staging, production)
  environment: process.env.NODE_ENV || "development",

  // Release version for tracking
  release: "solo-dev-mgr@0.1.0",

  // Performance Monitoring: Disabled per plan requirements (errors only)
  tracesSampleRate: 0,

  // Debug mode in development only
  debug: process.env.NODE_ENV === "development",

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
