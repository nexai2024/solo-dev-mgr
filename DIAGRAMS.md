# Solo Dev Manager - Architecture Diagrams

This document contains visual diagrams for the Solo Dev Manager platform architecture, roadmap, and feature status.

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        User[👤 User Browser]
        Mobile[📱 Mobile Browser]
    end

    subgraph "Next.js 15 Application"
        Pages[App Router Pages<br/>/apps, /blue-ocean, /marketing]
        Components[React Components<br/>shadcn/ui + custom]
        ServerActions[Server Actions Layer<br/>3,778 lines of business logic]
    end

    subgraph "Authentication & Authorization"
        Clerk[🔐 Clerk Auth<br/>Google OAuth + Session]
    end

    subgraph "Database"
        Supabase[(🗄️ Supabase PostgreSQL<br/>34+ tables with RLS<br/>1,815 lines of migrations)]
    end

    subgraph "AI Services"
        Claude[🤖 Anthropic Claude<br/>Sonnet 4.5]
        OpenAI[🤖 OpenAI<br/>Fallback]
    end

    subgraph "Email Service"
        Resend[📧 Resend<br/>React Email templates]
    end

    subgraph "Social Media APIs"
        Twitter[🐦 Twitter/X API]
        Reddit[🔴 Reddit API]
        TikTok[📱 TikTok API]
        Discord[💬 Discord Webhooks]
        YouTube[▶️ YouTube API]
    end

    subgraph "Background Jobs"
        Cron1[⏰ Publish Posts<br/>Every 5 min]
        Cron2[⏰ Sync Comments<br/>Every 15 min]
        Cron3[⏰ Recovery Emails<br/>Hourly]
    end

    User --> Pages
    Mobile --> Pages
    Pages --> Clerk
    Pages --> Components
    Components --> ServerActions
    ServerActions --> Clerk
    ServerActions --> Supabase
    ServerActions --> Claude
    ServerActions --> OpenAI
    ServerActions --> Resend
    ServerActions --> Twitter
    ServerActions --> Reddit
    ServerActions --> TikTok
    ServerActions --> Discord
    ServerActions --> YouTube

    Cron1 --> ServerActions
    Cron2 --> ServerActions
    Cron3 --> ServerActions

    style User fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style Clerk fill:#ffd4e5
    style Supabase fill:#d4f1d4
    style Claude fill:#fff4cc
    style OpenAI fill:#fff4cc
    style Resend fill:#e5ccff
```

---

## 2. Data Flow - Key Features

### DevLog Creation with AI (Complete)

```mermaid
sequenceDiagram
    actor User
    participant UI as DevLog Form
    participant SA as Server Actions
    participant AI as Claude API
    participant DB as Supabase

    User->>UI: Click "Generate with AI"
    UI->>UI: Collect git commits/tasks
    UI->>SA: generateDevLogContent(context)
    SA->>AI: Generate DevLog content
    AI-->>SA: Generated markdown
    SA->>DB: INSERT devlog
    DB-->>SA: Created devlog
    SA-->>UI: Success + content
    UI-->>User: Show generated DevLog
```

### Waitlist Flow (Complete)

```mermaid
sequenceDiagram
    actor User
    participant API as Waitlist API
    participant DB as Database
    participant Email as Resend

    User->>API: POST /api/marketing/public/waitlist
    API->>DB: INSERT waitlist entry (status: pending)
    DB-->>API: Entry created
    API->>Email: Send confirmation email
    Email-->>User: Confirmation email with token
    API-->>User: "Check your email"

    Note over User,Email: User clicks link in email

    User->>API: GET /api/marketing/public/waitlist/confirm?token=abc
    API->>DB: UPDATE status = confirmed
    DB-->>API: Updated
    API-->>User: "You're confirmed!"
