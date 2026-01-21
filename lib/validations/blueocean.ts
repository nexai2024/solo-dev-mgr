import { z } from 'zod';

// Analysis validation
export const createAnalysisSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional().nullable(),
  industry: z.string().min(1, 'Industry is required').optional().nullable(),
  app_id: z.string().uuid('Invalid app ID').optional().nullable(),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']).default('draft'),
});

export const updateAnalysisSchema = createAnalysisSchema.partial().omit({ app_id: true });

// Competitor validation
export const competitorFeatureSchema = z.object({
  name: z.string().min(1, 'Feature name is required'),
  value: z.number().min(0).max(10, 'Feature value must be between 0 and 10'),
});

export const createCompetitorSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
  name: z.string().min(1, 'Competitor name is required').max(100, 'Name must be at most 100 characters'),
  url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  description: z.string().max(500, 'Description must be at most 500 characters').optional().nullable(),
  features: z.array(competitorFeatureSchema).default([]),
  pricing_model: z.enum(['Freemium', 'Subscription', 'One-time', 'Free']).optional().nullable(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  market_position: z.enum(['Leader', 'Challenger', 'Niche']).optional().nullable(),
});

export const updateCompetitorSchema = createCompetitorSchema.partial().omit({ analysis_id: true });

// ERRC Matrix validation
export const errcFactorSchema = z.object({
  factor: z.string().min(1, 'Factor is required').max(200, 'Factor must be at most 200 characters'),
  reasoning: z.string().min(1, 'Reasoning is required').max(1000, 'Reasoning must be at most 1000 characters'),
});

export const updateERRCMatrixSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
  eliminate: z.array(errcFactorSchema).default([]),
  reduce: z.array(errcFactorSchema).default([]),
  raise: z.array(errcFactorSchema).default([]),
  create: z.array(errcFactorSchema).default([]),
  template_used: z.string().optional().nullable(),
});

// Strategy Canvas validation
export const competitorCurveSchema = z.object({
  competitor_id: z.string().uuid('Invalid competitor ID'),
  values: z.array(z.number().min(0).max(10)),
});

export const updateStrategyCanvasSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
  factors: z.array(z.string().min(1)).max(8, 'Maximum 8 factors allowed'),
  your_curve: z.array(z.number().min(0).max(10)),
  competitor_curves: z.array(competitorCurveSchema).default([]),
  industry_baseline: z.array(z.number().min(0).max(10)).optional().nullable(),
}).refine((data) => data.your_curve.length === data.factors.length, {
  message: 'Your curve values must match the number of factors',
  path: ['your_curve'],
});

// Pain Point validation
export const createPainPointSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
  source: z.enum(['reddit', 'producthunt', 'appstore', 'playstore', 'manual']),
  source_url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  content: z.string().min(1, 'Content is required'),
});

// Value Cost Estimate validation
export const createValueEstimateSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
  feature_name: z.string().min(1, 'Feature name is required').max(200, 'Feature name must be at most 200 characters'),
  estimated_dev_hours: z.number().min(0, 'Hours must be positive').optional().nullable(),
  estimated_cost_usd: z.number().min(0, 'Cost must be positive').optional().nullable(),
  perceived_value_score: z.number().min(1).max(10).optional().nullable(),
  differentiation_score: z.number().min(1).max(10).optional().nullable(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  action_type: z.enum(['eliminate', 'reduce', 'raise', 'create', 'n/a']).optional().nullable(),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional().nullable(),
});

export const updateValueEstimateSchema = createValueEstimateSchema.partial().omit({ analysis_id: true });

// Roadmap validation
export const roadmapPhaseSchema = z.object({
  phase: z.string().min(1, 'Phase name is required'),
  features: z.array(z.string()),
  duration: z.string().min(1, 'Duration is required'),
});

export const successMetricSchema = z.object({
  metric: z.string().min(1, 'Metric name is required'),
  target: z.string().min(1, 'Target is required'),
  type: z.enum(['blue_ocean', 'vanity']),
});

export const pivotEntrySchema = z.object({
  date: z.string(),
  what_changed: z.string().min(1, 'What changed is required'),
  reason: z.string().min(1, 'Reason is required'),
  impact: z.string().optional(),
});

export const updateRoadmapSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
  phases: z.array(roadmapPhaseSchema),
  success_metrics: z.array(successMetricSchema).default([]),
  pivot_log: z.array(pivotEntrySchema).default([]),
});

// User Profile validation
export const updateUserProfileSchema = z.object({
  primary_niche: z.string().optional().nullable(),
  skills: z.array(z.string()).max(20, 'Maximum 20 skills allowed').default([]),
  interests: z.array(z.string()).max(10, 'Maximum 10 interests allowed').default([]),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  preferences: z.record(z.any()).default({}),
});

// Discovery Config validation
export const discoveryConfigSchema = z.object({
  reddit: z.object({
    subreddits: z.array(z.string()),
    keywords: z.array(z.string()),
    limit: z.number().min(10).max(100).default(50),
  }).optional(),
  producthunt: z.object({
    category: z.string(),
    keywords: z.array(z.string()),
  }).optional(),
  appstore: z.object({
    ios_app_id: z.string().optional(),
    android_app_id: z.string().optional(),
    country: z.string().length(2, 'Country code must be 2 characters').default('us'),
    limit: z.number().min(10).max(500).default(100),
  }).optional(),
}).refine((data) => data.reddit || data.producthunt || data.appstore, {
  message: 'At least one discovery source must be configured',
});
