import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { publishToMultiplePlatforms } from '@/lib/actions/marketing-external-apis.actions';
import { withRateLimit, cronEndpointLimiter } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

/**
 * Cron job to publish scheduled social posts
 * Triggered every 5 minutes
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

    // Get all posts scheduled for now or earlier that haven't been published
    const now = new Date().toISOString();
    const { data: posts, error } = await supabase
      .from('social_posts')
      .select('*, marketing_apps(user_id), social_accounts(*)')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(50);

    if (error) throw error;

    const results = [];

    for (const post of posts || []) {
      try {
        // Update status to publishing
        await supabase
          .from('social_posts')
          .update({ status: 'publishing' })
          .eq('id', post.id);

        // Get credentials for each platform
        const credentials: Record<string, any> = {};
        for (const account of post.social_accounts || []) {
          if (post.platforms.includes(account.platform)) {
            credentials[account.platform] = {
              accessToken: account.access_token_encrypted,
              accessSecret: account.refresh_token_encrypted,
              refreshToken: account.refresh_token_encrypted,
            };
          }
        }

        // Publish to platforms
        const publishResults = await publishToMultiplePlatforms({
          platforms: post.platforms,
          content: post.content,
          platformSpecificContent: post.platform_specific_content,
          mediaUrls: post.media_urls,
          credentials,
        });

        // Update post with results
        const allSuccessful = Object.values(publishResults).every((r: any) => r.success);

        await supabase
          .from('social_posts')
          .update({
            status: allSuccessful ? 'published' : 'failed',
            publish_results: publishResults,
            error_message: allSuccessful
              ? null
              : Object.entries(publishResults)
                  .filter(([, r]: any) => !r.success)
                  .map(([platform, r]: any) => `${platform}: ${r.error}`)
                  .join('; '),
          })
          .eq('id', post.id);

        results.push({ id: post.id, success: allSuccessful });
      } catch (error: any) {
        await supabase
          .from('social_posts')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', post.id);

        results.push({ id: post.id, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    // Capture error to Sentry with context
    Sentry.captureException(error, {
      tags: { endpoint: 'cron-publish-posts', type: 'cron' }
    });

    console.error('Publish scheduled posts cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Export rate-limited handler
export const GET = withRateLimit(
  cronEndpointLimiter,
  handleGET,
  "Rate limit exceeded"
);
