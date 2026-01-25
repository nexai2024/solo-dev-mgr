import { z } from 'zod';

// ============================================================================
// DOMAIN 1: AUDIENCE BUILDING
// ============================================================================

// Marketing App validation
export const createMarketingAppSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional().nullable(),
  logo_url: z.string().url('Invalid logo URL').optional().nullable().or(z.literal('')),
  website_url: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
  app_store_url: z.string().url('Invalid App Store URL').optional().nullable().or(z.literal('')),
  play_store_url: z.string().url('Invalid Play Store URL').optional().nullable().or(z.literal('')),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('draft'),
  metadata: z.record(z.any()).default({}),
});

export const updateMarketingAppSchema = createMarketingAppSchema.partial();

// DevLog validation
export const createDevLogSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  content: z.string().min(1, 'Content is required'),
  content_html: z.string().optional().nullable(),
  milestone_progress: z.number().min(0).max(100, 'Progress must be between 0 and 100').default(0),
  milestone_name: z.string().max(200).optional().nullable(),
  is_published: z.boolean().default(false),
  published_at: z.string().datetime().optional().nullable(),
  auto_generated: z.boolean().default(false),
  source_data: z.record(z.any()).optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const updateDevLogSchema = createDevLogSchema.partial().omit({ marketing_app_id: true });

// Social Account validation
export const createSocialAccountSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  platform: z.enum(['twitter', 'reddit', 'discord', 'tiktok', 'youtube']),
  platform_user_id: z.string().min(1, 'Platform user ID is required'),
  platform_username: z.string().min(1, 'Platform username is required'),
  access_token_encrypted: z.string().min(1, 'Access token is required'),
  refresh_token_encrypted: z.string().optional().nullable(),
  token_expires_at: z.string().datetime().optional().nullable(),
  is_active: z.boolean().default(true),
  last_synced_at: z.string().datetime().optional().nullable(),
  metadata: z.record(z.any()).default({}),
});

export const updateSocialAccountSchema = createSocialAccountSchema.partial().omit({ marketing_app_id: true });

// Social Post validation
export const createSocialPostSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  media_urls: z.array(z.string().url()).default([]),
  platforms: z.array(z.enum(['twitter', 'reddit', 'discord', 'tiktok'])).min(1, 'At least one platform is required'),
  platform_specific_content: z.record(z.any()).default({}),
  hashtags: z.array(z.string()).default([]),
  scheduled_for: z.string().datetime('Invalid scheduled time'),
  status: z.enum(['draft', 'scheduled', 'publishing', 'published', 'failed']).default('draft'),
  publish_results: z.record(z.any()).default({}),
  error_message: z.string().optional().nullable(),
});

export const updateSocialPostSchema = createSocialPostSchema.partial().omit({ marketing_app_id: true });

// Hashtag Trend validation
export const createHashtagTrendSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  hashtag: z.string().min(1, 'Hashtag is required').regex(/^#?[\w]+$/, 'Invalid hashtag format'),
  platform: z.enum(['twitter', 'reddit', 'tiktok', 'instagram']),
  trend_score: z.number().min(0).default(0),
  usage_count: z.number().min(0).default(0),
  engagement_rate: z.number().min(0).max(100).default(0),
  is_active: z.boolean().default(true),
  last_checked_at: z.string().datetime().optional().nullable(),
  metadata: z.record(z.any()).default({}),
});

export const updateHashtagTrendSchema = createHashtagTrendSchema.partial().omit({ marketing_app_id: true });

// Waitlist Subscriber validation
export const createWaitlistSubscriberSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  email: z.string().email('Invalid email address'),
  name: z.string().max(200).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  status: z.enum(['pending', 'confirmed', 'unsubscribed', 'bounced']).default('pending'),
  metadata: z.record(z.any()).default({}),
});

export const updateWaitlistSubscriberSchema = createWaitlistSubscriberSchema.partial().omit({ marketing_app_id: true, email: true });