```

### Social Post Scheduling Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Social Scheduler
    participant SA as Server Actions
    participant DB as Database
    participant Cron as Cron Job
    participant APIs as Social APIs

    User->>UI: Create scheduled post
    UI->>SA: createSocialPost(data)
    SA->>DB: INSERT (status: scheduled)
    DB-->>SA: Created
    SA-->>UI: Success

    Note over Cron: Every 5 minutes

    Cron->>DB: SELECT scheduled posts WHERE time <= NOW()
    DB-->>Cron: 3 posts ready
    Cron->>APIs: Publish to platforms
    APIs-->>Cron: Published
    Cron->>DB: UPDATE status = published
```

---

## 3. Module Architecture

### Three Core Modules

```mermaid
graph LR
    subgraph "App Management"
        Apps[Apps CRUD]
        Env[Environment Vars]
        Repo[Repositories]
        Deploy[Deployments]
    end

    subgraph "Blue Ocean Strategy"
        Analysis[Competitive Analysis]
        ERRC[ERRC Framework]
        Canvas[Strategy Canvas]
        Pain[Pain Points]
        AI_BO[AI Analysis<br/>⚠️ Stubbed]
    end

    subgraph "Marketing Automation"
        DevLogs[DevLogs ✅]
        Social[Social Scheduler]
        Email[Email Campaigns]
        Waitlist[Waitlist ✅]
        Referrals[Referrals ✅]
        Community[Community Dashboard]
        Analytics[Analytics]
        AI_Mkt[Marketing AI ✅]
    end

    Apps --> Env
    Apps --> Repo
    Apps --> Deploy

    Analysis --> ERRC
    Analysis --> Canvas
    Analysis --> Pain
    Analysis --> AI_BO

    DevLogs --> AI_Mkt
    Social --> AI_Mkt
    Email --> AI_Mkt

    style DevLogs fill:#d4f1d4
    style Waitlist fill:#d4f1d4
    style Referrals fill:#d4f1d4
    style AI_Mkt fill:#d4f1d4
    style AI_BO fill:#ffd4d4
```

---

## 4. Launch Roadmap Timeline

```mermaid
gantt
    title Solo Dev Manager - Launch Roadmap 2026
    dateFormat YYYY-MM-DD

    section Phase 1: Production Ready
    Fix ignoreBuildErrors          :crit, p1_1, 2026-01-27, 1d
    Create .env.example             :crit, p1_2, 2026-01-27, 1d
    Setup Sentry error tracking     :crit, p1_3, 2026-01-28, 1d
    Implement rate limiting         :crit, p1_4, 2026-01-29, 2d
    Complete Blue Ocean AI          :crit, p1_5, 2026-01-31, 3d
    Setup Playwright E2E tests      :crit, p1_6, 2026-02-03, 5d
    CI/CD pipeline                  :crit, p1_7, 2026-02-10, 2d

    section Phase 2: Feature Completion
    Social Scheduler UI             :p2_1, 2026-02-12, 7d
    Email Campaigns UI              :p2_2, 2026-02-19, 7d
    Community Dashboard UI          :p2_3, 2026-02-26, 7d
    Analytics Dashboard UI          :p2_4, 2026-03-05, 7d
    Remaining 9 feature UIs         :p2_5, 2026-03-12, 14d
    OAuth callback routes           :p2_6, 2026-02-12, 5d
    Subscription enforcement        :p2_7, 2026-03-19, 5d

    section Phase 3: Scale & Optimize
    Redis caching layer             :p3_1, 2026-03-26, 7d
    Database optimization           :p3_2, 2026-04-02, 7d
    Background job processing       :p3_3, 2026-04-09, 7d
    Load testing                    :p3_4, 2026-04-16, 5d

    section Milestones
    BETA LAUNCH                     :milestone, beta, 2026-02-12, 0d
    FULL LAUNCH                     :milestone, launch, 2026-03-26, 0d
    100 USERS                       :milestone, users, 2026-04-23, 0d
```

---

## 5. Feature Completion Matrix

### Module Status Overview

