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
