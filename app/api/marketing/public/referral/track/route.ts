import { NextResponse } from 'next/server';
import { trackReferralClick } from '@/lib/actions/marketing.actions';

/**
 * Public API: Track referral click
 * GET /api/marketing/public/referral/track?code=xxx
 */
export async function GET(request: Request) {
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
    console.error('Referral tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