```mermaid
pie title "Feature Completion Status"
    "✅ Complete (3)" : 3
    "🟡 Backend Only (13)" : 13
    "⚠️ Stubbed AI (5)" : 5
    "⚠️ Partial OAuth (4)" : 4
```

### Detailed Feature Status

| Module | Feature | Backend | Frontend | Testing | Status |
|--------|---------|---------|----------|---------|--------|
| **App Management** |
| | Apps CRUD | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | Environment Vars | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | Repositories | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | Deployments | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| **Blue Ocean Strategy** |
| | Analysis CRUD | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | Competitor Tracking | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | ERRC Framework | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | Strategy Canvas | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | AI Analysis | ⚠️ Stubbed | ⚠️ Stubbed | ❌ 0% | 🟡 Mock Data |
| **Marketing - Build in Public** |
| | DevLogs | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | AI DevLog Gen | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| **Marketing - Distribution** |
| | Social Scheduler | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | ASO Keywords | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | Email Campaigns | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| **Marketing - Engagement** |
| | Community Dashboard | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | Comment Sentiment | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | Vibe Check | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| **Marketing - Growth** |
| | Waitlist | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | Referral Programs | ✅ 100% | ✅ 100% | ❌ 0% | 🟢 Working |
| | UGC Gallery | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| **Marketing - Monetization** |
| | Pricing/Offers | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | Recovery Emails | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| **Marketing - Partnerships** |
| | Creator CRM | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | Press Kit Generator | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | Cross-Promo Network | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| **Marketing - Analytics** |
| | North Star Metrics | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | LTV Calculator | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |
| | Ad Campaign Tracker | ✅ 100% | ❌ 0% | ❌ 0% | 🔴 Backend Only |

**Legend:**
- 🟢 **Working:** Feature is production-ready
- 🟡 **Partial:** Feature has issues or stubs (mock data)
- 🔴 **Backend Only:** Backend complete, UI not built
- ⚫ **Not Started:** No implementation

---

## 6. Production Readiness Dashboard

```mermaid
%%{init: {'theme':'base'}}%%
graph TD
    subgraph "Production Readiness: 70%"
        Backend["Backend<br/>✅ 95%"]
        Frontend["Frontend<br/>⚠️ 40%"]
        DevOps["DevOps<br/>❌ 20%"]
        Testing["Testing<br/>❌ 0%"]
        Docs["Documentation<br/>✅ 85%"]
        Security["Security<br/>⚠️ 75%"]
    end

    style Backend fill:#d4f1d4
    style Frontend fill:#fff4cc
    style DevOps fill:#ffd4d4
    style Testing fill:#ffd4d4
    style Docs fill:#d4f1d4
    style Security fill:#fff4cc
```

### Category Breakdown

**Backend: 95%** ✅
- ✅ 3,778 lines of server actions
- ✅ 830 lines of validation schemas
- ✅ 1,815 lines of database migrations
- ✅ 34+ tables with RLS
- ⚠️ 5 AI functions stubbed
- ⚠️ 4 external API stubs

**Frontend: 40%** ⚠️
- ✅ Core infrastructure (layouts, navigation)
- ✅ Component library (28 components)
- ✅ 3 complete features (DevLogs, Waitlist, Referrals)
- ❌ 13 marketing features need UI forms
- ❌ Data visualization components
- ⚠️ Mobile responsive (not tested)

**DevOps: 20%** ❌
- ✅ Modern tech stack
- ❌ No testing infrastructure
- ❌ No CI/CD pipeline
- ❌ No production deployment config
- ❌ No monitoring/observability
- ❌ No Docker/containerization

**Documentation: 85%** ✅
- ✅ 4 comprehensive guides (1,364 lines)
- ✅ Setup instructions (QUICKSTART.md)
- ✅ Feature documentation
- ✅ Database schema docs
- ❌ API documentation (no Swagger)
- ❌ Deployment guide
- ❌ Contributing guidelines

