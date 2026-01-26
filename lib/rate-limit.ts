import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";

/**
 * Rate Limiting Configuration for solo-dev-mgr
 *
 * This module provides Redis-based rate limiting for API endpoints using Upstash.
 * Implements fail-open strategy: if Redis is unavailable, requests are allowed through.
 */

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limit configuration for public endpoints (waitlist, referral tracking)
 * - 5 requests per 60 seconds per IP
 * - Sliding window algorithm for smooth rate limiting
 */
export const publicEndpointLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@ratelimit/public",
});

/**
 * Rate limit configuration for confirmation endpoints (email confirmation)
 * - 3 requests per 60 seconds per IP
 * - Fixed window algorithm (stricter)
 */
export const confirmationEndpointLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, "60 s"),
  analytics: true,
  prefix: "@ratelimit/confirmation",
});

/**
 * Rate limit configuration for cron endpoints
 * - 10 requests per 60 seconds per IP
 * - Fixed window algorithm
 * - Secondary protection layer (Bearer token is primary)
 */
export const cronEndpointLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, "60 s"),
  analytics: true,
  prefix: "@ratelimit/cron",
});

/**
 * Extract IP address from request headers
 * Priority order:
 * 1. x-forwarded-for (Vercel, most proxies)
 * 2. x-real-ip (Nginx)
 * 3. connection.remoteAddress fallback
 * 4. "unknown" if none available
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback - still rate limit even if IP unknown
  return "unknown";
}

/**
 * Rate limit response interface
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

/**
 * Apply rate limiting to a request
 *
 * @param limiter - Configured Ratelimit instance
 * @param identifier - Unique identifier for rate limiting (usually IP address)
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    // Fail open: if Redis is down, log error but allow request
    console.error("[Rate Limit] Redis error, failing open:", error);

    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 60000, // 1 minute from now
    };
  }
}

/**
 * Create a rate-limited API route handler
 *
 * This higher-order function wraps an API route handler with rate limiting.
 *
 * @param limiter - Configured Ratelimit instance
 * @param handler - Original API route handler
 * @param errorMessage - Custom error message for rate limit exceeded
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   publicEndpointLimiter,
 *   async (request: NextRequest) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   "Too many requests, please try again in 1 minute"
 * );
 * ```
 */
export function withRateLimit(
  limiter: Ratelimit,
  handler: (request: NextRequest) => Promise<NextResponse>,
  errorMessage: string = "Rate limit exceeded, please try again later"
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const ip = getClientIp(request);
    const result = await checkRateLimit(limiter, ip);

    // Add rate limit headers to all responses
    const headers = {
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": result.reset.toString(),
    };

    if (!result.success) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: "rate_limit_exceeded",
          message: errorMessage,
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000), // seconds
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Rate limit check passed, execute handler
    const response = await handler(request);

    // Add rate limit headers to successful response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Rate limiter instances for direct use in route handlers
 *
 * Usage examples by endpoint type:
 *
 * Public endpoints (waitlist, referral):
 *   publicEndpointLimiter
 *
 * Confirmation endpoints (email confirm):
 *   confirmationEndpointLimiter
 *
 * Cron endpoints (scheduled jobs):
 *   cronEndpointLimiter
 */
export { redis };
