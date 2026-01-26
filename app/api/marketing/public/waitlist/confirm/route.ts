import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { withRateLimit, confirmationEndpointLimiter } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

/**
 * Public API: Confirm waitlist email
 * GET /api/marketing/public/waitlist/confirm?token=xxx
 * Rate limit: 3 requests per 60 seconds per IP
 */
async function handleGET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new NextResponse('Missing confirmation token', { status: 400 });
    }

    const supabase = createSupabaseClient();

    // Find subscriber by token
    const { data: subscriber, error } = await supabase
      .from('waitlist_subscribers')
      .select('*')
      .eq('confirmation_token', token)
      .single();

    if (error || !subscriber) {
      return new NextResponse('Invalid or expired confirmation token', { status: 404 });
    }

    if (subscriber.status === 'confirmed') {
      return new NextResponse('Email already confirmed! You can close this tab.', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Update status to confirmed
    await supabase
      .from('waitlist_subscribers')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmation_token: null, // Clear token after use
      })
      .eq('id', subscriber.id);

    // Return success page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Confirmed</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .card {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #667eea;
              margin-bottom: 1rem;
            }
            .checkmark {
              font-size: 4rem;
              color: #10b981;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="checkmark">✓</div>
            <h1>Email Confirmed!</h1>
            <p>Thank you for joining the waitlist. We'll keep you updated!</p>
            <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">
              You can safely close this tab.
            </p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error: any) {
    // Capture error to Sentry with context
    Sentry.captureException(error, {
      tags: { endpoint: 'waitlist-confirm' },
      extra: { token: request.url }
    });

    console.error('Waitlist confirmation error:', error);
    return new NextResponse('Confirmation failed', { status: 500 });
  }
}

// Export rate-limited handler
export const GET = withRateLimit(
  confirmationEndpointLimiter,
  handleGET,
  "Too many confirmation attempts, please wait"
);
