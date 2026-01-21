-- ============================================================================
-- VANTAGE MARKETING MODULE - DATABASE MIGRATION
-- ============================================================================
-- Description: Complete schema for marketing automation platform
-- Features: Audience building, engagement, monetization, analytics
-- RLS: All tables have Row Level Security enabled
-- ============================================================================

-- ============================================================================
-- DOMAIN 1: AUDIENCE BUILDING
-- ============================================================================

-- Marketing Apps (extends concept of apps for marketing purposes)
CREATE TABLE IF NOT EXISTS marketing_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    app_store_url TEXT,
    play_store_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marketing_apps_user_id ON marketing_apps(user_id);
CREATE INDEX idx_marketing_apps_status ON marketing_apps(status);

ALTER TABLE marketing_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_apps_user_policy ON marketing_apps
    FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- DevLogs (Build in Public updates)
CREATE TABLE IF NOT EXISTS devlogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT,
    milestone_progress INTEGER DEFAULT 0 CHECK (milestone_progress >= 0 AND milestone_progress <= 100),
    milestone_name TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    auto_generated BOOLEAN NOT NULL DEFAULT false,
    source_data JSONB, -- GitHub commits, Jira updates, etc.
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devlogs_app_id ON devlogs(marketing_app_id);
CREATE INDEX idx_devlogs_published ON devlogs(is_published, published_at DESC);
CREATE INDEX idx_devlogs_tags ON devlogs USING gin(tags);

ALTER TABLE devlogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY devlogs_user_policy ON devlogs
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Social Accounts (Connected platform accounts)
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'reddit', 'discord', 'tiktok', 'youtube')),
    platform_user_id TEXT NOT NULL,
    platform_username TEXT NOT NULL,
    access_token_encrypted TEXT NOT NULL, -- Store encrypted tokens
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(marketing_app_id, platform, platform_user_id)
);

CREATE INDEX idx_social_accounts_app_id ON social_accounts(marketing_app_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_active ON social_accounts(is_active);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY social_accounts_user_policy ON social_accounts
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Social Posts (Scheduled content across platforms)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    platforms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- ['twitter', 'reddit', 'discord', 'tiktok']
    platform_specific_content JSONB DEFAULT '{}'::jsonb, -- Platform-optimized versions
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
    publish_results JSONB DEFAULT '{}'::jsonb, -- Per-platform results
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_posts_app_id ON social_posts(marketing_app_id);
CREATE INDEX idx_social_posts_scheduled ON social_posts(scheduled_for);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_platforms ON social_posts USING gin(platforms);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY social_posts_user_policy ON social_posts
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Hashtag Trends (Tracked hashtags and performance)
CREATE TABLE IF NOT EXISTS hashtag_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    hashtag TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'reddit', 'tiktok', 'instagram')),
    trend_score DECIMAL(10, 2) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_checked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(marketing_app_id, hashtag, platform)
);

CREATE INDEX idx_hashtag_trends_app_id ON hashtag_trends(marketing_app_id);
CREATE INDEX idx_hashtag_trends_platform ON hashtag_trends(platform);
CREATE INDEX idx_hashtag_trends_score ON hashtag_trends(trend_score DESC);

ALTER TABLE hashtag_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY hashtag_trends_user_policy ON hashtag_trends
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Waitlist Subscribers
CREATE TABLE IF NOT EXISTS waitlist_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    source TEXT, -- 'landing_page', 'widget', 'manual'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed', 'bounced')),
    confirmation_token TEXT,
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb, -- UTM params, referrer, custom fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(marketing_app_id, email)
);

CREATE INDEX idx_waitlist_subscribers_app_id ON waitlist_subscribers(marketing_app_id);
CREATE INDEX idx_waitlist_subscribers_status ON waitlist_subscribers(status);
CREATE INDEX idx_waitlist_subscribers_email ON waitlist_subscribers(email);

ALTER TABLE waitlist_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY waitlist_subscribers_user_policy ON waitlist_subscribers
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- ASO Keywords (App Store Optimization keyword tracking)
CREATE TABLE IF NOT EXISTS aso_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'steam', 'web')),
    search_volume INTEGER DEFAULT 0,
    difficulty_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
    current_rank INTEGER,
    target_rank INTEGER,
    is_tracked BOOLEAN NOT NULL DEFAULT true,
    last_checked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(marketing_app_id, keyword, platform)
);

