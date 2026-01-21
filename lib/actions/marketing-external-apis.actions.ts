'use server';

import { TwitterApi } from 'twitter-api-v2';
import snoowrap from 'snoowrap';
import type { SocialPlatform } from '@/types';

// ============================================================================
// TWITTER/X API INTEGRATION
// ============================================================================

/**
 * Initialize Twitter client with user credentials
 */
function getTwitterClient(accessToken: string, accessSecret: string) {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken,
    accessSecret,
  });
}

/**
 * Post to Twitter/X
 */
export async function postToTwitter(params: {
  accessToken: string;
  accessSecret: string;
  content: string;
  mediaUrls?: string[];
}): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const client = getTwitterClient(params.accessToken, params.accessSecret);

    // Upload media if provided
    let mediaIds: string[] = [];
    if (params.mediaUrls && params.mediaUrls.length > 0) {
      for (const url of params.mediaUrls.slice(0, 4)) { // Twitter allows max 4 images
        try {
          const response = await fetch(url);
          const buffer = Buffer.from(await response.arrayBuffer());
          const mediaId = await client.v1.uploadMedia(buffer, { mimeType: 'image/jpeg' });
          mediaIds.push(mediaId);
        } catch (error) {
          console.error('Failed to upload media to Twitter:', error);
        }
      }
    }

    // Post tweet
    const tweet = await client.v2.tweet({
      text: params.content,
      ...(mediaIds.length > 0 && { media: { media_ids: mediaIds } }),
    });

    return {
      success: true,
      postId: tweet.data.id,
    };
  } catch (error: any) {
    console.error('Twitter post failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Twitter',
    };
  }
}

/**
 * Fetch recent comments/mentions from Twitter
 */
export async function fetchTwitterMentions(params: {
  accessToken: string;
  accessSecret: string;
  username: string;
  sinceId?: string;
}): Promise<{
  comments: Array<{
    id: string;
    text: string;
    authorId: string;
    authorUsername: string;
    createdAt: string;
    url: string;
  }>;
  error?: string;
}> {
  try {
    const client = getTwitterClient(params.accessToken, params.accessSecret);

    // Search for mentions
    const mentions = await client.v2.search(`@${params.username}`, {
      max_results: 100,
      ...(params.sinceId && { since_id: params.sinceId }),
      'tweet.fields': ['created_at', 'author_id'],
      expansions: ['author_id'],
    });

    const comments = mentions.data.data?.map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      authorId: tweet.author_id || '',
      authorUsername: mentions.includes?.users?.find(u => u.id === tweet.author_id)?.username || 'unknown',
      createdAt: tweet.created_at || new Date().toISOString(),
      url: `https://twitter.com/${params.username}/status/${tweet.id}`,
    })) || [];

    return { comments };
  } catch (error: any) {
    console.error('Failed to fetch Twitter mentions:', error);
    return {
      comments: [],
      error: error.message || 'Failed to fetch mentions',
    };
  }
}

// ============================================================================
// REDDIT API INTEGRATION
// ============================================================================

/**
 * Initialize Reddit client
 */
function getRedditClient(accessToken: string, refreshToken: string) {
  return new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT!,
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    accessToken,
    refreshToken,
  });
}

/**
 * Post to Reddit
 */
export async function postToReddit(params: {
  accessToken: string;
  refreshToken: string;
  subreddit: string;
  title: string;
  content: string;
  isLink?: boolean;
  url?: string;
}): Promise<{ success: boolean; postId?: string; postUrl?: string; error?: string }> {
  try {
    const reddit = getRedditClient(params.accessToken, params.refreshToken);

    let submission;
    if (params.isLink && params.url) {
      submission = await reddit.getSubreddit(params.subreddit).submitLink({
        title: params.title,
        url: params.url,
      });
    } else {
      submission = await reddit.getSubreddit(params.subreddit).submitSelfpost({
        title: params.title,
        text: params.content,
      });
    }

    return {
      success: true,
      postId: submission.id,
      postUrl: `https://reddit.com${submission.permalink}`,
    };
  } catch (error: any) {
    console.error('Reddit post failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Reddit',
    };
  }
}

/**
 * Fetch comments from Reddit posts
 */
