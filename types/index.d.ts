export type Recipe = {
  id?: string;
  name: string;
  ingredients: string[];
  instructions: string;
};

export type Comment = {
  id?: string;
  comment: string;
  created_at: string;
  user_id: string;
  recipe_id: string;
};

// App Module Types

export type AppStatus = 'idea' | 'development' | 'staging' | 'production' | 'maintenance' | 'archived';

export type AppCategory = 'web_app' | 'mobile_app' | 'api_backend' | 'desktop_app' | 'cli_tool' | 'other';

export interface App {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  description: string | null;
  status: AppStatus;
  tech_stack: string | null;
  category: AppCategory | null;
  production_url: string | null;
  staging_url: string | null;
  repository_url: string | null;
  documentation_url: string | null;
  monitoring_url: string | null;
  started_date: string | null;
  first_deploy_date: string | null;
  notes: string | null;
  active_users: number;
  monthly_revenue: number;
  current_uptime: number;
  open_issues: number;
}

export type CreateAppInput = Omit<App, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'active_users' | 'monthly_revenue' | 'current_uptime' | 'open_issues'>;

export type UpdateAppInput = Partial<CreateAppInput>;

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentVariable {
  id: string;
  created_at: string;
  updated_at: string;
  app_id: string;
  environment: Environment;
  key_name: string;
  value: string;
  is_sensitive: boolean;
}

export type CreateEnvVarInput = Omit<EnvironmentVariable, 'id' | 'created_at' | 'updated_at'>;

export type UpdateEnvVarInput = Partial<Omit<CreateEnvVarInput, 'app_id'>>;

export interface Deployment {
  id: string;
  created_at: string;
  app_id: string;
  version: string;
  deployed_at: string;
  notes: string | null;
}

export type CreateDeploymentInput = Omit<Deployment, 'id' | 'created_at'>;

export type UpdateDeploymentInput = Partial<Omit<CreateDeploymentInput, 'app_id'>>;

export type RepositoryPlatform = 'github' | 'gitlab' | 'bitbucket' | 'other';

export interface Repository {
  id: string;
  created_at: string;
  app_id: string;
  name: string;
  url: string;
  platform: RepositoryPlatform;
  is_primary: boolean;
}

export type CreateRepositoryInput = Omit<Repository, 'id' | 'created_at'>;

export type UpdateRepositoryInput = Partial<Omit<CreateRepositoryInput, 'app_id'>>;

// Blue Ocean Strategy Module Types

export type AnalysisStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type PainPointSource = 'reddit' | 'producthunt' | 'appstore' | 'playstore' | 'manual';

export type PricingModel = 'Freemium' | 'Subscription' | 'One-time' | 'Free';

export type MarketPosition = 'Leader' | 'Challenger' | 'Niche';

export type FeaturePriority = 'high' | 'medium' | 'low';

export type ActionType = 'eliminate' | 'reduce' | 'raise' | 'create' | 'n/a';

export type ApiSource = 'reddit' | 'producthunt' | 'appstore' | 'playstore' | 'web';

export type PainPointCategory = 'Usability' | 'Pricing' | 'Performance' | 'Features' | 'Support' | 'Other';

