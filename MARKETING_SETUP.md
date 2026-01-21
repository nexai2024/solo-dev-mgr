# Vantage Marketing Module - Setup Guide

## Overview

The Vantage Marketing Module is a comprehensive marketing automation platform for indie developers, providing 30+ features across audience building, engagement, monetization, and analytics.

## ✅ What's Been Implemented

### Foundation (Complete)
- ✅ Database migration SQL with 25 tables
- ✅ TypeScript types for all entities (700+ lines)
- ✅ Zod validation schemas (600+ lines)
- ✅ Comprehensive CRUD actions for all entities
- ✅ AI integration (Claude Sonnet 4.5 + OpenAI fallback)
- ✅ External API integrations (Twitter, Reddit, Discord, TikTok, YouTube)

### Core Features (Complete)
- ✅ AI-powered devlog generation
- ✅ Multi-platform content optimization
- ✅ ASO/SEO auditing
- ✅ Sentiment analysis & vibe checks
- ✅ Hashtag trend suggestions
- ✅ Email subject line optimization
- ✅ Press kit content generation

### API Routes (Complete)
- ✅ Cron jobs (publish posts, sync comments, recovery emails)
- ✅ Public APIs (waitlist submission, referral tracking)
- ✅ React Email templates (waitlist confirmation, product launch)

### UI (Foundational Structure Complete)
- ✅ Marketing module layout with sidebar navigation
- ✅ Dashboard with summary stats
- ✅ Onboarding flow for first-time users
- ✅ App-level routing structure

## 🚧 What Needs Completion

### UI Pages (Templates Ready, Need Full Implementation)
The following pages need complete CRUD forms and data display:

1. **DevLogs Management** (`/marketing/[appId]/devlogs`)
   - List view with publish status
   - Create/edit form with markdown editor
   - AI-powered generation button
   - Milestone tracker visualization

2. **Social Scheduler** (`/marketing/[appId]/social`)
   - Calendar view of scheduled posts
   - Post composer with platform-specific previews
   - Media upload interface
   - Publishing status tracking

3. **Email Campaigns** (`/marketing/[appId]/email`)
   - Campaign builder with drag-drop
   - Segment manager
   - Template library
   - Analytics dashboard

4. **Community Dashboard** (`/marketing/[appId]/community`)
   - Unified comment feed from all platforms
   - Sentiment chart visualizations
   - Reply interface
   - Flagging/moderation tools

5. **Referral Programs** (`/marketing/[appId]/referrals`)
   - Program CRUD
   - Link generator
   - Leaderboard
   - Conversion tracking

6. **UGC Gallery** (`/marketing/[appId]/ugc`)
   - Submission grid view
   - Moderation queue
   - Featured gallery
   - Reshare tools

7. **Pricing & Offers** (`/marketing/[appId]/pricing`)
   - Tier management
   - Offer/promo code creator
   - Stripe integration
   - Abandoned cart recovery

8. **Creator CRM** (`/marketing/[appId]/creators`)
   - Contact list with filters
   - Key sending workflow
   - Coverage tracking
   - ROI calculator

9. **Ad Campaign Tracker** (`/marketing/[appId]/ads`)
   - Campaign CRUD
   - Metrics dashboard
   - ROI visualization
   - Platform comparison

10. **North Star Analytics** (`/marketing/[appId]/analytics`)
    - LTV calculator
    - Burn vs. Earn chart
    - Growth projections
    - Custom metric tracking

11. **Vibe Check** (`/marketing/[appId]/vibe-check`)
    - Sentiment overview
    - Word cloud visualization
    - Theme breakdown
    - Plain English summary

12. **Press Kit Generator** (`/marketing/[appId]/press-kit`)
    - Vlambeer-style template editor
    - Asset uploader
    - HTML preview
    - ZIP download

13. **Cross-Promo Network** (`/marketing/[appId]/cross-promo`)
    - Listing creator
    - Partnership browser
    - Request management
    - Impression tracking

