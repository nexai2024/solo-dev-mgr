"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

/**
 * Global Error Boundary
 *
 * Catches all unhandled errors in the application and displays a user-friendly error page.
 * Automatically sends error details to Sentry for monitoring and debugging.
 *
 * Learn more: https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>

            <p className="mb-6 text-center text-gray-600">
              We've been notified and are working on a fix. Please try again.
            </p>

            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 rounded-md bg-gray-100 p-4">
                <p className="text-sm font-mono text-gray-700 break-words">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={reset}
                className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
              >
                Try again
              </button>

              <Link
                href="/"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Go to homepage
              </Link>
            </div>

            {error.digest && (
              <p className="mt-4 text-center text-xs text-gray-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}