export async function fetchRedditComments(params: {
  accessToken: string;
  refreshToken: string;
  username: string;
  limit?: number;
}): Promise<{
  comments: Array<{
    id: string;
    text: string;
    authorId: string;
    authorUsername: string;
    postUrl: string;
    createdAt: string;
  }>;
  error?: string;
}> {
  try {
    const reddit = getRedditClient(params.accessToken, params.refreshToken);

    // Fetch user's recent submissions
    const user = reddit.getUser(params.username);
    const submissions = await user.getSubmissions({ limit: params.limit || 10 });

    const allComments: Array<any> = [];

    // Fetch comments for each submission
    for (const submission of submissions) {
      const comments = await submission.comments.fetchAll();
      for (const comment of comments) {
        if (comment.author && comment.author.name !== params.username) {
          allComments.push({
            id: comment.id,
            text: comment.body,
            authorId: comment.author.id || comment.author.name,
            authorUsername: comment.author.name,
            postUrl: `https://reddit.com${submission.permalink}`,
            createdAt: new Date(comment.created_utc * 1000).toISOString(),
          });
        }
      }
    }

    return { comments: allComments };
  } catch (error: any) {
    console.error('Failed to fetch Reddit comments:', error);
    return {
      comments: [],
      error: error.message || 'Failed to fetch comments',
    };
  }
}

// ============================================================================
// DISCORD API INTEGRATION
// ============================================================================

/**
 * Post to Discord webhook
 */
export async function postToDiscord(params: {
  webhookUrl: string;
  content: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    image?: { url: string };
  }>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(params.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: params.content,
        embeds: params.embeds || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Discord post failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Discord',
    };
  }
}

/**
 * Fetch Discord messages from a channel (requires bot token)
 */
export async function fetchDiscordMessages(params: {
  botToken: string;
  channelId: string;
  limit?: number;
}): Promise<{
  messages: Array<{
    id: string;
    content: string;
    authorId: string;
    authorUsername: string;
    timestamp: string;
  }>;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${params.channelId}/messages?limit=${params.limit || 100}`,
      {
        headers: {
          Authorization: `Bot ${params.botToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Discord messages: ${response.statusText}`);
    }

    const data = await response.json();

    const messages = data.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      authorId: msg.author.id,
      authorUsername: msg.author.username,
      timestamp: msg.timestamp,
    }));

    return { messages };
  } catch (error: any) {
    console.error('Failed to fetch Discord messages:', error);
    return {
      messages: [],
      error: error.message || 'Failed to fetch messages',
    };
  }
}

// ============================================================================
// TIKTOK API INTEGRATION (Limited - mostly OAuth)
// ============================================================================

/**
 * Post to TikTok (simplified - actual implementation requires OAuth flow)
 */
export async function postToTikTok(params: {
  accessToken: string;
  videoUrl: string;
  caption: string;
}): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    // TikTok API requires video upload flow
    // This is a placeholder - actual implementation would:
    // 1. Initialize upload session
    // 2. Upload video chunks
    // 3. Publish video with caption

    const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: params.caption,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_url: params.videoUrl,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`TikTok post failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      postId: data.data?.publish_id,
    };
  } catch (error: any) {
    console.error('TikTok post failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to TikTok',
    };
  }
}

// ============================================================================
// YOUTUBE API INTEGRATION
// ============================================================================

/**
 * Fetch YouTube comments for a channel
 */
export async function fetchYouTubeComments(params: {
  apiKey: string;
  channelId: string;
  maxResults?: number;
}): Promise<{
  comments: Array<{
    id: string;
    text: string;
    authorId: string;
    authorUsername: string;
    videoId: string;
    videoUrl: string;
    createdAt: string;
  }>;
  error?: string;
}> {
  try {
    // First, get recent videos from channel
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${params.apiKey}&channelId=${params.channelId}&part=snippet&order=date&maxResults=10&type=video`
    );

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch YouTube videos');
    }

    const videosData = await videosResponse.json();
    const allComments: Array<any> = [];

    // Fetch comments for each video
    for (const video of videosData.items || []) {
      const videoId = video.id.videoId;

      const commentsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?key=${params.apiKey}&videoId=${videoId}&part=snippet&maxResults=${params.maxResults || 50}`
      );

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();

        for (const item of commentsData.items || []) {
          const comment = item.snippet.topLevelComment.snippet;
          allComments.push({
            id: item.id,
            text: comment.textDisplay,
            authorId: comment.authorChannelId?.value || '',
            authorUsername: comment.authorDisplayName,
            videoId,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            createdAt: comment.publishedAt,
          });
        }
      }
    }

    return { comments: allComments };
  } catch (error: any) {
    console.error('Failed to fetch YouTube comments:', error);
    return {
      comments: [],
      error: error.message || 'Failed to fetch comments',
    };
  }
}

// ============================================================================
// UNIFIED SOCIAL PUBLISHING
// ============================================================================

/**
 * Publish to multiple platforms at once
 */
