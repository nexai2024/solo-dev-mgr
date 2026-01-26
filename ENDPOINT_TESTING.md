# API Endpoint Testing Guide

**Purpose:** Enable comprehensive endpoint testing without running the full application
**Last Updated:** January 26, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Complete Endpoint Inventory](#complete-endpoint-inventory)
3. [Testing with cURL](#testing-with-curl)
4. [Testing with Bruno](#testing-with-bruno)
5. [Testing with Postman](#testing-with-postman)
6. [Manual QA Checklists](#manual-qa-checklists)
7. [Automated Testing Recommendations](#automated-testing-recommendations)

---

## Overview

The solo-dev-mgr platform has two types of endpoints:

1. **Public API Routes** - Traditional REST endpoints (`/api/*`)
2. **Server Actions** - Next.js server functions called from client components

This guide covers testing both types.

### Authentication

- **Public endpoints:** No auth required (or token-based for confirmation/tracking)
- **Cron endpoints:** Require `Authorization: Bearer {CRON_SECRET}` header
- **Server actions:** Require Clerk authentication (session cookie)

---

## Complete Endpoint Inventory

### Public Marketing APIs

#### 1. Waitlist Submission

**Endpoint:** `POST /api/marketing/public/waitlist`
**Auth:** None
**Purpose:** Submit email to waitlist with double opt-in flow

**Query Parameters:**
- `app_id` (required) - Marketing app ID

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "referral_source": "twitter" // optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Please check your email to confirm your subscription"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Validation Rules:**
- Email must be valid format
- Name is optional but recommended
- Referral source is optional
- Same email can't submit twice without confirmation

**Test Cases:**
1. Valid email → should return success
2. Invalid email format → should return 400 error
3. Duplicate submission (before confirmation) → should return error
4. Missing app_id → should return error

---

#### 2. Waitlist Email Confirmation

**Endpoint:** `GET /api/marketing/public/waitlist/confirm`
**Auth:** Token (from confirmation email)
**Purpose:** Confirm email address and activate waitlist entry

**Query Parameters:**
- `token` (required) - Confirmation token from email

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email confirmed! You're on the waitlist."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Test Cases:**
1. Valid token → should confirm and redirect
2. Invalid token → should return error
3. Already confirmed token → should handle gracefully
4. Expired token (>24hr old) → should return error

---

#### 3. Referral Tracking

**Endpoint:** `GET /api/marketing/public/referral/track`
**Auth:** None
**Purpose:** Track referral click and redirect to landing page

**Query Parameters:**
- `code` (required) - Unique referral code
- `utm_source`, `utm_medium`, `utm_campaign` (optional) - Additional tracking

**Behavior:**
- Increments click count for referral code
- Creates tracking record in database
- Redirects to landing page with tracking params

**Success Response:** 302 redirect to landing page

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid referral code"
}
```

**Test Cases:**
1. Valid code → should redirect and log click
2. Invalid code → should return error
3. Multiple clicks same code → should increment counter
4. Includes UTM params → should track them

---

### Cron Job Endpoints

**Note:** All cron endpoints require `Authorization: Bearer {CRON_SECRET}` header.

#### 4. Publish Scheduled Posts

**Endpoint:** `GET /api/marketing/cron/publish-scheduled-posts`
**Auth:** CRON_SECRET header required
**Purpose:** Publish social media posts that are scheduled for current time (runs every 5 minutes)

**Request Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Success Response (200):**
```json
{
  "success": true,
  "published": 3,
  "message": "Published 3 scheduled posts"
}
```

**Behavior:**
- Fetches posts with `scheduled_for <= NOW()` and `status = 'scheduled'`
- Publishes to each platform (Twitter, Reddit, TikTok, Discord)
- Updates status to `published` or `failed`
- Logs any errors

**Test Cases:**
1. Valid CRON_SECRET → should publish scheduled posts
2. Missing CRON_SECRET → should return 401
3. Invalid CRON_SECRET → should return 403
4. No scheduled posts → should return success with 0 published

---

#### 5. Sync Comments from All Platforms

**Endpoint:** `GET /api/marketing/cron/sync-comments`
**Auth:** CRON_SECRET header required
**Purpose:** Aggregate comments from all social platforms (runs every 15 minutes)

**Request Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Success Response (200):**
```json
{
  "success": true,
  "synced": {
    "twitter": 15,
    "reddit": 8,
    "youtube": 12,
    "tiktok": 5
  },
  "total": 40,
  "message": "Synced 40 comments across 4 platforms"
}
```

**Behavior:**
- Fetches comments/mentions from Twitter, Reddit, YouTube, TikTok
- Stores in unified `comments` table
- Runs sentiment analysis on each comment
- Detects spam/toxic comments

**Test Cases:**
1. Valid CRON_SECRET → should fetch and store comments
2. API rate limit → should handle gracefully
3. One platform down → should continue with others
4. Duplicate comments → should not create duplicates

---

#### 6. Send Recovery Emails (Cart Abandonment)

**Endpoint:** `GET /api/marketing/cron/send-recovery-emails`
**Auth:** CRON_SECRET header required
**Purpose:** Send abandoned cart emails for incomplete pricing offers (runs hourly)

**Request Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Success Response (200):**
```json
{
  "success": true,
  "sent": 12,
  "message": "Sent 12 recovery emails"
}
```

**Behavior:**
- Fetches incomplete offers (started checkout, didn't complete)
- Sends personalized recovery email with discount code
- Updates offer status to `recovery_sent`
- Only sends once per offer

**Test Cases:**
1. Valid CRON_SECRET → should send recovery emails
2. No abandoned carts → should return success with 0 sent
3. Email service down → should handle error gracefully
4. Already sent recovery → should not send again

---

### Server Actions Inventory

**Note:** Server actions are called from client components via form actions or direct imports. They require Clerk authentication and are NOT direct HTTP endpoints.

#### App Management (`lib/actions/app.actions.ts`)

```typescript
// CRUD Operations
createApp(data: CreateAppInput): Promise<App>
getAppById(id: string): Promise<App | null>
getAllApps(): Promise<App[]>
updateApp(id: string, data: UpdateAppInput): Promise<App>
deleteApp(id: string): Promise<void>
getAppStats(id: string): Promise<AppStats>
```

**Example Usage:**
```typescript
import { createApp } from '@/lib/actions/app.actions';

const newApp = await createApp({
  name: "My Awesome App",
  description: "A great app",
  category: "web_app",
  status: "development"
});
```

**Validation:** Uses Zod schemas from `lib/validations/app.validation.ts`

**Test Approach:**
- Unit tests with mocked Supabase client
- Integration tests with test database
- E2E tests with Playwright

---

#### Environment Variables (`lib/actions/env-var.actions.ts`)

```typescript
createEnvVar(appId: string, data: CreateEnvVarInput): Promise<EnvVar>
getEnvVarsByAppId(appId: string): Promise<EnvVar[]>
updateEnvVar(id: string, data: UpdateEnvVarInput): Promise<EnvVar>
deleteEnvVar(id: string): Promise<void>
```

**Security:** Env vars are encrypted in database

---

#### Repository Management (`lib/actions/repository.actions.ts`)

```typescript
createRepository(appId: string, data: CreateRepositoryInput): Promise<Repository>
getRepositoriesByAppId(appId: string): Promise<Repository[]>
updateRepository(id: string, data: UpdateRepositoryInput): Promise<Repository>
deleteRepository(id: string): Promise<void>
```

---

#### Deployment Tracking (`lib/actions/deployment.actions.ts`)

```typescript
createDeployment(appId: string, data: CreateDeploymentInput): Promise<Deployment>
getDeploymentsByAppId(appId: string): Promise<Deployment[]>
updateDeployment(id: string, data: UpdateDeploymentInput): Promise<Deployment>
deleteDeployment(id: string): Promise<void>
```

---

#### Blue Ocean Strategy (`lib/actions/blueocean.actions.ts`)

**Complex Module:** 699 lines with nested relationships

```typescript
// Analysis CRUD
createAnalysis(data: CreateAnalysisInput): Promise<Analysis>
getAllAnalyses(): Promise<Analysis[]>
getAnalysisById(id: string): Promise<AnalysisWithRelations>
updateAnalysis(id: string, data: UpdateAnalysisInput): Promise<Analysis>
deleteAnalysis(id: string): Promise<void>

// Competitor CRUD
createCompetitor(analysisId: string, data: CompetitorInput): Promise<Competitor>
updateCompetitor(id: string, data: CompetitorInput): Promise<Competitor>
deleteCompetitor(id: string): Promise<void>

// ERRC Framework Items
createERRCItem(analysisId: string, data: ERRCItemInput): Promise<ERRCItem>
updateERRCItem(id: string, data: ERRCItemInput): Promise<ERRCItem>
deleteERRCItem(id: string): Promise<void>

// Value Propositions
createValueProposition(analysisId: string, data: ValuePropositionInput): Promise<ValueProposition>
updateValueProposition(id: string, data: ValuePropositionInput): Promise<ValueProposition>
deleteValueProposition(id: string): Promise<void>

// Pain Points
createPainPoint(analysisId: string, data: PainPointInput): Promise<PainPoint>
updatePainPoint(id: string, data: PainPointInput): Promise<PainPoint>
deletePainPoint(id: string): Promise<void>

// Strategy Canvas
createStrategyCanvasPoint(analysisId: string, data: StrategyCanvasInput): Promise<StrategyCanvasPoint>
updateStrategyCanvasPoint(id: string, data: StrategyCanvasInput): Promise<StrategyCanvasPoint>
deleteStrategyCanvasPoint(id: string): Promise<void>
```

**Testing Strategy:**
- Focus on full analysis lifecycle (create → add competitors → add ERRC items → visualize)
- Test cascade deletes (delete analysis should delete all children)
- Test ownership verification (user can only access own analyses)

---

#### Marketing Actions (`lib/actions/marketing.actions.ts`)

**Generic Factory Pattern:** 572 lines covering 25+ entity types

```typescript
// Marketing App (parent for all marketing features)
createMarketingApp(appId: string, data: CreateMarketingAppInput): Promise<MarketingApp>
getMarketingApps(): Promise<MarketingApp[]>
getMarketingAppById(id: string): Promise<MarketingApp>
updateMarketingApp(id: string, data: UpdateMarketingAppInput): Promise<MarketingApp>
deleteMarketingApp(id: string): Promise<void>

// DevLogs (fully implemented UI)
createDevLog(marketingAppId: string, data: CreateDevLogInput): Promise<DevLog>
getDevLogs(marketingAppId: string): Promise<DevLog[]>
updateDevLog(id: string, data: UpdateDevLogInput): Promise<DevLog>
deleteDevLog(id: string): Promise<void>

// Social Posts (backend only)
createSocialPost(marketingAppId: string, data: CreateSocialPostInput): Promise<SocialPost>
getSocialPosts(marketingAppId: string): Promise<SocialPost[]>
updateSocialPost(id: string, data: UpdateSocialPostInput): Promise<SocialPost>
deleteSocialPost(id: string): Promise<void>

// ... (23 more entity types following same pattern)
```

**Pattern:** All follow `createMarketingActions<T>(tableName)` factory

**Entities:**
- DevLogs ✅ (UI complete)
- SocialPosts (backend only)
- Keywords (ASO)
- EmailCampaigns
- WaitlistEntries ✅ (flow complete)
- ReferralPrograms ✅ (flow complete)
- Comments
- UGCContent
- PricingOffers
- Creators
- Campaigns
- Analytics
- VibeChecks
- PressKits
- CrossPromos
- (10 more...)

---

#### Marketing AI (`lib/actions/marketing-ai.actions.ts`)

**571 lines of AI integrations** (Anthropic Claude + OpenAI fallback)

```typescript
// DevLog Generation
generateDevLogContent(context: {
  commits?: string[],
  tasks?: string[],
  customContext?: string
}): Promise<string>

// Multi-Platform Content Optimization
optimizeContentForPlatform(content: string, platform: 'twitter' | 'reddit' | 'tiktok' | 'discord'): Promise<string>

// ASO/SEO Audit
performASOAudit(appData: {
  name: string,
  description: string,
  keywords: string[]
}): Promise<ASOAuditResult>

// Sentiment Analysis
analyzeSentiment(text: string): Promise<SentimentResult>
batchAnalyzeSentiment(texts: string[]): Promise<SentimentResult[]>

// Vibe Check (Aggregate Sentiment)
performVibeCheck(comments: Comment[]): Promise<VibeCheckResult>

// Hashtag Suggestions
suggestHashtags(content: string, platform: string): Promise<string[]>

// Email Subject Optimization
optimizeEmailSubject(subject: string): Promise<{ original: string, suggestions: string[] }>

// Press Kit Generation
generatePressKit(appData: AppData): Promise<PressKitContent>
```

**Status:** ✅ All working with Claude Sonnet 4.5

**Test Approach:**
- Mock AI responses for unit tests
- Use real API in integration tests (with rate limiting)
- Cache responses to reduce costs

---

#### External API Integrations (`lib/actions/marketing-external-apis.actions.ts`)

**655 lines of social media integrations**

```typescript
// Twitter/X
publishToTwitter(content: string, mediaUrls?: string[]): Promise<TweetResult>
fetchTwitterMentions(username: string): Promise<Mention[]>

// Reddit (⚠️ TODO: Stub)
publishToReddit(subreddit: string, title: string, content: string): Promise<RedditPostResult>

// TikTok
publishToTikTok(videoUrl: string, caption: string): Promise<TikTokResult>

// Discord
publishToDiscord(webhookUrl: string, content: string): Promise<DiscordResult>

// YouTube
fetchYouTubeComments(videoId: string): Promise<Comment[]>

// Unified Publishing
publishToAllPlatforms(content: string, platforms: string[]): Promise<PublishResults>

// Unified Comment Aggregation
fetchAllComments(): Promise<Comment[]>

// Scraping (⚠️ TODO: All stubs)
scrapeProductHunt(query: string): Promise<ProductHuntResult[]>
scrapeAppStore(appId: string): Promise<AppStoreData>
scrapePlayStore(packageName: string): Promise<PlayStoreData>
```

**Status:**
- Twitter: ⚠️ Partial (needs OAuth callback)
- Reddit: ❌ Stub
- TikTok: ⚠️ Partial (needs OAuth callback)
- Discord: ⚠️ Needs configuration
- YouTube: ⚠️ Needs API key
- Scrapers: ❌ All stubs

---

## Testing with cURL

See `curl-commands.sh` for complete command library.

### Quick Examples

**1. Submit to Waitlist:**
```bash
curl -X POST "http://localhost:3000/api/marketing/public/waitlist?app_id=123" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "referral_source": "twitter"
  }'
```

**2. Confirm Waitlist Email:**
```bash
curl -X GET "http://localhost:3000/api/marketing/public/waitlist/confirm?token=abc123xyz"
```

**3. Track Referral:**
```bash
curl -X GET "http://localhost:3000/api/marketing/public/referral/track?code=FRIEND2024"
```

**4. Trigger Cron Job (Publish Posts):**
```bash
curl -X GET "http://localhost:3000/api/marketing/cron/publish-scheduled-posts" \
  -H "Authorization: Bearer your-cron-secret-here"
```

**5. Trigger Cron Job (Sync Comments):**
```bash
curl -X GET "http://localhost:3000/api/marketing/cron/sync-comments" \
  -H "Authorization: Bearer your-cron-secret-here"
```

**6. Trigger Cron Job (Recovery Emails):**
```bash
curl -X GET "http://localhost:3000/api/marketing/cron/send-recovery-emails" \
  -H "Authorization: Bearer your-cron-secret-here"
```

---

## Testing with Bruno

Bruno is a Git-friendly API client that stores collections as plain text files.

### Setup

1. Install Bruno: `brew install bruno` (Mac) or download from [usebruno.com](https://www.usebruno.com/)
2. Clone repo with Bruno collection: `bruno-collection/` directory
3. Open Bruno → Open Collection → Select `bruno-collection/`
4. Configure environments:
   - Local: `http://localhost:3000`
   - Production: `https://your-domain.com`

### Collection Structure

```
bruno-collection/
├── bruno.json                    # Collection metadata
├── environments/
│   ├── local.bru                # Local: localhost:3000
│   └── production.bru           # Production: your-domain.com
├── marketing/
│   ├── waitlist-submit.bru      # POST waitlist
│   ├── waitlist-confirm.bru     # GET confirm
│   └── referral-track.bru       # GET referral
├── cron/
│   ├── publish-posts.bru        # Publish scheduled posts
│   ├── sync-comments.bru        # Sync comments
│   └── recovery-emails.bru      # Send recovery emails
└── README.md                     # Collection usage guide
```

### Example .bru File

**File:** `bruno-collection/marketing/waitlist-submit.bru`

```
meta {
  name: Submit to Waitlist
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}/api/marketing/public/waitlist?app_id={{appId}}
  body: json
  auth: none
}

headers {
  Content-Type: application/json
}

body:json {
  {
    "email": "{{testEmail}}",
    "name": "Test User",
    "referral_source": "organic"
  }
}

assert {
  res.status: eq 200
  res.body.success: eq true
}

tests {
  test("should return success message", function() {
    expect(res.body.message).to.include("check your email");
  });
}

docs {
  # Waitlist Submission

  Public endpoint for waitlist submission with double opt-in.
  No authentication required.

  **Required Query Params:**
  - app_id: Marketing app ID

  **Request Body:**
  - email (required): Valid email address
  - name (optional): User's name
  - referral_source (optional): How they found us

  **Response:**
  - 200: Success, confirmation email sent
  - 400: Validation error
}
```

### Running Tests

**In Bruno UI:**
1. Select request
2. Click "Send"
3. View response
4. Check assertions (✅/❌)

**Via CLI:**
```bash
# Install Bruno CLI
npm install -g @usebruno/cli

# Run all tests
bru run bruno-collection/ --env local

# Run specific folder
bru run bruno-collection/marketing --env local

# Run with output
bru run bruno-collection/ --env local --output results.json
```

---

## Testing with Postman

See `postman-collection.json` for complete collection.

### Setup

1. Open Postman
2. Import → Upload `postman-collection.json`
3. Configure environment:
   - `baseUrl`: `http://localhost:3000`
   - `CRON_SECRET`: Your cron secret
   - `appId`: A valid marketing app ID
   - `testEmail`: Email for testing

### Collection Structure

**Folders:**
- Marketing - Public Endpoints (3 requests)
- Cron Jobs (3 requests)
- Health Checks (1 request)

**Variables:**
- `{{baseUrl}}` - Base URL (localhost or production)
- `{{CRON_SECRET}}` - Cron job authentication
- `{{appId}}` - Marketing app ID for testing
- `{{testEmail}}` - Test email address

### Running Tests

**Manual:**
1. Select request
2. Click "Send"
3. View response

**Automated (Collection Runner):**
1. Click "Runner"
2. Select collection
3. Select environment
4. Click "Run"
5. View test results

**Via CLI (Newman):**
```bash
# Install Newman
npm install -g newman

# Run collection
newman run postman-collection.json \
  --environment postman-environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

---

## Manual QA Checklists

### Authentication Flow (5 test cases)

- [ ] Sign up with Google OAuth → should create account
- [ ] Sign in with existing account → should redirect to dashboard
- [ ] Sign out → should clear session and redirect to home
- [ ] Access protected route without auth → should redirect to sign in
- [ ] Session expires → should prompt re-authentication

### App Management CRUD (7 test cases)

- [ ] Create new app → should appear in list
- [ ] View app details → should show all fields
- [ ] Edit app → should update successfully
- [ ] Delete app → should remove from list (cascade delete env vars, repos, deployments)
- [ ] Add environment variable → should store encrypted
- [ ] Link repository → should validate Git URL
- [ ] Track deployment → should log in history

### Blue Ocean Strategy (10 test cases)

- [ ] Create new analysis → should initialize
- [ ] Add competitor → should attach to analysis
- [ ] Add ERRC item (Eliminate) → should categorize correctly
- [ ] Add ERRC item (Reduce) → should categorize correctly
- [ ] Add ERRC item (Raise) → should categorize correctly
- [ ] Add ERRC item (Create) → should categorize correctly
- [ ] Add pain point → should store with source
- [ ] Add value proposition → should calculate value/cost
- [ ] View strategy canvas → should visualize value curves
- [ ] Delete analysis → should cascade delete all children

### Marketing - DevLogs (Full UI, 8 test cases)

- [ ] View DevLogs list → should show all logs
- [ ] Create DevLog manually → should save
- [ ] Generate DevLog with AI (commits) → should create content
- [ ] Generate DevLog with AI (tasks) → should create content
- [ ] Generate DevLog with AI (custom context) → should create content
- [ ] Edit DevLog → should update
- [ ] Delete DevLog → should remove
- [ ] View DevLog detail → should display formatted

### Marketing - Waitlist (Full Flow, 6 test cases)

- [ ] Submit valid email → should send confirmation
- [ ] Submit invalid email → should return error
- [ ] Submit duplicate email → should handle gracefully
- [ ] Confirm email with valid token → should activate
- [ ] Confirm email with invalid token → should error
- [ ] Confirm already confirmed email → should handle gracefully

### Marketing - Referrals (Full Flow, 5 test cases)

- [ ] Create referral program → should generate code
- [ ] Click referral link → should track click
- [ ] Sign up via referral → should attribute to referrer
- [ ] View referral stats → should show clicks/conversions
- [ ] Referral reward triggers → should execute

### Marketing - Social Scheduler (Backend Only, 7 test cases)

- [ ] Create scheduled post → should save with future date
- [ ] Schedule for immediate publish → should publish via cron
- [ ] Schedule for Twitter → should format correctly
- [ ] Schedule for Reddit → should format with subreddit
- [ ] Schedule for multiple platforms → should create separate posts
- [ ] Cron job publishes scheduled posts → should update status
- [ ] View published posts history → should show results

### Email Delivery (3 test cases)

- [ ] Waitlist confirmation email → should receive in inbox
- [ ] Email has proper formatting → should match template
- [ ] Unsubscribe link works → should opt out

### Cron Jobs (3 test cases)

- [ ] Publish scheduled posts (manual trigger) → should process queue
- [ ] Sync comments (manual trigger) → should fetch from platforms
- [ ] Send recovery emails (manual trigger) → should send to abandoned carts

---

## Automated Testing Recommendations

### Framework Selection

**Recommended Stack:**
- **E2E Tests:** Playwright (Next.js App Router support, fast, reliable)
- **Unit Tests:** Vitest (fast, Jest-compatible, Vite integration)
- **Integration Tests:** Vitest + Supabase test client

**Alternative Stack:**
- **E2E Tests:** Cypress (more mature, larger community)
- **Unit Tests:** Jest (industry standard, more plugins)

### Test Coverage Targets

**Priority 1 - Critical Paths (15-20 tests):**
- Authentication flow (sign up, sign in, sign out)
- App creation and management
- Waitlist submission and confirmation
- DevLog creation with AI generation
- Social post scheduling and publishing

**Priority 2 - Core Features (30-40 tests):**
- Blue Ocean analysis full lifecycle
- Environment variable management
- Repository linking
- Deployment tracking
- Email campaigns
- Referral program
- Comment aggregation

**Priority 3 - Edge Cases (50+ tests):**
- Error handling
- Validation errors
- Permission checks (ownership)
- Rate limiting
- API failures
- Database constraints

### Example Playwright Test

**File:** `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should sign up with Google OAuth', async ({ page }) => {
    await page.goto('/sign-up');

    // Click Google OAuth button
    await page.click('button:has-text("Continue with Google")');

    // Mock Google OAuth flow (in real test, use test Google account)
    // ... Google auth flow ...

    // Should redirect to dashboard after sign up
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should sign out', async ({ page }) => {
    // Assuming already signed in
    await page.goto('/dashboard');

    // Click user menu → sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Sign Out")');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should protect /apps route', async ({ page }) => {
    // Without auth, should redirect to sign in
    await page.goto('/apps');
    await expect(page).toHaveURL('/sign-in');
  });
});
```

### Example Vitest Unit Test

**File:** `__tests__/actions/app.actions.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '@/lib/actions/app.actions';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
vi.mock('@/lib/supabase/server');