**Security: 75%** ⚠️
- ✅ Clerk authentication
- ✅ Supabase RLS on all tables
- ✅ User ownership verification
- ✅ Encrypted token storage
- ✅ Double opt-in email verification
- ❌ No rate limiting
- ❌ No CSRF protection
- ⚠️ Build config issue

**Testing: 0%** ❌
- ❌ Zero test files
- ❌ No unit tests
- ❌ No integration tests
- ❌ No E2E tests
- ❌ No load tests

---

## 7. Critical Path to Beta Launch

```mermaid
graph LR
    Start([Today]) --> P1_1[Fix ignoreBuildErrors]
    P1_1 --> P1_2[Create .env.example]
    P1_2 --> P1_3[Setup Sentry]
    P1_3 --> P1_4[Rate Limiting]
    P1_4 --> P1_5[Complete Blue Ocean AI]
    P1_5 --> P1_6[E2E Tests]
    P1_6 --> Beta([BETA LAUNCH<br/>Week 3])

    style P1_1 fill:#ffd4d4
    style P1_2 fill:#ffd4d4
    style P1_3 fill:#ffd4d4
    style P1_4 fill:#ffd4d4
    style P1_5 fill:#ffd4d4
    style P1_6 fill:#ffd4d4
    style Beta fill:#d4f1d4
```

**Critical Blockers (Must Complete):**
1. ❌ Fix `ignoreBuildErrors: true` → Set to `false`, fix type errors
2. ❌ Create `.env.example` → Document all required env vars
3. ❌ Setup Sentry → Error tracking and monitoring
4. ❌ Rate Limiting → Protect public endpoints from abuse
5. ❌ Complete Blue Ocean AI → Remove mock data (5 functions)
6. ❌ E2E Tests → 15-20 critical path tests

**Timeline:** 2-3 weeks to Beta Launch

---

## 8. Technical Debt Heatmap

```mermaid
quadrantChart
    title Technical Debt Priority Matrix
    x-axis Low Impact --> High Impact
    y-axis Easy Fix --> Hard Fix
    quadrant-1 Plan for Later
    quadrant-2 Do Next
    quadrant-3 Quick Wins
    quadrant-4 Critical (Do Now)

    "ignoreBuildErrors": [0.9, 0.2]
    ".env.example missing": [0.6, 0.1]
    "No rate limiting": [0.9, 0.3]
    "No error tracking": [0.9, 0.2]
    "Blue Ocean AI stubs": [0.8, 0.6]
    "No testing": [0.9, 0.8]
    "13 UI forms missing": [0.8, 0.9]
    "No CI/CD": [0.7, 0.4]
    "External API stubs": [0.5, 0.5]
    "No Docker config": [0.4, 0.3]
```

**Quadrant Breakdown:**
- **Quadrant 4 (Critical - Do Now):** ignoreBuildErrors, rate limiting, error tracking, .env.example
- **Quadrant 2 (Do Next):** Blue Ocean AI stubs, CI/CD, testing infrastructure
- **Quadrant 1 (Plan for Later):** 13 UI forms (high effort)
- **Quadrant 3 (Quick Wins):** Docker config, external API stubs

---

## 9. Database Schema Overview

```mermaid
erDiagram
    USERS ||--o{ APPS : owns
    USERS ||--o{ BLUE_OCEAN_ANALYSES : creates
    USERS ||--o{ MARKETING_APPS : manages

    APPS ||--o{ ENV_VARS : has
    APPS ||--o{ REPOSITORIES : links
    APPS ||--o{ DEPLOYMENTS : tracks

    BLUE_OCEAN_ANALYSES ||--o{ COMPETITORS : includes
    BLUE_OCEAN_ANALYSES ||--o{ ERRC_ITEMS : defines
    BLUE_OCEAN_ANALYSES ||--o{ PAIN_POINTS : identifies
    BLUE_OCEAN_ANALYSES ||--o{ STRATEGY_CANVAS_POINTS : visualizes

    MARKETING_APPS ||--o{ DEVLOGS : publishes
    MARKETING_APPS ||--o{ SOCIAL_POSTS : schedules
    MARKETING_APPS ||--o{ EMAIL_CAMPAIGNS : sends
    MARKETING_APPS ||--o{ WAITLIST_ENTRIES : collects
    MARKETING_APPS ||--o{ REFERRAL_PROGRAMS : runs
    MARKETING_APPS ||--o{ COMMENTS : aggregates
```