### Additional Cron Jobs Needed
- `update-metrics` - Daily metrics aggregation
- `generate-sentiment-analysis` - Daily sentiment rollup
- `sync-hashtag-trends` - Track trending hashtags
- `calculate-ltv` - Weekly LTV calculations

### OAuth Callback Routes Needed
- `/api/marketing/oauth/twitter/callback`
- `/api/marketing/oauth/reddit/callback`
- `/api/marketing/oauth/tiktok/callback`

## 🚀 Setup Instructions

### 1. Database Setup

Run the migration on your Supabase project:

```bash
psql -h [your-host] -U postgres -d postgres -f supabase_vantage_marketing_migration.sql
```

Or use the Supabase SQL editor to paste the contents of `supabase_vantage_marketing_migration.sql`.

### 2. Create Storage Buckets

In Supabase Dashboard > Storage, create these buckets:

- `marketing-media` - Social post images/videos
- `ugc-submissions` - User-generated content
- `merch-assets` - Brand assets for merchandise
- `press-kits` - Press kit files

Configure each bucket:
- Public read access
- Authenticated write with RLS
- Max file size: 50MB

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

**Required for basic functionality:**
- Clerk credentials (authentication)
- Supabase credentials (database)
- Resend API key (email sending)
- Anthropic API key (AI features)

**Optional (for full features):**
- Twitter, Reddit, Discord, TikTok, YouTube API credentials
- OpenAI API key (AI fallback)
- Stripe credentials (monetization)

### 4. Install Dependencies

All required packages are already installed:

```bash
npm install
# Already includes: resend, twitter-api-v2, snoowrap, ai@6, react-email
```

### 5. Setup Cron Jobs

Configure cron jobs in your hosting platform:

**Vercel Cron (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/marketing/cron/publish-scheduled-posts",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/marketing/cron/sync-comments",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/marketing/cron/send-recovery-emails",
      "schedule": "0 * * * *"
    }
  ]
}
```

**External Cron Service (e.g., cron-job.org):**
- URL: `https://yourdomain.com/api/marketing/cron/[job-name]`
- Method: GET
- Header: `Authorization: Bearer [CRON_SECRET]`

### 6. OAuth Setup

For each social platform, you'll need to:

1. **Twitter/X**:
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Create new app
   - Enable OAuth 2.0
   - Set callback URL: `https://yourdomain.com/api/marketing/oauth/twitter/callback`

2. **Reddit**:
   - Go to https://www.reddit.com/prefs/apps
   - Create "web app"
   - Set redirect URI: `https://yourdomain.com/api/marketing/oauth/reddit/callback`

3. **TikTok**:
   - Go to https://developers.tiktok.com/
   - Create app and enable Content Posting API
   - Set redirect URI: `https://yourdomain.com/api/marketing/oauth/tiktok/callback`

4. **YouTube**:
   - Go to Google Cloud Console
   - Enable YouTube Data API v3
   - Create API key (no OAuth needed for read operations)

5. **Discord**:
   - Go to https://discord.com/developers/applications
   - Create bot
   - Copy bot token
   - Add bot to your server with appropriate permissions

### 7. Navigation Update

Add Marketing module to your main navigation in `app/layout.tsx` or navigation component:

```tsx
{
  name: 'Marketing',
  href: '/marketing',
  icon: Megaphone,
}
```

## 📊 Architecture Overview

### Data Flow

```
User Action → UI Component → Server Action → Supabase
                                    ↓
                              AI Processing (if needed)
                                    ↓
                              External APIs (if needed)
```

### AI Processing Flow

```
Request → Try Claude Sonnet 4.5 → Success → Return
                ↓ (if fails)
         Try OpenAI GPT-5 → Success → Return
                ↓ (if fails)
              Error → User
```

### Social Publishing Flow

```
Schedule Post → Store in DB (status: scheduled)
                      ↓
            Cron Job (every 5 min)
                      ↓
         Get Social Account Credentials
                      ↓
    Publish to All Selected Platforms
                      ↓
      Update Status & Store Results
```

### Comment Aggregation Flow

