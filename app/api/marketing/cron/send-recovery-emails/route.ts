import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';
import { withRateLimit, cronEndpointLimiter } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const resend = new Resend(process.env.RESEND_API_KEY);

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

/**
 * Cron job to send cart abandonment recovery emails
 * Triggered every hour
 * Rate limit: 10 requests per 60 seconds per IP (secondary protection)
 */
async function handleGET(request: NextRequest) {
  try {
    // Verify cron secret (primary authentication)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseClient();

    // Get abandoned carts from 24 hours ago that haven't had recovery emails sent
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: carts, error } = await supabase
      .from('abandoned_carts')
      .select('*, marketing_apps(name, logo_url), pricing_tiers(name, price_amount, currency)')
      .eq('recovery_email_sent', false)
      .eq('recovered', false)
      .gte('abandoned_at', twoDaysAgo)
      .lte('abandoned_at', oneDayAgo)
      .not('visitor_email', 'is', null)
      .limit(100);

    if (error) throw error;

    let sentCount = 0;

    for (const cart of carts || []) {
      try {
        if (!cart.visitor_email) continue;

        // Send recovery email using Resend
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
          to: cart.visitor_email,
          subject: `Complete your purchase of ${cart.pricing_tiers?.name || 'your order'}`,
          html: `
            <h2>Don't forget to complete your purchase!</h2>
            <p>You left ${cart.pricing_tiers?.name || 'an item'} in your cart.</p>
            <p>Price: ${cart.pricing_tiers?.currency} ${cart.pricing_tiers?.price_amount}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/checkout?cart=${cart.id}">Complete your purchase</a></p>
            <p>If you have any questions, feel free to reply to this email.</p>
          `,
        });

        // Mark recovery email as sent
        await supabase
          .from('abandoned_carts')
          .update({
            recovery_email_sent: true,
            recovery_email_sent_at: new Date().toISOString(),
          })
          .eq('id', cart.id);

        sentCount++;
      } catch (error) {
        console.error(`Failed to send recovery email for cart ${cart.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalCarts: carts?.length || 0,
    });
  } catch (error: any) {
    Sentry.captureException(error, { tags: { endpoint: 'cron-recovery-emails', type: 'cron' } });
    console.error('Send recovery emails cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Export rate-limited handler
export const GET = withRateLimit(
  cronEndpointLimiter,
  handleGET,
  "Rate limit exceeded"
);
