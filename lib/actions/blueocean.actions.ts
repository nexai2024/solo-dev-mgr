"use server";

import {
  BlueOceanAnalysis,
  CreateAnalysisInput,
  UpdateAnalysisInput,
  Competitor,
  CreateCompetitorInput,
  UpdateCompetitorInput,
  ERRCMatrix,
  StrategyCanvasConfig,
  PainPoint,
  CreatePainPointInput,
  ValueCostEstimate,
  CreateValueEstimateInput,
  UpdateValueEstimateInput,
  ImplementationRoadmap,
  AnalysisSummary,
} from "@/types";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";
import {
  createAnalysisSchema,
  updateAnalysisSchema,
  createCompetitorSchema,
  updateCompetitorSchema,
  updateERRCMatrixSchema,
  updateStrategyCanvasSchema,
  createPainPointSchema,
  createValueEstimateSchema,
  updateValueEstimateSchema,
  updateRoadmapSchema,
} from "../validations/blueocean";

// ========== ANALYSIS OPERATIONS ==========

// Get all analyses for current user with computed fields
export const getUserAnalyses = async (): Promise<AnalysisSummary[]> => {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createSupabaseClient();

  const { data: analyses, error } = await supabase
    .from("blue_ocean_analyses")
    .select(
      `
      *,
      competitors:competitors(count),
      pain_points:pain_points(count),
      strategy_canvas_configs(id),
      errc_matrices(id)
    `
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (analyses || []).map((analysis: any) => ({
    ...analysis,
    competitor_count: analysis.competitors?.[0]?.count || 0,
    pain_point_count: analysis.pain_points?.[0]?.count || 0,
    canvas_exists: !!analysis.strategy_canvas_configs,
    errc_exists: !!analysis.errc_matrices,
  })) as AnalysisSummary[];
};

// Get single analysis by ID
export const getAnalysisById = async (id: string): Promise<BlueOceanAnalysis | null> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("blue_ocean_analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data as BlueOceanAnalysis;
};

// Create new analysis
export const createAnalysis = async (input: CreateAnalysisInput): Promise<BlueOceanAnalysis> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validated = createAnalysisSchema.parse(input);
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("blue_ocean_analyses")
    .insert({ ...validated, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Create default ERRC matrix
  await supabase.from("errc_matrices").insert({
    analysis_id: data.id,
    eliminate: [],
    reduce: [],
    raise: [],
    create: [],
  });

  // Create default strategy canvas
  await supabase.from("strategy_canvas_configs").insert({
    analysis_id: data.id,
    factors: ["Price", "Ease of Use", "Features", "Support"],
    your_curve: [5, 5, 5, 5],
    competitor_curves: [],
  });

  return data as BlueOceanAnalysis;
};

// Update analysis
export const updateAnalysis = async (id: string, input: UpdateAnalysisInput): Promise<BlueOceanAnalysis> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validated = updateAnalysisSchema.parse(input);
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("blue_ocean_analyses")
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") throw new Error("Analysis not found or unauthorized");
    throw new Error(error.message);
  }

  return data as BlueOceanAnalysis;
};

// Delete analysis (cascade deletes children)
export const deleteAnalysis = async (id: string): Promise<void> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("blue_ocean_analyses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};

// ========== COMPETITOR OPERATIONS ==========

// Get competitors for an analysis
export const getCompetitors = async (analysisId: string): Promise<Competitor[]> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", analysisId)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("competitors")
    .select("*")
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data as Competitor[];
};

// Create competitor
export const createCompetitor = async (input: CreateCompetitorInput): Promise<Competitor> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validated = createCompetitorSchema.parse(input);
  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", validated.analysis_id)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("competitors")
    .insert(validated)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as Competitor;
};

// Update competitor
export const updateCompetitor = async (id: string, input: UpdateCompetitorInput): Promise<Competitor> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validated = updateCompetitorSchema.parse(input);
  const supabase = createSupabaseClient();

  // Verify ownership through analysis
  const { data: competitor } = await supabase
    .from("competitors")
    .select("analysis_id, blue_ocean_analyses!inner(user_id)")
    .eq("id", id)
    .single();

  if (!competitor || (competitor as any).blue_ocean_analyses.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("competitors")
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as Competitor;
};

// Delete competitor
export const deleteCompetitor = async (id: string): Promise<void> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership through analysis
  const { data: competitor } = await supabase
    .from("competitors")
    .select("analysis_id, blue_ocean_analyses!inner(user_id)")
    .eq("id", id)
    .single();

  if (!competitor || (competitor as any).blue_ocean_analyses.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { error } = await supabase.from("competitors").delete().eq("id", id);

  if (error) throw new Error(error.message);
};

// ========== ERRC MATRIX OPERATIONS ==========

// Get ERRC matrix for analysis
export const getERRCMatrix = async (analysisId: string): Promise<ERRCMatrix | null> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", analysisId)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("errc_matrices")
    .select("*")
    .eq("analysis_id", analysisId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data as ERRCMatrix;
};

