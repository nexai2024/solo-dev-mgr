import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { publicWaitlistSubmitSchema } from '@/lib/validations/marketing';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { withRateLimit, publicEndpointLimiter } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const resend = new Resend(process.env.RESEND_API_KEY);

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

/**
 * Public API: Submit to waitlist
 * POST /api/marketing/public/waitlist
 * Rate limit: 5 requests per 60 seconds per IP
 */
async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get marketing app ID from query params or headers
    const url = new URL(request.url);
    const appId = url.searchParams.get('app_id') || request.headers.get('x-app-id');

    if (!appId) {
      return NextResponse.json(
        { error: 'Missing app_id parameter' },
        { status: 400 }
      );
    }

    // Validate input
    const validated = publicWaitlistSubmitSchema.parse(body);

    const supabase = createSupabaseClient();

    // Verify app exists
    const { data: app } = await supabase
      .from('marketing_apps')
      .select('id, name')
      .eq('id', appId)
      .single();

    if (!app) {
      return NextResponse.json({ error: 'Invalid app_id' }, { status: 404 });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist_subscribers')
      .select('id, status')
      .eq('marketing_app_id', appId)
      .eq('email', validated.email)
      .single();

    if (existing) {
      if (existing.status === 'confirmed') {
        return NextResponse.json(
          { message: 'Already subscribed', alreadySubscribed: true },
          { status: 200 }
        );
      } else if (existing.status === 'pending') {
        return NextResponse.json(
          { message: 'Confirmation email already sent', pending: true },
          { status: 200 }
        );
      }
    }

    // Generate confirmation token
    const confirmationToken = randomBytes(32).toString('hex');

    // Insert waitlist subscriber
    const { data: subscriber, error } = await supabase
      .from('waitlist_subscribers')
      .insert({
        marketing_app_id: appId,
        email: validated.email,
        name: validated.name,
        source: validated.source || 'widget',
        status: 'pending',
        confirmation_token: confirmationToken,
        metadata: validated.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/marketing/public/waitlist/confirm?token=${confirmationToken}`;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
        to: validated.email,
        subject: `Confirm your subscription to ${app.name} waitlist`,
        html: `
          <h2>Thanks for joining the ${app.name} waitlist!</h2>
          <p>Click the link below to confirm your email:</p>
          <p><a href="${confirmationUrl}">Confirm Email</a></p>
          <p>If you didn't sign up for this waitlist, you can safely ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Please check your email to confirm your subscription',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
      },
    });
  } catch (error: any) {
    // Capture error to Sentry with context
    const eventId = Sentry.captureException(error, {
      tags: { endpoint: 'waitlist' },
      extra: { body: await request.json().catch(() => ({})) }
    });

    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to subscribe',
        errorId: eventId
      },
      { status: 500 }
    );
  }
}

// Export rate-limited handler
export const POST = withRateLimit(
  publicEndpointLimiter,
  handlePOST,
  "Too many requests, please try again in 1 minute"
);