// ASO Keyword validation
export const createASOKeywordSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  keyword: z.string().min(1, 'Keyword is required').max(200),
  platform: z.enum(['ios', 'android', 'steam', 'web']),
  search_volume: z.number().min(0).default(0),
  difficulty_score: z.number().min(0).max(100).default(0),
  current_rank: z.number().min(0).optional().nullable(),
  target_rank: z.number().min(0).optional().nullable(),
  is_tracked: z.boolean().default(true),
  last_checked_at: z.string().datetime().optional().nullable(),
  metadata: z.record(z.any()).default({}),
});

export const updateASOKeywordSchema = createASOKeywordSchema.partial().omit({ marketing_app_id: true });

// ============================================================================
// DOMAIN 2: ENGAGEMENT
// ============================================================================

// Subscriber validation
export const createSubscriberSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  email: z.string().email('Invalid email address'),
  name: z.string().max(200).optional().nullable(),
  status: z.enum(['active', 'unsubscribed', 'bounced', 'complained']).default('active'),
  source: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.any()).default({}),
  subscribed_at: z.string().datetime().default(new Date().toISOString()),
});

export const updateSubscriberSchema = createSubscriberSchema.partial().omit({ marketing_app_id: true, email: true });

// Subscriber Segment validation
export const createSubscriberSegmentSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  filter_rules: z.record(z.any()).refine((rules) => Object.keys(rules).length > 0, {
    message: 'Filter rules cannot be empty',
  }),
  is_dynamic: z.boolean().default(true),
});

export const updateSubscriberSegmentSchema = createSubscriberSegmentSchema.partial().omit({ marketing_app_id: true });

// Email Template validation
export const createEmailTemplateSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  subject_line: z.string().min(1, 'Subject line is required').max(200),
  preview_text: z.string().max(200).optional().nullable(),
  html_content: z.string().min(1, 'HTML content is required'),
  text_content: z.string().optional().nullable(),
  is_default: z.boolean().default(false),
  category: z.string().max(100).optional().nullable(),
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial().omit({ marketing_app_id: true });

// Email Campaign validation
export const createEmailCampaignSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  name: z.string().min(1, 'Name is required').max(200),
  subject_line: z.string().min(1, 'Subject line is required').max(200),
  preview_text: z.string().max(200).optional().nullable(),
  html_content: z.string().min(1, 'HTML content is required'),
  text_content: z.string().optional().nullable(),
  segment_id: z.string().uuid('Invalid segment ID').optional().nullable(),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed']).default('draft'),
  scheduled_for: z.string().datetime().optional().nullable(),
  error_message: z.string().optional().nullable(),
});

export const updateEmailCampaignSchema = createEmailCampaignSchema.partial().omit({ marketing_app_id: true });

// Community Comment validation
export const createCommunityCommentSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  platform: z.enum(['youtube', 'reddit', 'discord', 'twitter']),
  platform_comment_id: z.string().min(1, 'Platform comment ID is required'),
  platform_user_id: z.string().min(1, 'Platform user ID is required'),
  platform_username: z.string().min(1, 'Platform username is required'),
  comment_text: z.string().min(1, 'Comment text is required'),
  parent_comment_id: z.string().optional().nullable(),
  post_url: z.string().url().optional().nullable().or(z.literal('')),
  is_flagged: z.boolean().default(false),
  flagged_reason: z.string().max(500).optional().nullable(),
  metadata: z.record(z.any()).default({}),
  synced_at: z.string().datetime().default(new Date().toISOString()),
});

export const updateCommunityCommentSchema = createCommunityCommentSchema.partial().omit({ marketing_app_id: true, platform_comment_id: true });

// Referral Program validation
const referralProgramBaseSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  reward_type: z.enum(['beta_access', 'discount', 'credits', 'badge', 'custom']),
  reward_value: z.string().max(500).optional().nullable(),
  is_active: z.boolean().default(true),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
});

export const createReferralProgramSchema = referralProgramBaseSchema.refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

export const updateReferralProgramSchema = referralProgramBaseSchema.partial().omit({ marketing_app_id: true });

