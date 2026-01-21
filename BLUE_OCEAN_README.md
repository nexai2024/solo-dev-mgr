# Blue Ocean Strategy Module

A comprehensive Blue Ocean Strategy implementation for solo developers to discover untapped market opportunities and create differentiated products.

## Overview

The Blue Ocean Strategy module helps indie developers:
- Analyze competitive market landscapes
- Identify user pain points from real feedback
- Apply the Four Actions Framework (ERRC)
- Visualize strategy with interactive canvases
- Calculate cost-value trade-offs
- Build implementation roadmaps

## Features Implemented

### Core Functionality
✅ **Analysis Management**
- Create, view, update, and delete Blue Ocean analyses
- Link analyses to existing apps
- Track analysis status (draft, in progress, completed, archived)
- Industry categorization

✅ **Competitor Analysis**
- Add and track competitors
- Store competitor features, strengths, weaknesses
- Market positioning (Leader, Challenger, Niche)
- AI-powered competitor analysis (stub ready for expansion)

✅ **ERRC Matrix (Four Actions Framework)**
- Eliminate: Factors to remove
- Reduce: Factors to minimize
- Raise: Factors to amplify
- Create: New factors to introduce
- AI-powered ERRC suggestions (stub ready for expansion)

✅ **Strategy Canvas**
- Configure value curve factors
- Track your product's values vs competitors
- Industry baseline comparison
- Interactive visualization ready for Recharts implementation

✅ **Pain Points Discovery**
- Manual pain point entry
- Reddit API integration (stub)
- Product Hunt API integration (stub)
- App Store review scraping (stub)
- Sentiment analysis with AI (stub)

✅ **Value Cost Calculator**
- Estimate development hours
- Track perceived value scores (1-10)
- Differentiation scoring
- Priority management (high/medium/low)
- Action type tagging (ERRC mapping)

✅ **Implementation Roadmap**
- Phase-based planning
- Success metrics tracking
- Pivot logging
- Roadmap visualization

✅ **User Profile**
- Skill tracking
- Interest management
- Experience level
- Niche configuration

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Clerk
- **AI**: Anthropic Claude (primary), OpenAI (fallback) - stubs ready
- **Charting**: Recharts (installed, ready for canvas visualization)
- **External APIs**: Reddit, Product Hunt, App Store scrapers (stubs ready)

## Database Schema

9 new tables added:
1. `user_profiles` - Developer niche and skills
2. `blue_ocean_analyses` - Main analysis records
3. `competitors` - Competitor tracking
4. `errc_matrices` - ERRC framework data
5. `strategy_canvas_configs` - Canvas visualizations
6. `pain_points` - User feedback aggregation
7. `value_cost_estimates` - Feature cost-value analysis
8. `implementation_roadmaps` - Execution planning
9. `api_cache` - External API response caching

All tables include:
- Row Level Security (RLS) policies
- Proper indexes for performance
- Cascade delete relationships
- Updated_at triggers

## Setup Instructions

### 1. Install Dependencies

Already installed via package.json:
```bash
npm install
```

Required packages:
- recharts
- react-draggable
- @dnd-kit/core & @dnd-kit/sortable
- @anthropic-ai/sdk
- openai
- app-store-scraper
- google-play-scraper
- cheerio
- pdfkit
- sharp

### 2. Database Migration

Run the Blue Ocean schema migration in your Supabase dashboard:

```bash
# In Supabase SQL Editor, run:
/workspace/cmknh79x40002ikohd4c3chjy/solo-dev-mgr/supabase_blue_ocean_migration.sql
```

This will create all 9 tables with proper RLS policies.

### 3. Environment Variables

Copy the example file and add your API keys:

```bash
cp .env.example .env.local
```

Required variables:
- `ANTHROPIC_API_KEY` - For AI analysis (get from anthropic.com)
- `OPENAI_API_KEY` - For AI fallback (get from openai.com)

Optional variables:
- `PRODUCT_HUNT_API_TOKEN` - For Product Hunt integration
- `AI_DAILY_LIMIT` - Rate limiting (default: 50)

### 4. Access the Module

Navigate to: `http://localhost:3000/blue-ocean`

## Usage Guide

### Creating an Analysis

1. Click "New Analysis" on the dashboard
2. Enter analysis name and description
3. Select industry category
4. Optionally link to existing app
5. Click "Create Analysis"

### Working with Competitors

1. Open an analysis
2. Go to "Competitors" tab
3. Add competitors with:
   - Name and description
   - Website URL
   - Features and values
   - Market position
   - Strengths and weaknesses

### Building ERRC Matrix

1. Navigate to "ERRC Matrix" tab
2. Add factors to each quadrant:
   - **Eliminate**: What to remove completely
   - **Reduce**: What to minimize
   - **Raise**: What to amplify above industry standard
   - **Create**: What new value to offer

### Discovering Pain Points

Currently supports manual entry. To expand:
1. Implement Reddit API integration in `/lib/actions/external-apis.actions.ts`
2. Add Product Hunt GraphQL queries
3. Enable app store scrapers

### Value Cost Analysis