// User Profile
export interface UserProfile {
  user_id: string;
  primary_niche: string | null;
  skills: string[];
  interests: string[];
  experience_level: ExperienceLevel;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateUserProfileInput = Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateUserProfileInput = Partial<CreateUserProfileInput>;

// Blue Ocean Analysis
export interface BlueOceanAnalysis {
  id: string;
  user_id: string;
  app_id: string | null;
  name: string;
  description: string | null;
  industry: string | null;
  status: AnalysisStatus;
  created_at: string;
  updated_at: string;
}

export type CreateAnalysisInput = Omit<BlueOceanAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateAnalysisInput = Partial<Omit<CreateAnalysisInput, 'app_id'>>;

// Competitor
export interface CompetitorFeature {
  name: string;
  value: number; // 0-10 scale
}

export interface Competitor {
  id: string;
  analysis_id: string;
  name: string;
  url: string | null;
  description: string | null;
  features: CompetitorFeature[];
  pricing_model: PricingModel | null;
  strengths: string[];
  weaknesses: string[];
  market_position: MarketPosition | null;
  ai_analyzed: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateCompetitorInput = Omit<Competitor, 'id' | 'created_at' | 'updated_at' | 'ai_analyzed'>;
export type UpdateCompetitorInput = Partial<Omit<CreateCompetitorInput, 'analysis_id'>>;

// ERRC Matrix
export interface ERRCFactor {
  factor: string;
  reasoning: string;
}

export interface ERRCMatrix {
  id: string;
  analysis_id: string;
  eliminate: ERRCFactor[];
  reduce: ERRCFactor[];
  raise: ERRCFactor[];
  create: ERRCFactor[];
  template_used: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateERRCMatrixInput = Omit<ERRCMatrix, 'id' | 'created_at' | 'updated_at'>;
export type UpdateERRCMatrixInput = Partial<Omit<CreateERRCMatrixInput, 'analysis_id'>>;

// Strategy Canvas
export interface CompetitorCurve {
  competitor_id: string;
  values: number[]; // Array of 0-10 values
}

export interface StrategyCanvasConfig {
  id: string;
  analysis_id: string;
  factors: string[]; // Array of factor names
  your_curve: number[]; // Array of 0-10 values matching factors
  competitor_curves: CompetitorCurve[];
  industry_baseline: number[] | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export type CreateStrategyCanvasInput = Omit<StrategyCanvasConfig, 'id' | 'created_at' | 'updated_at' | 'version'>;
export type UpdateStrategyCanvasInput = Partial<Omit<CreateStrategyCanvasInput, 'analysis_id'>>;

// Pain Point
export interface PainPoint {
  id: string;
  analysis_id: string;
  source: PainPointSource;
  source_url: string | null;
  content: string;
  sentiment_score: number | null; // -1.0 to 1.0
  category: PainPointCategory | null;
  frequency: number;
  ai_summary: string | null;
  created_at: string;
}

export type CreatePainPointInput = Omit<PainPoint, 'id' | 'created_at' | 'sentiment_score' | 'category' | 'ai_summary' | 'frequency'>;

export interface PainPointFilters {
  source?: PainPointSource;
  category?: PainPointCategory;
  min_sentiment?: number;
  max_sentiment?: number;
}

// Value Cost Estimate
export interface ValueCostEstimate {
  id: string;
  analysis_id: string;
  feature_name: string;
  estimated_dev_hours: number | null;
  estimated_cost_usd: number | null;
  perceived_value_score: number | null; // 1-10
  differentiation_score: number | null; // 1-10
  priority: FeaturePriority;
  action_type: ActionType | null;
  notes: string | null;
  created_at: string;
}

export type CreateValueEstimateInput = Omit<ValueCostEstimate, 'id' | 'created_at'>;
export type UpdateValueEstimateInput = Partial<Omit<CreateValueEstimateInput, 'analysis_id'>>;

// Implementation Roadmap
export interface RoadmapPhase {
  phase: string;
  features: string[];
  duration: string;
}

export interface SuccessMetric {
  metric: string;
  target: string;
  type: 'blue_ocean' | 'vanity';
}

export interface PivotEntry {
  date: string;
  what_changed: string;
  reason: string;
  impact?: string;
}

export interface ImplementationRoadmap {
  id: string;
  analysis_id: string;
  phases: RoadmapPhase[];
  success_metrics: SuccessMetric[];
  pivot_log: PivotEntry[];
  created_at: string;
  updated_at: string;
}

export type CreateRoadmapInput = Omit<ImplementationRoadmap, 'id' | 'created_at' | 'updated_at'>;
export type UpdateRoadmapInput = Partial<Omit<CreateRoadmapInput, 'analysis_id'>>;

// API Cache
export interface ApiCache {
  id: string;
  cache_key: string;
  api_source: ApiSource;
  query_params: Record<string, any>;
  response_data: any;
  expires_at: string;
  created_at: string;
}

// Discovery Config for Pain Points
export interface DiscoveryConfig {
  reddit?: {
    subreddits: string[];
    keywords: string[];
    limit: number;
  };
  producthunt?: {
    category: string;
    keywords: string[];
  };
  appstore?: {
    ios_app_id?: string;
    android_app_id?: string;
    country: string;
    limit: number;
  };
}

// AI Response Types
export interface SentimentAnalysisResult {
  sentiment_score: number; // -1.0 to 1.0
  category: PainPointCategory;
  summary: string;
}

export interface CompetitorAnalysisResult {
  features: CompetitorFeature[];
  strengths: string[];
  weaknesses: string[];
  market_position: MarketPosition;
}

export interface ERRCSuggestions {
  eliminate: ERRCFactor[];
  reduce: ERRCFactor[];
  raise: ERRCFactor[];
  create: ERRCFactor[];
}

export interface OpportunityDiscovery {
  title: string;
  description: string;
  reasoning: string;
  differentiation_score: number; // 1-10
  fit_score: number; // 1-10
  complexity: 'Low' | 'Medium' | 'High';
}

export interface FeatureCostEstimate {
  estimated_dev_hours: number;
  complexity_score: number; // 1-10
  suggestions: string;
}

export interface WhatIfImpact {
  dev_time_change: number; // hours
  differentiation_score: number; // 1-10
  priority: FeaturePriority;
}

// Analysis with computed fields for dashboard
export interface AnalysisSummary extends BlueOceanAnalysis {
  competitor_count: number;
  pain_point_count: number;
  canvas_exists: boolean;
  errc_exists: boolean;
}

// Server Action Response Types
export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// VANTAGE MARKETING MODULE TYPES
// ============================================================================

// Marketing App Status
export type MarketingAppStatus = 'draft' | 'active' | 'paused' | 'archived';

// Social Platforms
export type SocialPlatform = 'twitter' | 'reddit' | 'discord' | 'tiktok' | 'youtube';

// Social Post Status
export type SocialPostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

// Subscriber Status
export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced' | 'complained';

// Waitlist Status
export type WaitlistStatus = 'pending' | 'confirmed' | 'unsubscribed' | 'bounced';

// Email Campaign Status
export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

// Sentiment Labels
export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed';

// Referral Reward Types
export type ReferralRewardType = 'beta_access' | 'discount' | 'credits' | 'badge' | 'custom';

// UGC Content Types
export type UGCContentType = 'image' | 'video' | 'text' | 'audio';

// UGC Status
export type UGCStatus = 'pending' | 'approved' | 'rejected' | 'featured';

// Billing Periods
export type BillingPeriod = 'one_time' | 'monthly' | 'yearly' | 'lifetime';

// Discount Types
export type DiscountType = 'percentage' | 'fixed_amount';

// Creator Status
export type CreatorStatus = 'prospect' | 'contacted' | 'key_sent' | 'coverage_received' | 'declined';

// Creator Platforms
export type CreatorPlatform = 'youtube' | 'twitch' | 'tiktok' | 'twitter' | 'instagram' | 'other';

// Ad Campaign Platforms
export type AdPlatform = 'google' | 'facebook' | 'instagram' | 'reddit' | 'twitter' | 'tiktok' | 'other';

// Ad Campaign Status
export type AdCampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

// Merch Asset Types
export type MerchAssetType = 'sticker' | 'tshirt' | 'wallpaper' | 'banner' | 'logo' | 'icon' | 'other';

// ASO Platforms
export type ASOPlatform = 'ios' | 'android' | 'steam' | 'web';

// Partnership Status
export type PartnershipStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

// Pain Point Source (Extended for Marketing)
export type MarketingPainPointSource = 'reddit' | 'producthunt' | 'appstore' | 'playstore' | 'manual';

// ============================================================================
// DOMAIN 1: AUDIENCE BUILDING
// ============================================================================

// Marketing App
export interface MarketingApp {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  app_store_url: string | null;
  play_store_url: string | null;
  status: MarketingAppStatus;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateMarketingAppInput = Omit<MarketingApp, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateMarketingAppInput = Partial<Omit<CreateMarketingAppInput, 'metadata'>>;

// DevLog
export interface DevLog {
  id: string;
  marketing_app_id: string;
  title: string;
  content: string;
  content_html: string | null;
  milestone_progress: number;
  milestone_name: string | null;
  is_published: boolean;
  published_at: string | null;
  auto_generated: boolean;
  source_data: Record<string, any> | null;
  tags: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

export type CreateDevLogInput = Omit<DevLog, 'id' | 'created_at' | 'updated_at' | 'view_count'>;
export type UpdateDevLogInput = Partial<Omit<CreateDevLogInput, 'marketing_app_id'>>;

// Social Account
export interface SocialAccount {
  id: string;
  marketing_app_id: string;
  platform: SocialPlatform;
  platform_user_id: string;
  platform_username: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateSocialAccountInput = Omit<SocialAccount, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSocialAccountInput = Partial<Omit<CreateSocialAccountInput, 'marketing_app_id'>>;

// Social Post
export interface SocialPost {
  id: string;
  marketing_app_id: string;
  content: string;
  media_urls: string[];
  platforms: SocialPlatform[];
  platform_specific_content: Record<string, any>;
  hashtags: string[];
  scheduled_for: string;
  status: SocialPostStatus;
  publish_results: Record<string, any>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateSocialPostInput = Omit<SocialPost, 'id' | 'created_at' | 'updated_at' | 'status' | 'publish_results'>;
export type UpdateSocialPostInput = Partial<Omit<CreateSocialPostInput, 'marketing_app_id'>>;

// Hashtag Trend
export interface HashtagTrend {
  id: string;
  marketing_app_id: string;
  hashtag: string;
  platform: SocialPlatform | 'instagram';
  trend_score: number;
  usage_count: number;
  engagement_rate: number;
  is_active: boolean;
  last_checked_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateHashtagTrendInput = Omit<HashtagTrend, 'id' | 'created_at' | 'updated_at'>;
export type UpdateHashtagTrendInput = Partial<Omit<CreateHashtagTrendInput, 'marketing_app_id'>>;

// Waitlist Subscriber
export interface WaitlistSubscriber {
  id: string;
  marketing_app_id: string;
  email: string;
  name: string | null;
  source: string | null;
  status: WaitlistStatus;
  confirmation_token: string | null;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateWaitlistSubscriberInput = Omit<WaitlistSubscriber, 'id' | 'created_at' | 'updated_at' | 'confirmation_token' | 'confirmed_at' | 'unsubscribed_at'>;
export type UpdateWaitlistSubscriberInput = Partial<Omit<CreateWaitlistSubscriberInput, 'marketing_app_id' | 'email'>>;

// ASO Keyword
export interface ASOKeyword {
  id: string;
  marketing_app_id: string;
  keyword: string;
  platform: ASOPlatform;
  search_volume: number;
  difficulty_score: number;
  current_rank: number | null;
  target_rank: number | null;
  is_tracked: boolean;
  last_checked_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateASOKeywordInput = Omit<ASOKeyword, 'id' | 'created_at' | 'updated_at'>;
export type UpdateASOKeywordInput = Partial<Omit<CreateASOKeywordInput, 'marketing_app_id'>>;

// ============================================================================
// DOMAIN 2: ENGAGEMENT
// ============================================================================

// Subscriber
export interface Subscriber {
  id: string;
  marketing_app_id: string;
  email: string;
  name: string | null;
  status: SubscriberStatus;
  source: string | null;
  tags: string[];
  custom_fields: Record<string, any>;
  subscribed_at: string;
  unsubscribed_at: string | null;
  last_email_sent_at: string | null;
  email_open_count: number;
  email_click_count: number;
  created_at: string;
  updated_at: string;
}

export type CreateSubscriberInput = Omit<Subscriber, 'id' | 'created_at' | 'updated_at' | 'email_open_count' | 'email_click_count' | 'last_email_sent_at'>;
export type UpdateSubscriberInput = Partial<Omit<CreateSubscriberInput, 'marketing_app_id' | 'email'>>;

// Subscriber Segment
export interface SubscriberSegment {
  id: string;
  marketing_app_id: string;
  name: string;
  description: string | null;
  filter_rules: Record<string, any>;
  subscriber_count: number;
  is_dynamic: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateSubscriberSegmentInput = Omit<SubscriberSegment, 'id' | 'created_at' | 'updated_at' | 'subscriber_count'>;
export type UpdateSubscriberSegmentInput = Partial<Omit<CreateSubscriberSegmentInput, 'marketing_app_id'>>;

// Email Template
export interface EmailTemplate {
  id: string;
  marketing_app_id: string;
  name: string;
  description: string | null;
  subject_line: string;
  preview_text: string | null;
  html_content: string;
  text_content: string | null;
  is_default: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateEmailTemplateInput = Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>;
export type UpdateEmailTemplateInput = Partial<Omit<CreateEmailTemplateInput, 'marketing_app_id'>>;

// Email Campaign
export interface EmailCampaign {
  id: string;
  marketing_app_id: string;
  name: string;
  subject_line: string;
  preview_text: string | null;
  html_content: string;
  text_content: string | null;
  segment_id: string | null;
  status: EmailCampaignStatus;
  scheduled_for: string | null;
  sent_at: string | null;
  recipients_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateEmailCampaignInput = Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'status' | 'sent_at' | 'recipients_count' | 'opened_count' | 'clicked_count' | 'bounced_count' | 'unsubscribed_count'>;
export type UpdateEmailCampaignInput = Partial<Omit<CreateEmailCampaignInput, 'marketing_app_id'>>;

// Community Comment
export interface CommunityComment {
  id: string;
  marketing_app_id: string;
  platform: SocialPlatform | 'twitter';
  platform_comment_id: string;
  platform_user_id: string;
  platform_username: string;
  comment_text: string;
  parent_comment_id: string | null;
  post_url: string | null;
  sentiment_score: number | null;
  sentiment_label: SentimentLabel | null;
  is_replied: boolean;
  replied_at: string | null;
  is_flagged: boolean;
  flagged_reason: string | null;
  metadata: Record<string, any>;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export type CreateCommunityCommentInput = Omit<CommunityComment, 'id' | 'created_at' | 'updated_at' | 'sentiment_score' | 'sentiment_label' | 'is_replied' | 'replied_at'>;
export type UpdateCommunityCommentInput = Partial<Omit<CreateCommunityCommentInput, 'marketing_app_id' | 'platform_comment_id'>>;

// Referral Program
export interface ReferralProgram {
  id: string;
  marketing_app_id: string;
  name: string;
  description: string | null;
  reward_type: ReferralRewardType;
  reward_value: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  total_referrals: number;
  total_conversions: number;
  created_at: string;
  updated_at: string;
}

export type CreateReferralProgramInput = Omit<ReferralProgram, 'id' | 'created_at' | 'updated_at' | 'total_referrals' | 'total_conversions'>;
export type UpdateReferralProgramInput = Partial<Omit<CreateReferralProgramInput, 'marketing_app_id'>>;

// Referral Link
export interface ReferralLink {
  id: string;
  referral_program_id: string;
  referral_code: string;
  referrer_email: string | null;
  referrer_name: string | null;
  click_count: number;
  conversion_count: number;
  last_clicked_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateReferralLinkInput = Omit<ReferralLink, 'id' | 'created_at' | 'updated_at' | 'click_count' | 'conversion_count' | 'last_clicked_at'>;
export type UpdateReferralLinkInput = Partial<Omit<CreateReferralLinkInput, 'referral_program_id' | 'referral_code'>>;

// User Generated Content
export interface UserGeneratedContent {
  id: string;
  marketing_app_id: string;
  submitter_name: string | null;
  submitter_email: string | null;
  content_type: UGCContentType;
  content_url: string;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  status: UGCStatus;
  is_featured: boolean;
  featured_at: string | null;
  view_count: number;
  reshare_count: number;
  moderation_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateUGCInput = Omit<UserGeneratedContent, 'id' | 'created_at' | 'updated_at' | 'status' | 'is_featured' | 'featured_at' | 'view_count' | 'reshare_count'>;
export type UpdateUGCInput = Partial<Omit<CreateUGCInput, 'marketing_app_id'>>;

// ============================================================================
// DOMAIN 3: MONETIZATION
// ============================================================================

// Pricing Tier
export interface PricingTier {
  id: string;
  marketing_app_id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency: string;
  billing_period: BillingPeriod | null;
  features: string[];
  is_active: boolean;
  max_purchases: number | null;
  current_purchases: number;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export type CreatePricingTierInput = Omit<PricingTier, 'id' | 'created_at' | 'updated_at' | 'current_purchases'>;
export type UpdatePricingTierInput = Partial<Omit<CreatePricingTierInput, 'marketing_app_id'>>;

// Offer
export interface Offer {
  id: string;
  marketing_app_id: string;
  pricing_tier_id: string | null;
  name: string;
  description: string | null;
  discount_type: DiscountType | null;
  discount_value: number | null;
  start_date: string | null;
  end_date: string | null;
  max_redemptions: number | null;
  current_redemptions: number;
  promo_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateOfferInput = Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'current_redemptions'>;
export type UpdateOfferInput = Partial<Omit<CreateOfferInput, 'marketing_app_id'>>;

// Abandoned Cart
export interface AbandonedCart {
  id: string;
  marketing_app_id: string;
  pricing_tier_id: string | null;
  visitor_email: string | null;
  visitor_id: string | null;
  cart_value: number | null;
  abandoned_at: string;
  recovery_email_sent: boolean;
  recovery_email_sent_at: string | null;
  recovered: boolean;
  recovered_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateAbandonedCartInput = Omit<AbandonedCart, 'id' | 'created_at' | 'updated_at' | 'recovery_email_sent' | 'recovery_email_sent_at' | 'recovered' | 'recovered_at'>;
export type UpdateAbandonedCartInput = Partial<Omit<CreateAbandonedCartInput, 'marketing_app_id'>>;

// Creator Contact
export interface CreatorContact {
  id: string;
  marketing_app_id: string;
  name: string;
  email: string | null;
  platform: CreatorPlatform | null;
  platform_username: string | null;
  platform_url: string | null;
  follower_count: number | null;
  avg_views: number | null;
  niche: string | null;
  status: CreatorStatus;
  key_sent_at: string | null;
  key_code: string | null;
  coverage_url: string | null;
  coverage_views: number | null;
  roi_estimate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateCreatorContactInput = Omit<CreatorContact, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCreatorContactInput = Partial<Omit<CreateCreatorContactInput, 'marketing_app_id'>>;

// Ad Campaign
export interface AdCampaign {
  id: string;
  marketing_app_id: string;
  name: string;
  platform: AdPlatform;
  campaign_url: string | null;
  status: AdCampaignStatus;
  start_date: string | null;
  end_date: string | null;
  budget_amount: number;
  spent_amount: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cpc: number | null;
  ctr: number | null;
  roi: number | null;
  created_at: string;
  updated_at: string;
}

export type CreateAdCampaignInput = Omit<AdCampaign, 'id' | 'created_at' | 'updated_at' | 'spent_amount' | 'impressions' | 'clicks' | 'conversions' | 'revenue' | 'cpc' | 'ctr' | 'roi'>;
export type UpdateAdCampaignInput = Partial<Omit<CreateAdCampaignInput, 'marketing_app_id'>>;

// Merch Asset
export interface MerchAsset {
  id: string;
  marketing_app_id: string;
  name: string;
  asset_type: MerchAssetType;
  source_image_url: string;
  generated_variants: Record<string, string>;
  download_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateMerchAssetInput = Omit<MerchAsset, 'id' | 'created_at' | 'updated_at' | 'download_count'>;
export type UpdateMerchAssetInput = Partial<Omit<CreateMerchAssetInput, 'marketing_app_id'>>;

// ============================================================================
// DOMAIN 4: ANALYTICS
// ============================================================================

// Marketing Metrics
export interface MarketingMetrics {
  id: string;
  marketing_app_id: string;
  metric_date: string;
  total_subscribers: number;
  new_subscribers: number;
  unsubscribers: number;
  email_sent: number;
  email_opened: number;
  email_clicked: number;
  social_posts: number;
  social_engagement: number;
  website_visitors: number;
  conversions: number;
  revenue: number;
  ad_spend: number;
  roi: number;
  created_at: string;
  updated_at: string;
}

export type CreateMarketingMetricsInput = Omit<MarketingMetrics, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMarketingMetricsInput = Partial<Omit<CreateMarketingMetricsInput, 'marketing_app_id' | 'metric_date'>>;

// LTV Calculation
export interface LTVCalculation {
  id: string;
  marketing_app_id: string;
  calculation_date: string;
  avg_purchase_value: number;
  avg_purchase_frequency: number;
  customer_lifespan_months: number;
  ltv_estimate: number;
  confidence_level: number;
  sample_size: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateLTVCalculationInput = Omit<LTVCalculation, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLTVCalculationInput = Partial<Omit<CreateLTVCalculationInput, 'marketing_app_id' | 'calculation_date'>>;

// Sentiment Analysis
export interface SentimentAnalysis {
  id: string;
  marketing_app_id: string;
  analysis_date: string;
  total_comments: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  mixed_count: number;
  avg_sentiment_score: number | null;
  vibe_summary: string | null;
  top_themes: Array<{ theme: string; sentiment: string; count: number }>;
  created_at: string;
  updated_at: string;
}

export type CreateSentimentAnalysisInput = Omit<SentimentAnalysis, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSentimentAnalysisInput = Partial<Omit<CreateSentimentAnalysisInput, 'marketing_app_id' | 'analysis_date'>>;

// Press Kit
export interface PressKit {
  id: string;
  marketing_app_id: string;
  version: string;
  title: string;
  tagline: string | null;
  description: string;
  developer_name: string | null;
  release_date: string | null;
  platforms: string[];
  price_info: string | null;
  features: string[];
  media_assets: Array<{ type: string; url: string; caption?: string }>;
  contact_email: string | null;
  website_url: string | null;
  press_contact: string | null;
  html_url: string | null;
  zip_url: string | null;
  is_public: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export type CreatePressKitInput = Omit<PressKit, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'download_count' | 'html_url' | 'zip_url'>;
export type UpdatePressKitInput = Partial<Omit<CreatePressKitInput, 'marketing_app_id'>>;

// ============================================================================
// DOMAIN 5: CROSS-PROMO NETWORK
// ============================================================================

// Promo Network Listing
export interface PromoNetworkListing {
  id: string;
  marketing_app_id: string;
  is_active: boolean;
  niche: string;
  target_audience: string | null;
  monthly_active_users: number | null;
  available_promo_slots: number;
  current_partnerships: number;
  promo_type: string[];
  created_at: string;
  updated_at: string;
}

export type CreatePromoNetworkListingInput = Omit<PromoNetworkListing, 'id' | 'created_at' | 'updated_at' | 'current_partnerships'>;
export type UpdatePromoNetworkListingInput = Partial<Omit<CreatePromoNetworkListingInput, 'marketing_app_id'>>;

// Promo Partnership
export interface PromoPartnership {
  id: string;
  requester_listing_id: string;
  partner_listing_id: string;
  status: PartnershipStatus;
  promo_start_date: string | null;
  promo_end_date: string | null;
  requester_impressions: number;
  partner_impressions: number;
  requester_clicks: number;
  partner_clicks: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CreatePromoPartnershipInput = Omit<PromoPartnership, 'id' | 'created_at' | 'updated_at' | 'requester_impressions' | 'partner_impressions' | 'requester_clicks' | 'partner_clicks'>;
export type UpdatePromoPartnershipInput = Partial<Omit<CreatePromoPartnershipInput, 'requester_listing_id' | 'partner_listing_id'>>;

// ============================================================================
// AI & MARKETING RESPONSE TYPES
// ============================================================================

// AI DevLog Generation
export interface AutoDevLogResult {
  title: string;
  content: string;
  milestone_progress: number;
  milestone_name: string | null;
  tags: string[];
}

// AI Content Optimization
export interface ContentOptimizationResult {
  optimized_content: string;
  suggested_hashtags: string[];
  platform_specific: Record<SocialPlatform, string>;
}

// AI ASO Audit
export interface ASOAuditResult {
  score: number; // 0-100
  title_suggestions: string[];
  description_optimized: string;
  keyword_recommendations: Array<{ keyword: string; priority: 'high' | 'medium' | 'low' }>;
  improvements: string[];
}

// AI Sentiment Analysis Result
export interface MarketingSentimentResult {
  sentiment_score: number; // -1 to 1
  sentiment_label: SentimentLabel;
  themes: Array<{ theme: string; sentiment: SentimentLabel; confidence: number }>;
}

// AI Vibe Check Result
export interface VibeCheckResult {
  overall_vibe: 'positive' | 'negative' | 'neutral' | 'mixed';
  vibe_summary: string;
  top_positive_themes: string[];
  top_negative_themes: string[];
  recommendations: string[];
}