// Referral Link validation
export const createReferralLinkSchema = z.object({
  referral_program_id: z.string().uuid('Invalid referral program ID'),
  referral_code: z.string().min(4, 'Referral code must be at least 4 characters').max(50).regex(/^[a-zA-Z0-9-_]+$/, 'Invalid referral code format'),
  referrer_email: z.string().email().optional().nullable(),
  referrer_name: z.string().max(200).optional().nullable(),
  metadata: z.record(z.any()).default({}),
});

export const updateReferralLinkSchema = createReferralLinkSchema.partial().omit({ referral_program_id: true, referral_code: true });

// User Generated Content validation
export const createUGCSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  submitter_name: z.string().max(200).optional().nullable(),
  submitter_email: z.string().email().optional().nullable(),
  content_type: z.enum(['image', 'video', 'text', 'audio']),
  content_url: z.string().url('Invalid content URL'),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().nullable().or(z.literal('')),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  moderation_notes: z.string().max(1000).optional().nullable(),
});

export const updateUGCSchema = createUGCSchema.partial().omit({ marketing_app_id: true });

// ============================================================================
// DOMAIN 3: MONETIZATION
// ============================================================================

// Pricing Tier validation
export const createPricingTierSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  price_amount: z.number().min(0, 'Price must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code (e.g., USD)').default('USD'),
  billing_period: z.enum(['one_time', 'monthly', 'yearly', 'lifetime']).optional().nullable(),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  max_purchases: z.number().min(1).optional().nullable(),
  stripe_price_id: z.string().max(200).optional().nullable(),
});

export const updatePricingTierSchema = createPricingTierSchema.partial().omit({ marketing_app_id: true });

// Offer validation
const offerBaseSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  pricing_tier_id: z.string().uuid('Invalid pricing tier ID').optional().nullable(),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  discount_type: z.enum(['percentage', 'fixed_amount']).optional().nullable(),
  discount_value: z.number().min(0).optional().nullable(),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
  max_redemptions: z.number().min(1).optional().nullable(),
  promo_code: z.string().max(50).regex(/^[A-Z0-9-_]+$/, 'Promo code must be uppercase alphanumeric').optional().nullable(),
  is_active: z.boolean().default(true),
});

export const createOfferSchema = offerBaseSchema.refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

export const updateOfferSchema = offerBaseSchema.partial().omit({ marketing_app_id: true });

// Abandoned Cart validation
export const createAbandonedCartSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  pricing_tier_id: z.string().uuid('Invalid pricing tier ID').optional().nullable(),
  visitor_email: z.string().email().optional().nullable(),
  visitor_id: z.string().max(200).optional().nullable(),
  cart_value: z.number().min(0).optional().nullable(),
  abandoned_at: z.string().datetime().default(new Date().toISOString()),
  metadata: z.record(z.any()).default({}),
});

export const updateAbandonedCartSchema = createAbandonedCartSchema.partial().omit({ marketing_app_id: true });

// Creator Contact validation
export const createCreatorContactSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email().optional().nullable(),
  platform: z.enum(['youtube', 'twitch', 'tiktok', 'twitter', 'instagram', 'other']).optional().nullable(),
  platform_username: z.string().max(200).optional().nullable(),
  platform_url: z.string().url().optional().nullable().or(z.literal('')),
  follower_count: z.number().min(0).optional().nullable(),
  avg_views: z.number().min(0).optional().nullable(),
  niche: z.string().max(200).optional().nullable(),
  status: z.enum(['prospect', 'contacted', 'key_sent', 'coverage_received', 'declined']).default('prospect'),
  key_sent_at: z.string().datetime().optional().nullable(),
  key_code: z.string().max(200).optional().nullable(),
  coverage_url: z.string().url().optional().nullable().or(z.literal('')),
  coverage_views: z.number().min(0).optional().nullable(),
  roi_estimate: z.number().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateCreatorContactSchema = createCreatorContactSchema.partial().omit({ marketing_app_id: true });

// Ad Campaign validation
export const createAdCampaignSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  name: z.string().min(1, 'Name is required').max(200),
  platform: z.enum(['google', 'facebook', 'instagram', 'reddit', 'twitter', 'tiktok', 'other']),
  campaign_url: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
  budget_amount: z.number().min(0, 'Budget must be positive'),
});