describe('App Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createApp', () => {
    it('should create app with valid data', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: '123', name: 'Test App' },
          error: null
        })
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await createApp({
        name: 'Test App',
        description: 'Test',
        category: 'web_app',
        status: 'development'
      });

      expect(result).toEqual({ id: '123', name: 'Test App' });
      expect(mockSupabase.from).toHaveBeenCalledWith('apps');
    });

    it('should throw error with invalid data', async () => {
      await expect(createApp({
        name: '', // Invalid: empty name
        category: 'invalid', // Invalid category
        status: 'development'
      })).rejects.toThrow();
    });
  });
});
```

### Integration Test Strategy

**Test Database Setup:**
1. Use Supabase test project (separate from production)
2. Run migrations before tests
3. Seed test data
4. Clean up after tests

**Example Setup:**
```typescript
// test/setup.ts
import { createClient } from '@supabase/supabase-js';

export async function setupTestDB() {
  const supabase = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_KEY!
  );

  // Run migrations
  // Seed data

  return supabase;
}

export async function teardownTestDB(supabase) {
  // Clean up test data
  await supabase.from('apps').delete().neq('id', '');
  // ...
}
```

### CI/CD Integration

**GitHub Actions Workflow:**

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          TEST_SUPABASE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## Conclusion

This guide provides multiple approaches to test the solo-dev-mgr API:

1. **cURL** - Quick command-line testing
2. **Bruno** - Git-friendly API client with version control
3. **Postman** - Full-featured API testing with UI
4. **Automated Tests** - Playwright (E2E) + Vitest (unit/integration)

**Next Steps:**
1. Set up Bruno or Postman collection
2. Test all public endpoints manually
3. Implement Playwright E2E tests for critical paths
4. Add unit tests for server actions
5. Integrate tests into CI/CD pipeline

**For cURL commands, see:** `curl-commands.sh`
**For Bruno collection, see:** `bruno-collection/`
**For Postman collection, see:** `postman-collection.json`
