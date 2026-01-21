'use server';

import { generateText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type {
  AutoDevLogResult,
  ContentOptimizationResult,
  ASOAuditResult,
  MarketingSentimentResult,
  VibeCheckResult,
  SocialPlatform,
  SentimentLabel,
} from '@/types';

// ============================================================================
// AI PROVIDER CONFIGURATION
// ============================================================================

// Primary: Claude Sonnet 4.5 (best for marketing content and analysis)
const primaryModel = anthropic('claude-sonnet-4-5-20250929');

// Fallback: OpenAI GPT-5
const fallbackModel = openai('gpt-5');

/**
 * Wrapper for AI generation with automatic fallback
 */
async function generateWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await primaryFn();
  } catch (primaryError) {
    console.warn(`${operationName}: Primary AI (Claude) failed, trying fallback (OpenAI)`, primaryError);
    try {
      return await fallbackFn();
    } catch (fallbackError) {
      console.error(`${operationName}: Both AI providers failed`, { primaryError, fallbackError });
      throw new Error(`AI generation failed: ${fallbackError}`);
    }
  }
}

// ============================================================================
// AUTO DEVLOG GENERATION
// ============================================================================

/**
 * Generate a devlog post from source data (commits, updates, etc.)
 */
export async function generateAutoDevLog(params: {
  sourceType: 'github' | 'jira' | 'trello' | 'manual';
  sourceData: Record<string, any>;
  appName: string;
}): Promise<AutoDevLogResult> {
  const { sourceType, sourceData, appName } = params;

  // Build prompt based on source type
  let prompt = `Generate an engaging "Build in Public" devlog post for ${appName}.\n\n`;

  if (sourceType === 'github') {
    const commits = sourceData.commits || [];
    prompt += `Recent commits:\n${commits.map((c: any) => `- ${c.message}`).join('\n')}\n\n`;
  } else if (sourceType === 'jira' || sourceType === 'trello') {
    const tasks = sourceData.tasks || [];
    prompt += `Completed tasks:\n${tasks.map((t: any) => `- ${t.title || t.name}`).join('\n')}\n\n`;
  }

  prompt += `Create a concise, engaging devlog that:
1. Highlights what was accomplished
2. Maintains an authentic, personal tone
3. Shows progress without overselling
4. Includes a suggested milestone name and progress percentage (0-100)
5. Suggests 2-4 relevant tags`;

  const schema = z.object({
    title: z.string().describe('Engaging title for the devlog post'),
    content: z.string().describe('Main content in markdown format (200-500 words)'),
    milestone_progress: z.number().min(0).max(100).describe('Estimated progress percentage'),
    milestone_name: z.string().nullable().describe('Current milestone name (e.g., "Alpha Build", "Beta Launch")'),
    tags: z.array(z.string()).describe('Relevant tags (2-4)'),
  });

  return generateWithFallback(
    async () => {
      const result = await generateText({
        model: primaryModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 2000,
      });
      return result.object;
    },
    async () => {
      const result = await generateText({
        model: fallbackModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 2000,
      });
      return result.object;
    },
    'generateAutoDevLog'
  );
}

// ============================================================================
// CONTENT OPTIMIZATION FOR SOCIAL PLATFORMS
// ============================================================================

/**
 * Optimize content for multiple social platforms
 */
export async function optimizeContentForPlatforms(params: {
  content: string;
  platforms: SocialPlatform[];
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'informative';
}): Promise<ContentOptimizationResult> {
  const { content, platforms, tone = 'casual' } = params;

  const prompt = `Optimize this content for social media platforms.

Original content:
${content}

Target platforms: ${platforms.join(', ')}
Desired tone: ${tone}

Create platform-specific versions that:
1. Respect character limits (Twitter: 280 chars, TikTok: 150 chars)
2. Include platform-appropriate hashtags
3. Maintain the core message
4. Adapt tone for each platform's audience

Also suggest 5-10 relevant hashtags for indie game/app marketing.`;

  const platformSpecificSchema = z.record(
    z.enum(['twitter', 'reddit', 'discord', 'tiktok', 'youtube']),
    z.string().describe('Platform-optimized content')
  );

  const schema = z.object({
    optimized_content: z.string().describe('General optimized version'),
    suggested_hashtags: z.array(z.string()).describe('Relevant hashtags'),
    platform_specific: platformSpecificSchema.describe('Platform-specific versions'),
  });

  return generateWithFallback(
    async () => {
      const result = await generateText({
        model: primaryModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 1500,
      });
      return result.object;
    },
    async () => {
      const result = await generateText({
        model: fallbackModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 1500,
      });
      return result.object;
    },
    'optimizeContentForPlatforms'
  );
}

// ============================================================================
// ASO (APP STORE OPTIMIZATION) AUDIT
// ============================================================================

/**
 * Audit and optimize app store listing
 */