// Update ERRC matrix
export const updateERRCMatrix = async (input: Partial<ERRCMatrix>): Promise<ERRCMatrix> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  if (!input.analysis_id) throw new Error("Analysis ID is required");

  const validated = updateERRCMatrixSchema.parse(input);
  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", validated.analysis_id)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("errc_matrices")
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq("analysis_id", validated.analysis_id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as ERRCMatrix;
};

// ========== STRATEGY CANVAS OPERATIONS ==========

// Get strategy canvas for analysis
export const getStrategyCanvas = async (analysisId: string): Promise<StrategyCanvasConfig | null> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", analysisId)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("strategy_canvas_configs")
    .select("*")
    .eq("analysis_id", analysisId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data as StrategyCanvasConfig;
};

// Update strategy canvas
export const updateStrategyCanvas = async (input: Partial<StrategyCanvasConfig>): Promise<StrategyCanvasConfig> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  if (!input.analysis_id) throw new Error("Analysis ID is required");

  const validated = updateStrategyCanvasSchema.parse(input);
  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", validated.analysis_id)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("strategy_canvas_configs")
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq("analysis_id", validated.analysis_id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as StrategyCanvasConfig;
};

// ========== PAIN POINTS OPERATIONS ==========

// Get pain points for analysis
export const getPainPoints = async (analysisId: string): Promise<PainPoint[]> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", analysisId)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("pain_points")
    .select("*")
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data as PainPoint[];
};

// Create manual pain point
export const createPainPoint = async (input: CreatePainPointInput): Promise<PainPoint> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validated = createPainPointSchema.parse(input);
  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", validated.analysis_id)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("pain_points")
    .insert({ ...validated, frequency: 1 })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as PainPoint;
};

// Delete pain point
export const deletePainPoint = async (id: string): Promise<void> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership through analysis
  const { data: painPoint } = await supabase
    .from("pain_points")
    .select("analysis_id, blue_ocean_analyses!inner(user_id)")
    .eq("id", id)
    .single();

  if (!painPoint || (painPoint as any).blue_ocean_analyses.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { error } = await supabase.from("pain_points").delete().eq("id", id);

  if (error) throw new Error(error.message);
};

// ========== VALUE COST ESTIMATES OPERATIONS ==========

// Get value estimates for analysis
export const getValueEstimates = async (analysisId: string): Promise<ValueCostEstimate[]> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", analysisId)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("value_cost_estimates")
    .select("*")
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data as ValueCostEstimate[];
};

// Create value estimate
export const createValueEstimate = async (input: CreateValueEstimateInput): Promise<ValueCostEstimate> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validated = createValueEstimateSchema.parse(input);
  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", validated.analysis_id)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("value_cost_estimates")
    .insert(validated)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as ValueCostEstimate;
};

// Update value estimate
export const updateValueEstimate = async (id: string, input: UpdateValueEstimateInput): Promise<ValueCostEstimate> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validated = updateValueEstimateSchema.parse(input);
  const supabase = createSupabaseClient();

  // Verify ownership through analysis
  const { data: estimate } = await supabase
    .from("value_cost_estimates")
    .select("analysis_id, blue_ocean_analyses!inner(user_id)")
    .eq("id", id)
    .single();

  if (!estimate || (estimate as any).blue_ocean_analyses.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("value_cost_estimates")
    .update(validated)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as ValueCostEstimate;
};

// Delete value estimate
export const deleteValueEstimate = async (id: string): Promise<void> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership through analysis
  const { data: estimate } = await supabase
    .from("value_cost_estimates")
    .select("analysis_id, blue_ocean_analyses!inner(user_id)")
    .eq("id", id)
    .single();

  if (!estimate || (estimate as any).blue_ocean_analyses.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { error } = await supabase.from("value_cost_estimates").delete().eq("id", id);

  if (error) throw new Error(error.message);
};

// ========== ROADMAP OPERATIONS ==========

// Get roadmap for analysis
export const getRoadmap = async (analysisId: string): Promise<ImplementationRoadmap | null> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", analysisId)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  const { data, error } = await supabase
    .from("implementation_roadmaps")
    .select("*")
    .eq("analysis_id", analysisId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data as ImplementationRoadmap;
};

// Update roadmap
export const updateRoadmap = async (input: Partial<ImplementationRoadmap>): Promise<ImplementationRoadmap> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  if (!input.analysis_id) throw new Error("Analysis ID is required");

  const validated = updateRoadmapSchema.parse(input);
  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: analysis } = await supabase
    .from("blue_ocean_analyses")
    .select("user_id")
    .eq("id", validated.analysis_id)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    throw new Error("Access denied");
  }

  // Check if roadmap exists
  const { data: existing } = await supabase
    .from("implementation_roadmaps")
    .select("id")
    .eq("analysis_id", validated.analysis_id)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("implementation_roadmaps")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("analysis_id", validated.analysis_id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ImplementationRoadmap;
  } else {
    // Create new
    const { data, error } = await supabase
      .from("implementation_roadmaps")
      .insert(validated)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ImplementationRoadmap;
  }
};
