import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { aggregateCommentsFromPlatforms } from '@/lib/actions/marketing-external-apis.actions';
import { analyzeSentiment } from '@/lib/actions/marketing-ai.actions';
import { withRateLimit, cronEndpointLimiter } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

/**
 * Cron job to sync comments from all platforms
 * Triggered every 15 minutes
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

    // Get all active social accounts
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*, marketing_apps(id)')
      .eq('is_active', true);

    if (error) throw error;

    // Group by marketing app
    const appAccounts: Record<string, any[]> = {};
    for (const account of accounts || []) {
      const appId = account.marketing_apps.id;
      if (!appAccounts[appId]) {
        appAccounts[appId] = [];
      }
      appAccounts[appId].push(account);
    }

    let totalSynced = 0;

    // Sync comments for each app
    for (const [appId, appAccountsList] of Object.entries(appAccounts)) {
      try {
        const platforms = appAccountsList.map((acc) => ({
          platform: acc.platform,
          credentials: {
            accessToken: acc.access_token_encrypted,
            accessSecret: acc.refresh_token_encrypted,
            refreshToken: acc.refresh_token_encrypted,
            botToken: acc.metadata?.bot_token,
            apiKey: acc.metadata?.api_key,
          },
          metadata: {
            username: acc.platform_username,
            channelId: acc.metadata?.channel_id,
          },
        }));

        const comments = await aggregateCommentsFromPlatforms({ platforms });

        // Insert new comments
        for (const comment of comments) {
          // Check if comment already exists
          const { data: existing } = await supabase
            .from('community_comments')
            .select('id')
            .eq('platform', comment.platform)
            .eq('platform_comment_id', comment.id)
            .single();

          if (!existing) {
            // Analyze sentiment
            let sentimentScore = null;
            let sentimentLabel = null;

            try {
              const sentiment = await analyzeSentiment({
                text: comment.text,
                context: 'community comment',
              });
              sentimentScore = sentiment.sentiment_score;
              sentimentLabel = sentiment.sentiment_label;
            } catch (error) {
              console.error('Sentiment analysis failed:', error);
            }

            // Insert comment
            await supabase.from('community_comments').insert({
              marketing_app_id: appId,
              platform: comment.platform,
              platform_comment_id: comment.id,
              platform_user_id: comment.authorId,
              platform_username: comment.authorUsername,
              comment_text: comment.text,
              post_url: comment.postUrl,
              sentiment_score: sentimentScore,
              sentiment_label: sentimentLabel,
              synced_at: new Date().toISOString(),
            });

            totalSynced++;
          }
        }
      } catch (error) {
        console.error(`Failed to sync comments for app ${appId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      totalSynced,
      appsProcessed: Object.keys(appAccounts).length,
    });
  } catch (error: any) {
    Sentry.captureException(error, { tags: { endpoint: 'cron-sync-comments', type: 'cron' } });
    console.error('Sync comments cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Export rate-limited handler
export const GET = withRateLimit(
  cronEndpointLimiter,
  handleGET,
  "Rate limit exceeded"
);