export const updateAdCampaignSchema = createAdCampaignSchema.partial().omit({ marketing_app_id: true });

// Update ad campaign metrics (separate schema for metric updates)
export const updateAdCampaignMetricsSchema = z.object({
  spent_amount: z.number().min(0).optional(),
  impressions: z.number().min(0).optional(),
  clicks: z.number().min(0).optional(),
  conversions: z.number().min(0).optional(),
  revenue: z.number().min(0).optional(),
  cpc: z.number().min(0).optional().nullable(),
  ctr: z.number().min(0).max(100).optional().nullable(),
  roi: z.number().optional().nullable(),
});

// Merch Asset validation
export const createMerchAssetSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  name: z.string().min(1, 'Name is required').max(200),
  asset_type: z.enum(['sticker', 'tshirt', 'wallpaper', 'banner', 'logo', 'icon', 'other']),
  source_image_url: z.string().url('Invalid source image URL'),
  is_public: z.boolean().default(false),
});

export const updateMerchAssetSchema = createMerchAssetSchema.partial().omit({ marketing_app_id: true });

// ============================================================================
// DOMAIN 4: ANALYTICS
// ============================================================================

// Marketing Metrics validation
export const createMarketingMetricsSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  metric_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  total_subscribers: z.number().min(0).default(0),
  new_subscribers: z.number().min(0).default(0),
  unsubscribers: z.number().min(0).default(0),
  email_sent: z.number().min(0).default(0),
  email_opened: z.number().min(0).default(0),
  email_clicked: z.number().min(0).default(0),
  social_posts: z.number().min(0).default(0),
  social_engagement: z.number().min(0).default(0),
  website_visitors: z.number().min(0).default(0),
  conversions: z.number().min(0).default(0),
  revenue: z.number().min(0).default(0),
  ad_spend: z.number().min(0).default(0),
  roi: z.number().default(0),
});

export const updateMarketingMetricsSchema = createMarketingMetricsSchema.partial().omit({ marketing_app_id: true, metric_date: true });

// LTV Calculation validation
export const createLTVCalculationSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  calculation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  avg_purchase_value: z.number().min(0, 'Average purchase value must be positive'),
  avg_purchase_frequency: z.number().min(0, 'Average purchase frequency must be positive'),
  customer_lifespan_months: z.number().min(1, 'Customer lifespan must be at least 1 month'),
  ltv_estimate: z.number().min(0),
  confidence_level: z.number().min(0).max(100).default(0),
  sample_size: z.number().min(0).optional().nullable(),
  metadata: z.record(z.any()).default({}),
});

export const updateLTVCalculationSchema = createLTVCalculationSchema.partial().omit({ marketing_app_id: true, calculation_date: true });

// Sentiment Analysis validation
export const createSentimentAnalysisSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  analysis_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  total_comments: z.number().min(0).default(0),
  positive_count: z.number().min(0).default(0),
  negative_count: z.number().min(0).default(0),
  neutral_count: z.number().min(0).default(0),
  mixed_count: z.number().min(0).default(0),
  avg_sentiment_score: z.number().min(-1).max(1).optional().nullable(),
  vibe_summary: z.string().max(2000).optional().nullable(),
  top_themes: z.array(z.object({
    theme: z.string(),
    sentiment: z.string(),
    count: z.number().min(0),
  })).default([]),
});

export const updateSentimentAnalysisSchema = createSentimentAnalysisSchema.partial().omit({ marketing_app_id: true, analysis_date: true });

// Press Kit validation
export const mediaAssetSchema = z.object({
  type: z.string().min(1, 'Asset type is required'),
  url: z.string().url('Invalid asset URL'),
  caption: z.string().max(500).optional(),
});

export const createPressKitSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  version: z.string().max(20).default('1.0'),
  title: z.string().min(1, 'Title is required').max(200),
  tagline: z.string().max(200).optional().nullable(),
  description: z.string().min(1, 'Description is required').max(5000),
  developer_name: z.string().max(200).optional().nullable(),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().nullable(),
  platforms: z.array(z.string()).default([]),
  price_info: z.string().max(200).optional().nullable(),
  features: z.array(z.string()).default([]),
  media_assets: z.array(mediaAssetSchema).default([]),
  contact_email: z.string().email().optional().nullable(),
  website_url: z.string().url().optional().nullable().or(z.literal('')),
  press_contact: z.string().max(200).optional().nullable(),
  is_public: z.boolean().default(true),
});

