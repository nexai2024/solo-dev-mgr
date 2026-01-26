/**
 * Next.js Instrumentation File
 *
 * This file is used to register instrumentation hooks for the Node.js runtime.
 * It's executed once when the Node.js server starts.
 *
 * Learn more: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry for server-side
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Initialize Sentry for edge runtime
    await import("./sentry.edge.config");
  }
}