```
Cron Job (every 15 min)
        ↓
Fetch from All Connected Platforms
        ↓
AI Sentiment Analysis (per comment)
        ↓
Store in community_comments table
        ↓
Generate Daily Vibe Check Summary
```

## 🎯 Feature Implementation Priority

If building out remaining UI incrementally, recommended order:

1. **DevLogs** - Core "build in public" feature
2. **Social Scheduler** - High-impact audience building
3. **Email Campaigns** - Essential engagement tool
4. **Community Dashboard** - Centralized feedback management
5. **Analytics** - Data-driven decision making
6. **Referrals** - Growth mechanism
7. **Pricing/Monetization** - Revenue generation
8. **Creator CRM** - Influencer partnerships
9. **Ad Tracking** - Paid marketing optimization
10. **UGC/Press Kit/Cross-Promo** - Advanced features

## 🔒 Security Considerations

1. **API Keys**: All social platform tokens stored encrypted in database
2. **RLS**: Row Level Security enabled on all marketing tables
3. **Cron Authentication**: All cron endpoints require CRON_SECRET header
4. **Public APIs**: Rate limiting recommended (implement with Upstash or similar)
5. **Email Verification**: Double opt-in for waitlist subscribers

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create marketing app
- [ ] Connect social account (OAuth flow)
- [ ] Schedule social post
- [ ] Verify cron job publishes post
- [ ] Submit to waitlist (public API)
- [ ] Confirm email subscription
- [ ] Create email campaign
- [ ] Generate AI devlog
- [ ] Run ASO audit
- [ ] Track referral click
- [ ] Check sentiment analysis on comments

### Testing with Mock Data

Use the provided SQL migration to insert test data:

```sql
-- Insert test marketing app
INSERT INTO marketing_apps (user_id, name, description, status)
VALUES ('user_test_123', 'Test App', 'A test marketing app', 'active');

-- Insert test devlog
INSERT INTO devlogs (marketing_app_id, title, content, is_published)
VALUES ('[app_id]', 'First DevLog', 'This is a test devlog', true);
```

## 📈 Monitoring & Maintenance

### Key Metrics to Track

1. **Cron Job Success Rate**: Monitor failed jobs
2. **Email Delivery Rate**: Track bounces and complaints
3. **AI API Usage**: Monitor costs and rate limits
4. **Database Performance**: Watch query performance as data grows
5. **External API Errors**: Track failures from social platforms

### Recommended Monitoring Tools

- Sentry (error tracking)
- LogFlare (Supabase logging)
- Vercel Analytics (performance)
- Resend Analytics (email deliverability)

## 🆘 Troubleshooting

### Common Issues

**Cron jobs not running:**
- Verify CRON_SECRET is set correctly
- Check hosting platform cron configuration
- Review logs for error messages

**Social posting fails:**
- Verify OAuth tokens haven't expired
- Check API rate limits
- Ensure platform-specific content meets requirements

**AI features not working:**
- Verify ANTHROPIC_API_KEY is valid
- Check API usage limits
- Ensure fallback OPENAI_API_KEY is set

**Emails not sending:**
- Verify Resend API key
- Check sender domain is verified
- Review email templates for syntax errors

**Database queries slow:**
- Ensure indexes are created (migration includes them)
- Consider adding caching layer
- Monitor Supabase dashboard for slow queries

## 📚 Additional Resources

- [Vercel AI SDK v6 Documentation](https://sdk.vercel.ai/docs)
- [Resend Email API](https://resend.com/docs)
- [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- [Reddit API Docs](https://www.reddit.com/dev/api/)
- [TikTok API Docs](https://developers.tiktok.com/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contributing

To complete UI pages, follow this pattern for each feature:

1. Create page file: `app/marketing/[appId]/[feature]/page.tsx`
2. Import necessary actions from `lib/actions/marketing.actions.ts`
3. Use Shadcn UI components for consistency
4. Follow existing dashboard layout pattern
5. Add loading states and error handling
6. Test CRUD operations thoroughly

Example template provided in `/marketing/[appId]/dashboard/page.tsx`.

## 📝 License

This marketing module is part of the Solo Dev Manager project.