CREATE INDEX idx_aso_keywords_app_id ON aso_keywords(marketing_app_id);
CREATE INDEX idx_aso_keywords_platform ON aso_keywords(platform);
CREATE INDEX idx_aso_keywords_tracked ON aso_keywords(is_tracked);

ALTER TABLE aso_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY aso_keywords_user_policy ON aso_keywords
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- ============================================================================
-- DOMAIN 2: ENGAGEMENT
-- ============================================================================

-- Subscribers (Email list subscribers)
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
    source TEXT, -- 'waitlist', 'manual', 'import', 'api'
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_fields JSONB DEFAULT '{}'::jsonb,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    last_email_sent_at TIMESTAMPTZ,
    email_open_count INTEGER NOT NULL DEFAULT 0,
    email_click_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(marketing_app_id, email)
);

CREATE INDEX idx_subscribers_app_id ON subscribers(marketing_app_id);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_tags ON subscribers USING gin(tags);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscribers_user_policy ON subscribers
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Subscriber Segments (User groupings for targeted emails)
CREATE TABLE IF NOT EXISTS subscriber_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    filter_rules JSONB NOT NULL, -- { "tags": ["beta"], "opened_last_30_days": true }
    subscriber_count INTEGER NOT NULL DEFAULT 0,
    is_dynamic BOOLEAN NOT NULL DEFAULT true, -- Recalculate on each send
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriber_segments_app_id ON subscriber_segments(marketing_app_id);

ALTER TABLE subscriber_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriber_segments_user_policy ON subscriber_segments
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Email Templates (Reusable email templates)
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    subject_line TEXT NOT NULL,
    preview_text TEXT,
    html_content TEXT NOT NULL,
    text_content TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    category TEXT, -- 'newsletter', 'transactional', 'promotional'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_templates_app_id ON email_templates(marketing_app_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_templates_user_policy ON email_templates
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Email Campaigns (Newsletter/email campaigns)
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject_line TEXT NOT NULL,
    preview_text TEXT,
    html_content TEXT NOT NULL,
    text_content TEXT,
    segment_id UUID REFERENCES subscriber_segments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipients_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_campaigns_app_id ON email_campaigns(marketing_app_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_for);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_campaigns_user_policy ON email_campaigns
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Community Comments (Aggregated comments from all platforms)
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'reddit', 'discord', 'twitter')),
    platform_comment_id TEXT NOT NULL,
    platform_user_id TEXT NOT NULL,
    platform_username TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    parent_comment_id TEXT, -- For threaded comments
    post_url TEXT,
    sentiment_score DECIMAL(5, 2), -- -1 to 1
    sentiment_label TEXT CHECK (sentiment_label IN ('positive', 'negative', 'neutral', 'mixed')),
    is_replied BOOLEAN NOT NULL DEFAULT false,
    replied_at TIMESTAMPTZ,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    flagged_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform, platform_comment_id)
);

CREATE INDEX idx_community_comments_app_id ON community_comments(marketing_app_id);
CREATE INDEX idx_community_comments_platform ON community_comments(platform);
CREATE INDEX idx_community_comments_sentiment ON community_comments(sentiment_label);
CREATE INDEX idx_community_comments_replied ON community_comments(is_replied);
CREATE INDEX idx_community_comments_synced ON community_comments(synced_at DESC);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_comments_user_policy ON community_comments
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Referral Programs (Active referral campaigns)
CREATE TABLE IF NOT EXISTS referral_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('beta_access', 'discount', 'credits', 'badge', 'custom')),
    reward_value TEXT, -- Description of reward
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    total_referrals INTEGER NOT NULL DEFAULT 0,
    total_conversions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referral_programs_app_id ON referral_programs(marketing_app_id);
CREATE INDEX idx_referral_programs_active ON referral_programs(is_active);

ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY referral_programs_user_policy ON referral_programs
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Referral Links (Unique referral URLs per user)
CREATE TABLE IF NOT EXISTS referral_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_program_id UUID NOT NULL REFERENCES referral_programs(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    referrer_email TEXT,
    referrer_name TEXT,
    click_count INTEGER NOT NULL DEFAULT 0,
    conversion_count INTEGER NOT NULL DEFAULT 0,
    last_clicked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referral_links_program_id ON referral_links(referral_program_id);
CREATE INDEX idx_referral_links_code ON referral_links(referral_code);

ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY referral_links_user_policy ON referral_links
    FOR ALL USING (
        referral_program_id IN (
            SELECT id FROM referral_programs WHERE marketing_app_id IN (
                SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
            )
        )
    );

-- User Generated Content (Fan art, clips, testimonials)
CREATE TABLE IF NOT EXISTS user_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    submitter_name TEXT,
    submitter_email TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'text', 'audio')),
    content_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    featured_at TIMESTAMPTZ,
    view_count INTEGER NOT NULL DEFAULT 0,
    reshare_count INTEGER NOT NULL DEFAULT 0,
    moderation_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ugc_app_id ON user_generated_content(marketing_app_id);