export const updatePressKitSchema = createPressKitSchema.partial().omit({ marketing_app_id: true });

// ============================================================================
// DOMAIN 5: CROSS-PROMO NETWORK
// ============================================================================

// Promo Network Listing validation
export const createPromoNetworkListingSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  is_active: z.boolean().default(true),
  niche: z.string().min(1, 'Niche is required').max(200),
  target_audience: z.string().max(1000).optional().nullable(),
  monthly_active_users: z.number().min(0).optional().nullable(),
  available_promo_slots: z.number().min(1, 'Must have at least 1 promo slot').default(1),
  promo_type: z.array(z.string()).min(1, 'At least one promo type is required').default(['newsletter']),
});

export const updatePromoNetworkListingSchema = createPromoNetworkListingSchema.partial().omit({ marketing_app_id: true });

// Promo Partnership validation
const promoPartnershipBaseSchema = z.object({
  requester_listing_id: z.string().uuid('Invalid requester listing ID'),
  partner_listing_id: z.string().uuid('Invalid partner listing ID'),
  status: z.enum(['pending', 'accepted', 'declined', 'completed', 'cancelled']).default('pending'),
  promo_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().nullable(),
  promo_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const createPromoPartnershipSchema = promoPartnershipBaseSchema.refine((data) => {
  if (data.promo_start_date && data.promo_end_date) {
    return data.promo_start_date < data.promo_end_date;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['promo_end_date'],
}).refine((data) => data.requester_listing_id !== data.partner_listing_id, {
  message: 'Cannot create partnership with yourself',
  path: ['partner_listing_id'],
});

export const updatePromoPartnershipSchema = promoPartnershipBaseSchema.partial().omit({ requester_listing_id: true, partner_listing_id: true });

// ============================================================================
// AI & MARKETING VALIDATION SCHEMAS
// ============================================================================

// Auto DevLog Generation Input
export const autoDevLogGenerationSchema = z.object({
  marketing_app_id: z.string().uuid('Invalid marketing app ID'),
  source_type: z.enum(['github', 'jira', 'trello', 'manual']),
  source_data: z.record(z.any()),
  include_milestone: z.boolean().default(true),
});

// Content Optimization Input
export const contentOptimizationSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000),
  platforms: z.array(z.enum(['twitter', 'reddit', 'discord', 'tiktok'])).min(1, 'At least one platform is required'),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'informative']).optional().default('casual'),
});

// ASO Audit Input
export const asoAuditSchema = z.object({
  platform: z.enum(['ios', 'android', 'steam', 'web']),
  current_title: z.string().min(1, 'Current title is required').max(200),
  current_description: z.string().min(1, 'Current description is required').max(5000),
  keywords: z.array(z.string()).optional().default([]),
  target_audience: z.string().max(500).optional(),
});

// Sentiment Analysis Input
export const sentimentAnalysisInputSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000),
  context: z.string().max(500).optional(),
});

// Batch Sentiment Analysis Input
export const batchSentimentAnalysisSchema = z.object({
  texts: z.array(z.string().min(1).max(5000)).min(1, 'At least one text is required').max(100, 'Maximum 100 texts per batch'),
  include_themes: z.boolean().default(true),
});

// ============================================================================
// PUBLIC API SCHEMAS
// ============================================================================

// Public Waitlist Submission
export const publicWaitlistSubmitSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  metadata: z.record(z.any()).optional().default({}),
});

// Public Referral Click
export const publicReferralClickSchema = z.object({
  referral_code: z.string().min(4).max(50),
});

// Public UGC Submission
export const publicUGCSubmitSchema = z.object({
  submitter_name: z.string().max(200).optional(),
  submitter_email: z.string().email().optional(),
  content_type: z.enum(['image', 'video', 'text', 'audio']),
  content_url: z.string().url('Invalid content URL'),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
});
