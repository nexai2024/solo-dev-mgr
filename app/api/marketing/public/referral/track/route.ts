import { NextRequest, NextResponse } from 'next/server';
import { trackReferralClick } from '@/lib/actions/marketing.actions';
import { withRateLimit, publicEndpointLimiter } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

/**
 * Public API: Track referral click
 * GET /api/marketing/public/referral/track?code=xxx
 * Rate limit: 5 requests per 60 seconds per IP
 */
async function handleGET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const redirectUrl = url.searchParams.get('redirect') || '/';

    if (!code) {
      return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
    }

    // Track the click
    const result = await trackReferralClick(code);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    // Redirect to the specified URL with ref code in cookie
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    response.cookies.set('ref_code', code, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    // Capture error to Sentry with context
    const eventId = Sentry.captureException(error, {
      tags: { endpoint: 'referral-track' },
      extra: { code: request.url }
    });

    console.error('Referral tracking error:', error);
    return NextResponse.json({
      error: error.message,
      errorId: eventId
    }, { status: 500 });
  }
}

// Export rate-limited handler
export const GET = withRateLimit(
  publicEndpointLimiter,
  handleGET,
  "Too many requests, please try again in 1 minute"
);