CREATE INDEX idx_ugc_status ON user_generated_content(status);
CREATE INDEX idx_ugc_featured ON user_generated_content(is_featured, featured_at DESC);

ALTER TABLE user_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY ugc_user_policy ON user_generated_content
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- ============================================================================
-- DOMAIN 3: MONETIZATION
-- ============================================================================

-- Pricing Tiers (Dynamic pricing configurations)
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    billing_period TEXT CHECK (billing_period IN ('one_time', 'monthly', 'yearly', 'lifetime')),
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_purchases INTEGER, -- Null = unlimited
    current_purchases INTEGER NOT NULL DEFAULT 0,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pricing_tiers_app_id ON pricing_tiers(marketing_app_id);
CREATE INDEX idx_pricing_tiers_active ON pricing_tiers(is_active);

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY pricing_tiers_user_policy ON pricing_tiers
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Offers (Special offers - Early Bird, Founder Pack, etc.)
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    pricing_tier_id UUID REFERENCES pricing_tiers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    max_redemptions INTEGER,
    current_redemptions INTEGER NOT NULL DEFAULT 0,
    promo_code TEXT UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offers_app_id ON offers(marketing_app_id);
CREATE INDEX idx_offers_active ON offers(is_active);
CREATE INDEX idx_offers_promo_code ON offers(promo_code);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY offers_user_policy ON offers
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Abandoned Carts (Incomplete purchase tracking)
CREATE TABLE IF NOT EXISTS abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    pricing_tier_id UUID REFERENCES pricing_tiers(id) ON DELETE SET NULL,
    visitor_email TEXT,
    visitor_id TEXT, -- Session ID or anonymous identifier
    cart_value DECIMAL(10, 2),
    abandoned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recovery_email_sent BOOLEAN NOT NULL DEFAULT false,
    recovery_email_sent_at TIMESTAMPTZ,
    recovered BOOLEAN NOT NULL DEFAULT false,
    recovered_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb, -- UTM params, referrer
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abandoned_carts_app_id ON abandoned_carts(marketing_app_id);
CREATE INDEX idx_abandoned_carts_abandoned_at ON abandoned_carts(abandoned_at);
CREATE INDEX idx_abandoned_carts_recovery_sent ON abandoned_carts(recovery_email_sent);
CREATE INDEX idx_abandoned_carts_recovered ON abandoned_carts(recovered);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY abandoned_carts_user_policy ON abandoned_carts
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Creator Contacts (Influencer/streamer CRM)
CREATE TABLE IF NOT EXISTS creator_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    platform TEXT CHECK (platform IN ('youtube', 'twitch', 'tiktok', 'twitter', 'instagram', 'other')),
    platform_username TEXT,
    platform_url TEXT,
    follower_count INTEGER,
    avg_views INTEGER,
    niche TEXT,
    status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'contacted', 'key_sent', 'coverage_received', 'declined')),
    key_sent_at TIMESTAMPTZ,
    key_code TEXT,
    coverage_url TEXT,
    coverage_views INTEGER,
    roi_estimate DECIMAL(10, 2), -- Estimated ROI from coverage
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_creator_contacts_app_id ON creator_contacts(marketing_app_id);
CREATE INDEX idx_creator_contacts_status ON creator_contacts(status);
CREATE INDEX idx_creator_contacts_platform ON creator_contacts(platform);

ALTER TABLE creator_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY creator_contacts_user_policy ON creator_contacts
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Ad Campaigns (Ad spend tracking)
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('google', 'facebook', 'instagram', 'reddit', 'twitter', 'tiktok', 'other')),
    campaign_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    budget_amount DECIMAL(10, 2) NOT NULL,
    spent_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cpc DECIMAL(10, 4), -- Cost per click
    ctr DECIMAL(5, 2), -- Click-through rate
    roi DECIMAL(10, 2), -- Return on investment
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ad_campaigns_app_id ON ad_campaigns(marketing_app_id);
CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX idx_ad_campaigns_platform ON ad_campaigns(platform);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY ad_campaigns_user_policy ON ad_campaigns
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Merch Assets (Generated brand assets for merchandise)
CREATE TABLE IF NOT EXISTS merch_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('sticker', 'tshirt', 'wallpaper', 'banner', 'logo', 'icon', 'other')),
    source_image_url TEXT NOT NULL,
    generated_variants JSONB DEFAULT '{}'::jsonb, -- { "1024x1024": "url", "2048x2048": "url" }
    download_count INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merch_assets_app_id ON merch_assets(marketing_app_id);