**Statistics:**
- **34+ tables** across 3 modules
- **1,815 lines** of SQL migrations
- **Row Level Security** (RLS) enabled on all tables
- **Proper foreign keys** with cascade deletes
- **Performance indexes** on frequently queried fields

---

## 10. AI Integration Flow

```mermaid
flowchart LR
    Request[User Request] --> Check{Check Cache}
    Check -->|Hit| Return[Return Cached]
    Check -->|Miss| Claude[Anthropic Claude]
    Claude -->|Success| Cache[Store in Cache]
    Claude -->|Rate Limit| OpenAI[OpenAI Fallback]
    Claude -->|Error| OpenAI
    OpenAI -->|Success| Cache
    OpenAI -->|Error| Error[Show Error]
    Cache --> Return

    style Request fill:#e1f5ff
    style Claude fill:#fff4cc
    style OpenAI fill:#fff4cc
    style Cache fill:#d4f1d4
    style Error fill:#ffd4d4
```

**Current Status:**
- **Marketing AI:** ✅ All 10 functions working with Claude
- **Blue Ocean AI:** ⚠️ 5 functions return mock data (need implementation)
- **Caching:** ❌ Not implemented (recommended: 1hr TTL)
- **Fallback:** ⚠️ OpenAI configured but not tested

---

## 11. OAuth Integration Status

```mermaid
graph TB
    subgraph "OAuth Platforms"
        Twitter[🐦 Twitter/X<br/>⚠️ Partial]
        Reddit[🔴 Reddit<br/>❌ Stub]
        TikTok[📱 TikTok<br/>⚠️ Partial]
        Discord[💬 Discord<br/>⚠️ Config Needed]
        YouTube[▶️ YouTube<br/>⚠️ API Key Needed]
    end

    subgraph "Missing Components"
        Callbacks[OAuth Callback Routes<br/>/api/auth/[platform]/callback]
        Tokens[Token Refresh Logic]
        Error[Error Handling]
    end

    Twitter -.-> Callbacks
    Reddit -.-> Callbacks
    TikTok -.-> Callbacks

    Twitter -.-> Tokens
    TikTok -.-> Tokens

    style Twitter fill:#fff4cc
    style Reddit fill:#ffd4d4
    style TikTok fill:#fff4cc
    style Discord fill:#fff4cc
    style YouTube fill:#fff4cc
    style Callbacks fill:#ffd4d4
```

**Required Work:**
- Twitter: OAuth callback route + token refresh
- Reddit: Full snoowrap integration + OAuth callback
- TikTok: OAuth callback route + video upload
- Discord: Webhook configuration
- YouTube: API key setup + comment fetching

**Estimated Effort:** 2-3 days for all platforms

---

## Summary

These diagrams illustrate:

1. **System Architecture** - How all components interact
2. **Data Flows** - Key feature workflows
3. **Module Structure** - Three core modules and their relationships
4. **Launch Timeline** - Path to beta and full launch
5. **Feature Status** - Completion matrix for all features
6. **Readiness Dashboard** - Production readiness by category
7. **Critical Path** - Blockers preventing launch
8. **Technical Debt** - Priority matrix for fixes
9. **Database Schema** - Table relationships
10. **AI Integration** - Claude + OpenAI fallback flow
11. **OAuth Status** - Platform integration status

**Use these diagrams to:**
- Communicate architecture to stakeholders
- Track progress toward launch
- Prioritize development work
- Understand system complexity
- Plan resource allocation