1. Go to "Value Calculator" tab
2. Add features with:
   - Estimated development hours
   - Estimated cost
   - Perceived value score (1-10)
   - Differentiation score (1-10)
   - Priority level

## Extending the Module

### Implementing Real AI Integration

Current AI actions are stubs. To implement:

1. **Enable Sentiment Analysis** (`lib/actions/ai.actions.ts`):
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const analyzePainPointSentiment = async (text: string) => {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Analyze sentiment: "${text}"`
    }]
  });
  // Parse response and return structured data
};
```

2. **Enable ERRC Suggestions**:
Pass competitor and pain point data to Claude for strategic recommendations.

3. **Enable Opportunity Discovery**:
Use user profile data to generate personalized market opportunities.

### Implementing External APIs

1. **Reddit Integration**: Use fetch to call Reddit JSON API
2. **Product Hunt**: Implement GraphQL queries with auth token
3. **App Stores**: Use installed scraper packages

### Adding Strategy Canvas Visualization

The data structure is ready. Add Recharts components:

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

// Transform canvas.factors and canvas.your_curve into chart data
const data = canvas.factors.map((factor, idx) => ({
  factor,
  you: canvas.your_curve[idx],
  baseline: canvas.industry_baseline?.[idx] || 5,
}));
```

## Architecture

### Server Actions Pattern
All data operations use Next.js Server Actions following the existing pattern:
- Authentication via Clerk's `auth()`
- Database access via Supabase with RLS
- Validation via Zod schemas
- Type safety with TypeScript

### File Structure
```
app/
  blue-ocean/
    page.tsx                    # Dashboard
    BlueOceanClient.tsx        # Dashboard client component
    new/
      page.tsx                  # New analysis wizard
      NewAnalysisClient.tsx    # Wizard client component
    [id]/
      page.tsx                  # Analysis detail
      AnalysisDetailClient.tsx # Detail client component

lib/
  actions/
    blueocean.actions.ts       # Core CRUD operations
    ai.actions.ts              # AI integration stubs
    external-apis.actions.ts   # External API stubs
    profile.actions.ts         # User profile management
  validations/
    blueocean.ts               # Zod schemas

types/
  index.d.ts                   # TypeScript type definitions
```

### Security

- Row Level Security (RLS) enforces user isolation
- All server actions verify authentication
- Ownership checks prevent unauthorized access
- Input validation via Zod schemas
- API keys stored in environment variables

## Next Steps for Full Implementation

### High Priority
1. **Implement AI Integration**
   - Connect Anthropic Claude API
   - Add OpenAI fallback logic
   - Create structured prompts for each AI feature

2. **Add Strategy Canvas Visualization**
   - Build Recharts components
   - Add drag-and-drop factor editing
   - Implement competitor curve overlays

3. **Enable External API Discovery**
   - Implement Reddit API calls
   - Add Product Hunt GraphQL client
   - Configure app store scrapers

### Medium Priority
4. **Build Remaining UI Pages**
   - Opportunity Discovery page
   - User Profile page
   - Templates library
   - Export functionality

5. **Add Advanced Features**
   - What-If mode calculator
   - AI cost estimation
   - Roadmap visualization
   - PDF export

### Low Priority
6. **Polish & Optimization**
   - Mobile responsiveness
   - Loading states
   - Error handling
   - Performance optimization

## API Documentation

### Key Server Actions

#### Analysis Operations
- `getUserAnalyses()` - Get all user's analyses
- `getAnalysisById(id)` - Get single analysis
- `createAnalysis(input)` - Create new analysis
- `updateAnalysis(id, input)` - Update analysis
- `deleteAnalysis(id)` - Delete analysis

#### Competitor Operations
- `getCompetitors(analysisId)` - Get all competitors
- `createCompetitor(input)` - Add competitor
- `updateCompetitor(id, input)` - Update competitor
- `deleteCompetitor(id)` - Remove competitor

#### ERRC Matrix
- `getERRCMatrix(analysisId)` - Get ERRC data
- `updateERRCMatrix(input)` - Update ERRC matrix

#### Strategy Canvas
- `getStrategyCanvas(analysisId)` - Get canvas config
- `updateStrategyCanvas(input)` - Update canvas

#### Pain Points
- `getPainPoints(analysisId)` - Get all pain points
- `createPainPoint(input)` - Add manual pain point
- `deletePainPoint(id)` - Remove pain point

#### Value Estimates
- `getValueEstimates(analysisId)` - Get all estimates
- `createValueEstimate(input)` - Add feature estimate
- `updateValueEstimate(id, input)` - Update estimate
- `deleteValueEstimate(id)` - Remove estimate

#### Roadmap
- `getRoadmap(analysisId)` - Get implementation roadmap
- `updateRoadmap(input)` - Update roadmap

#### Profile
- `getUserProfile()` - Get user profile (creates if missing)
- `updateUserProfile(input)` - Update profile
- `hasCompletedProfile()` - Check if profile is complete

## Support

For issues or questions about the Blue Ocean module:
1. Check this README for setup instructions
2. Review the planning document in `/workspace/planning.md`
3. Examine the research document in `/workspace/research.md`

## License

Same license as the parent solo-dev-mgr project.