CREATE INDEX idx_merch_assets_type ON merch_assets(asset_type);
CREATE INDEX idx_merch_assets_public ON merch_assets(is_public);

ALTER TABLE merch_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY merch_assets_user_policy ON merch_assets
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- ============================================================================
-- DOMAIN 4: ANALYTICS
-- ============================================================================

-- Marketing Metrics (Daily snapshot of key metrics)
CREATE TABLE IF NOT EXISTS marketing_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_subscribers INTEGER DEFAULT 0,
    new_subscribers INTEGER DEFAULT 0,
    unsubscribers INTEGER DEFAULT 0,
    email_sent INTEGER DEFAULT 0,
    email_opened INTEGER DEFAULT 0,
    email_clicked INTEGER DEFAULT 0,
    social_posts INTEGER DEFAULT 0,
    social_engagement INTEGER DEFAULT 0,
    website_visitors INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    ad_spend DECIMAL(10, 2) DEFAULT 0,
    roi DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(marketing_app_id, metric_date)
);

CREATE INDEX idx_marketing_metrics_app_id ON marketing_metrics(marketing_app_id);
CREATE INDEX idx_marketing_metrics_date ON marketing_metrics(metric_date DESC);

ALTER TABLE marketing_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_metrics_user_policy ON marketing_metrics
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- LTV Calculations (Customer lifetime value estimates)
CREATE TABLE IF NOT EXISTS ltv_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL,
    avg_purchase_value DECIMAL(10, 2) NOT NULL,
    avg_purchase_frequency DECIMAL(10, 2) NOT NULL,
    customer_lifespan_months INTEGER NOT NULL,
    ltv_estimate DECIMAL(10, 2) NOT NULL,
    confidence_level DECIMAL(5, 2) DEFAULT 0, -- 0-100
    sample_size INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(marketing_app_id, calculation_date)
);

CREATE INDEX idx_ltv_calculations_app_id ON ltv_calculations(marketing_app_id);
CREATE INDEX idx_ltv_calculations_date ON ltv_calculations(calculation_date DESC);

ALTER TABLE ltv_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY ltv_calculations_user_policy ON ltv_calculations
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Sentiment Analyses (AI-powered sentiment scores)
CREATE TABLE IF NOT EXISTS sentiment_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    total_comments INTEGER NOT NULL DEFAULT 0,
    positive_count INTEGER NOT NULL DEFAULT 0,
    negative_count INTEGER NOT NULL DEFAULT 0,
    neutral_count INTEGER NOT NULL DEFAULT 0,
    mixed_count INTEGER NOT NULL DEFAULT 0,
    avg_sentiment_score DECIMAL(5, 2), -- -1 to 1
    vibe_summary TEXT, -- AI-generated plain English summary
    top_themes JSONB DEFAULT '[]'::jsonb, -- [{ "theme": "art", "sentiment": "positive", "count": 15 }]
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(marketing_app_id, analysis_date)
);

CREATE INDEX idx_sentiment_analyses_app_id ON sentiment_analyses(marketing_app_id);
CREATE INDEX idx_sentiment_analyses_date ON sentiment_analyses(analysis_date DESC);

ALTER TABLE sentiment_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY sentiment_analyses_user_policy ON sentiment_analyses
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Press Kits (Generated press kit versions)
CREATE TABLE IF NOT EXISTS press_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    version TEXT NOT NULL DEFAULT '1.0',
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT NOT NULL,
    developer_name TEXT,
    release_date DATE,
    platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
    price_info TEXT,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    media_assets JSONB DEFAULT '[]'::jsonb, -- [{ "type": "screenshot", "url": "...", "caption": "..." }]
    contact_email TEXT,
    website_url TEXT,
    press_contact TEXT,
    html_url TEXT, -- Public press kit page URL
    zip_url TEXT, -- Downloadable ZIP URL
    is_public BOOLEAN NOT NULL DEFAULT true,
    view_count INTEGER NOT NULL DEFAULT 0,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_press_kits_app_id ON press_kits(marketing_app_id);