export async function auditAppStoreListing(params: {
  platform: 'ios' | 'android' | 'steam' | 'web';
  currentTitle: string;
  currentDescription: string;
  keywords?: string[];
  targetAudience?: string;
}): Promise<ASOAuditResult> {
  const { platform, currentTitle, currentDescription, keywords = [], targetAudience } = params;

  const prompt = `Perform an App Store Optimization (ASO) audit for ${platform}.

Current Title: ${currentTitle}
Current Description: ${currentDescription}
${keywords.length > 0 ? `Current Keywords: ${keywords.join(', ')}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Provide:
1. Overall ASO score (0-100)
2. 3-5 improved title suggestions
3. Optimized description with better keywords
4. 10-15 keyword recommendations with priority level
5. Specific improvements needed

Focus on discoverability, conversion, and keyword density.`;

  const schema = z.object({
    score: z.number().min(0).max(100).describe('Overall ASO score'),
    title_suggestions: z.array(z.string()).describe('Improved title options'),
    description_optimized: z.string().describe('Optimized description'),
    keyword_recommendations: z.array(z.object({
      keyword: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })).describe('Keyword recommendations'),
    improvements: z.array(z.string()).describe('Specific improvements needed'),
  });

  return generateWithFallback(
    async () => {
      const result = await generateText({
        model: primaryModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 2500,
      });
      return result.object;
    },
    async () => {
      const result = await generateText({
        model: fallbackModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 2500,
      });
      return result.object;
    },
    'auditAppStoreListing'
  );
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

/**
 * Analyze sentiment of a single comment/review
 */
export async function analyzeSentiment(params: {
  text: string;
  context?: string;
}): Promise<MarketingSentimentResult> {
  const { text, context } = params;

  const prompt = `Analyze the sentiment of this ${context || 'comment'}.

Text: "${text}"

Provide:
1. Sentiment score (-1.0 to 1.0, where -1 is most negative, 1 is most positive)
2. Sentiment label (positive, negative, neutral, or mixed)
3. Key themes with their associated sentiments`;

  const schema = z.object({
    sentiment_score: z.number().min(-1).max(1).describe('Sentiment score'),
    sentiment_label: z.enum(['positive', 'negative', 'neutral', 'mixed']).describe('Sentiment classification'),
    themes: z.array(z.object({
      theme: z.string().describe('Key theme identified'),
      sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']).describe('Theme sentiment'),
      confidence: z.number().min(0).max(1).describe('Confidence score'),
    })).describe('Identified themes'),
  });

  return generateWithFallback(
    async () => {
      const result = await generateText({
        model: primaryModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 800,
      });
      return result.object;
    },
    async () => {
      const result = await generateText({
        model: fallbackModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 800,
      });
      return result.object;
    },
    'analyzeSentiment'
  );
}

/**
 * Batch sentiment analysis for multiple texts
 */
export async function analyzeSentimentBatch(params: {
  texts: string[];
  context?: string;
}): Promise<MarketingSentimentResult[]> {
  const { texts, context } = params;

  // Process in parallel with rate limiting
  const batchSize = 10;
  const results: MarketingSentimentResult[] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(text => analyzeSentiment({ text, context }))
    );
    results.push(...batchResults);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

// ============================================================================
// VIBE CHECK (AGGREGATE SENTIMENT ANALYSIS)
// ============================================================================

/**
 * Generate overall "vibe check" from multiple comments
 */
export async function generateVibeCheck(params: {
  sentimentData: {
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    mixed_count: number;
    sample_comments: Array<{ text: string; sentiment: SentimentLabel }>;
  };
  appName: string;
}): Promise<VibeCheckResult> {
  const { sentimentData, appName } = params;
  const { positive_count, negative_count, neutral_count, mixed_count, sample_comments } = sentimentData;

  const total = positive_count + negative_count + neutral_count + mixed_count;

  const prompt = `Analyze the community sentiment for ${appName}.

Sentiment breakdown:
- Positive: ${positive_count} (${((positive_count / total) * 100).toFixed(1)}%)
- Negative: ${negative_count} (${((negative_count / total) * 100).toFixed(1)}%)
- Neutral: ${neutral_count} (${((neutral_count / total) * 100).toFixed(1)}%)
- Mixed: ${mixed_count} (${((mixed_count / total) * 100).toFixed(1)}%)

Sample comments:
${sample_comments.slice(0, 10).map(c => `[${c.sentiment}] "${c.text}"`).join('\n')}

Provide:
1. Overall vibe (positive, negative, neutral, or mixed)
2. Plain English summary (2-3 sentences)
3. Top 3-5 positive themes people love
4. Top 3-5 negative themes causing concerns
5. Actionable recommendations for the developer`;

  const schema = z.object({
    overall_vibe: z.enum(['positive', 'negative', 'neutral', 'mixed']).describe('Overall community vibe'),
    vibe_summary: z.string().describe('Plain English summary'),
    top_positive_themes: z.array(z.string()).describe('What people love'),
    top_negative_themes: z.array(z.string()).describe('What needs attention'),
    recommendations: z.array(z.string()).describe('Actionable recommendations'),
  });

  return generateWithFallback(
    async () => {
      const result = await generateText({
        model: primaryModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 1500,
      });
      return result.object;
    },
    async () => {
      const result = await generateText({
        model: fallbackModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 1500,
      });
      return result.object;
    },
    'generateVibeCheck'
  );
}

// ============================================================================
// HASHTAG TREND SUGGESTIONS
// ============================================================================

/**
 * Suggest trending hashtags for indie marketing
 */
export async function suggestTrendingHashtags(params: {
  niche: string;
  platform: SocialPlatform;
  currentDate?: string;
}): Promise<{ hashtags: Array<{ tag: string; reason: string }> }> {
  const { niche, platform, currentDate = new Date().toISOString().split('T')[0] } = params;

  const prompt = `Suggest trending hashtags for indie ${niche} marketing on ${platform}.

Current date: ${currentDate}
Consider:
- Platform-specific trending tags
- Indie game/app development community tags
- Timing-based tags (#ScreenshotSaturday, #WishlistWednesday, etc.)
- Niche-specific tags

Provide 8-12 relevant hashtags with brief explanations.`;

  const schema = z.object({
    hashtags: z.array(z.object({
      tag: z.string().describe('Hashtag (without #)'),
      reason: z.string().describe('Why this hashtag is relevant'),
    })).describe('Suggested hashtags'),
  });

  return generateWithFallback(
    async () => {
      const result = await generateText({
        model: primaryModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 1200,
      });
      return result.object;
    },
    async () => {
      const result = await generateText({
        model: fallbackModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 1200,
      });
      return result.object;
    },
    'suggestTrendingHashtags'
  );
}

// ============================================================================
// EMAIL SUBJECT LINE OPTIMIZATION
// ============================================================================

/**
 * Generate optimized email subject lines
 */
export async function optimizeEmailSubject(params: {
  currentSubject: string;
  emailType: 'newsletter' | 'launch' | 'update' | 'promotional';
  targetAudience: string;
}): Promise<{ suggestions: Array<{ subject: string; reason: string; score: number }> }> {
  const { currentSubject, emailType, targetAudience } = params;

  const prompt = `Optimize this email subject line for indie developers/creators.

Current subject: "${currentSubject}"
Email type: ${emailType}
Target audience: ${targetAudience}

Generate 5 improved subject line options that:
1. Have higher open rates (based on marketing best practices)
2. Create urgency without being spammy
3. Are honest and authentic
4. Include power words where appropriate
5. Stay under 60 characters

Score each from 0-100 based on predicted open rate.`;

  const schema = z.object({
    suggestions: z.array(z.object({
      subject: z.string().max(60).describe('Optimized subject line'),
      reason: z.string().describe('Why this works'),
      score: z.number().min(0).max(100).describe('Predicted open rate score'),
    })).describe('Subject line suggestions'),
  });

  return generateWithFallback(
    async () => {
      const result = await generateText({
        model: primaryModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 1500,
      });
      return result.object;
    },
    async () => {
      const result = await generateText({
        model: fallbackModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 1500,
      });
      return result.object;
    },
    'optimizeEmailSubject'
  );
}

// ============================================================================
// PRESS KIT CONTENT GENERATION
// ============================================================================

/**
 * Generate press kit content sections
 */
export async function generatePressKitContent(params: {
  appName: string;
  genre?: string;
  keyFeatures: string[];
  targetAudience?: string;
}): Promise<{
  tagline: string;
  description: string;
  boilerplate: string;
}> {
  const { appName, genre, keyFeatures, targetAudience } = params;

  const prompt = `Generate professional press kit content for ${appName}.

${genre ? `Genre/Category: ${genre}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
Key Features:
${keyFeatures.map(f => `- ${f}`).join('\n')}

Generate:
1. Tagline (5-10 words, catchy and memorable)
2. Description (2-3 paragraphs, engaging and informative)
3. Boilerplate (1 paragraph about the developer/studio)

Write in a professional yet approachable tone suitable for press and media.`;

  const schema = z.object({
    tagline: z.string().describe('Catchy tagline'),
    description: z.string().describe('Full description'),
    boilerplate: z.string().describe('Developer/studio boilerplate'),
  });

  return generateWithFallback(
    async () => {
      const result = await generateText({
        model: primaryModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 2000,
      });
      return result.object;
    },
    async () => {
      const result = await generateText({
        model: fallbackModel,
        prompt,
        output: Output.object({ schema }),
        maxTokens: 2000,
      });
      return result.object;
    },
    'generatePressKitContent'
  );
}