export async function publishToMultiplePlatforms(params: {
  platforms: SocialPlatform[];
  content: string;
  platformSpecificContent?: Record<string, string>;
  mediaUrls?: string[];
  credentials: Record<
    string,
    {
      accessToken: string;
      accessSecret?: string;
      refreshToken?: string;
      webhookUrl?: string;
    }
  >;
  metadata?: Record<string, any>;
}): Promise<
  Record<
    SocialPlatform,
    { success: boolean; postId?: string; postUrl?: string; error?: string }
  >
> {
  const results: any = {};

  // Publish to each platform in parallel
  const publishPromises = params.platforms.map(async (platform) => {
    const content = params.platformSpecificContent?.[platform] || params.content;
    const creds = params.credentials[platform];

    if (!creds) {
      results[platform] = { success: false, error: 'Missing credentials' };
      return;
    }

    try {
      switch (platform) {
        case 'twitter':
          results[platform] = await postToTwitter({
            accessToken: creds.accessToken,
            accessSecret: creds.accessSecret!,
            content,
            mediaUrls: params.mediaUrls,
          });
          break;

        case 'reddit':
          // Reddit needs subreddit info from metadata
          const subreddit = params.metadata?.reddit?.subreddit || 'indiegames';
          const title = params.metadata?.reddit?.title || content.slice(0, 300);
          results[platform] = await postToReddit({
            accessToken: creds.accessToken,
            refreshToken: creds.refreshToken!,
            subreddit,
            title,
            content,
          });
          break;

        case 'discord':
          results[platform] = await postToDiscord({
            webhookUrl: creds.webhookUrl!,
            content,
            embeds: params.mediaUrls
              ? params.mediaUrls.map((url) => ({ image: { url } }))
              : undefined,
          });
          break;

        case 'tiktok':
          // TikTok requires video
          if (params.mediaUrls && params.mediaUrls[0]) {
            results[platform] = await postToTikTok({
              accessToken: creds.accessToken,
              videoUrl: params.mediaUrls[0],
              caption: content,
            });
          } else {
            results[platform] = { success: false, error: 'TikTok requires video content' };
          }
          break;

        default:
          results[platform] = { success: false, error: 'Platform not supported' };
      }
    } catch (error: any) {
      results[platform] = { success: false, error: error.message };
    }
  });

  await Promise.all(publishPromises);

  return results;
}

// ============================================================================
// UNIFIED COMMENT AGGREGATION
// ============================================================================

/**
 * Fetch comments from all connected platforms
 */
export async function aggregateCommentsFromPlatforms(params: {
  platforms: Array<{
    platform: SocialPlatform;
    credentials: {
      accessToken: string;
      accessSecret?: string;
      refreshToken?: string;
      botToken?: string;
      apiKey?: string;
    };
    metadata: {
      username?: string;
      channelId?: string;
    };
  }>;
}): Promise<
  Array<{
    platform: SocialPlatform;
    id: string;
    text: string;
    authorId: string;
    authorUsername: string;
    postUrl: string;
    createdAt: string;
  }>
> {
  const allComments: Array<any> = [];

  for (const { platform, credentials, metadata } of params.platforms) {
    try {
      let platformComments: any[] = [];

      switch (platform) {
        case 'twitter':
          if (metadata.username) {
            const result = await fetchTwitterMentions({
              accessToken: credentials.accessToken,
              accessSecret: credentials.accessSecret!,
              username: metadata.username,
            });
            platformComments = result.comments.map((c) => ({ ...c, platform }));
          }
          break;

        case 'reddit':
          if (metadata.username) {
            const result = await fetchRedditComments({
              accessToken: credentials.accessToken,
              refreshToken: credentials.refreshToken!,
              username: metadata.username,
            });
            platformComments = result.comments.map((c) => ({ ...c, platform }));
          }
          break;

        case 'discord':
          if (metadata.channelId) {
            const result = await fetchDiscordMessages({
              botToken: credentials.botToken!,
              channelId: metadata.channelId,
            });
            platformComments = result.messages.map((m) => ({
              ...m,
              platform,
              postUrl: `https://discord.com/channels/${metadata.channelId}/${m.id}`,
              createdAt: m.timestamp,
            }));
          }
          break;

        case 'youtube':
          if (metadata.channelId) {
            const result = await fetchYouTubeComments({
              apiKey: credentials.apiKey!,
              channelId: metadata.channelId,
            });
            platformComments = result.comments.map((c) => ({ ...c, platform }));
          }
          break;
      }

      allComments.push(...platformComments);
    } catch (error) {
      console.error(`Failed to fetch comments from ${platform}:`, error);
    }
  }

  // Sort by creation date (newest first)
  allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return allComments;
}