CREATE INDEX idx_press_kits_public ON press_kits(is_public);

ALTER TABLE press_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY press_kits_user_policy ON press_kits
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- ============================================================================
-- DOMAIN 5: CROSS-PROMO NETWORK
-- ============================================================================

-- Promo Network Listings (Your apps listed for cross-promo)
CREATE TABLE IF NOT EXISTS promo_network_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_app_id UUID NOT NULL REFERENCES marketing_apps(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    niche TEXT NOT NULL, -- 'gaming', 'productivity', 'creativity', etc.
    target_audience TEXT, -- Description of target audience
    monthly_active_users INTEGER,
    available_promo_slots INTEGER NOT NULL DEFAULT 1, -- How many partnerships they can accept
    current_partnerships INTEGER NOT NULL DEFAULT 0,
    promo_type TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['newsletter', 'in_app', 'social']
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promo_listings_app_id ON promo_network_listings(marketing_app_id);
CREATE INDEX idx_promo_listings_active ON promo_network_listings(is_active);
CREATE INDEX idx_promo_listings_niche ON promo_network_listings(niche);

ALTER TABLE promo_network_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY promo_listings_user_policy ON promo_network_listings
    FOR ALL USING (
        marketing_app_id IN (
            SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Promo Partnerships (Agreements with other indie devs)
CREATE TABLE IF NOT EXISTS promo_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_listing_id UUID NOT NULL REFERENCES promo_network_listings(id) ON DELETE CASCADE,
    partner_listing_id UUID NOT NULL REFERENCES promo_network_listings(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
    promo_start_date DATE,
    promo_end_date DATE,
    requester_impressions INTEGER NOT NULL DEFAULT 0,
    partner_impressions INTEGER NOT NULL DEFAULT 0,
    requester_clicks INTEGER NOT NULL DEFAULT 0,
    partner_clicks INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(requester_listing_id, partner_listing_id)
);

CREATE INDEX idx_promo_partnerships_requester ON promo_partnerships(requester_listing_id);
CREATE INDEX idx_promo_partnerships_partner ON promo_partnerships(partner_listing_id);
CREATE INDEX idx_promo_partnerships_status ON promo_partnerships(status);

ALTER TABLE promo_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY promo_partnerships_user_policy ON promo_partnerships
    FOR ALL USING (
        requester_listing_id IN (
            SELECT id FROM promo_network_listings WHERE marketing_app_id IN (
                SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
            )
        )
        OR
        partner_listing_id IN (
            SELECT id FROM promo_network_listings WHERE marketing_app_id IN (
                SELECT id FROM marketing_apps WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
            )
        )
    );

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables
CREATE TRIGGER update_marketing_apps_updated_at BEFORE UPDATE ON marketing_apps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devlogs_updated_at BEFORE UPDATE ON devlogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hashtag_trends_updated_at BEFORE UPDATE ON hashtag_trends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waitlist_subscribers_updated_at BEFORE UPDATE ON waitlist_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aso_keywords_updated_at BEFORE UPDATE ON aso_keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriber_segments_updated_at BEFORE UPDATE ON subscriber_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referral_programs_updated_at BEFORE UPDATE ON referral_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referral_links_updated_at BEFORE UPDATE ON referral_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ugc_updated_at BEFORE UPDATE ON user_generated_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abandoned_carts_updated_at BEFORE UPDATE ON abandoned_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creator_contacts_updated_at BEFORE UPDATE ON creator_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merch_assets_updated_at BEFORE UPDATE ON merch_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_metrics_updated_at BEFORE UPDATE ON marketing_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ltv_calculations_updated_at BEFORE UPDATE ON ltv_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sentiment_analyses_updated_at BEFORE UPDATE ON sentiment_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_press_kits_updated_at BEFORE UPDATE ON press_kits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promo_listings_updated_at BEFORE UPDATE ON promo_network_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promo_partnerships_updated_at BEFORE UPDATE ON promo_partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTES FOR DEPLOYMENT
-- ============================================================================

-- 1. Run this migration on your Supabase project
-- 2. Create Supabase Storage buckets:
--    - marketing-media (for social post images/videos)
--    - ugc-submissions (for user-generated content)
--    - merch-assets (for brand assets)
--    - press-kits (for press kit files)
-- 3. Configure bucket permissions (public read, authenticated write with RLS)
-- 4. Set up environment variables for external APIs (see planning.md)
-- 5. Configure cron jobs to hit API endpoints (see planning.md)

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
