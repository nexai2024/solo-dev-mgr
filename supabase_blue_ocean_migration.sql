-- Blue Ocean Strategy Module Database Schema
-- Extends the solo-dev-mgr with market analysis and Blue Ocean Strategy features

-- Table: user_profiles
-- Stores developer niche, skillset, and preferences for AI recommendations
CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" TEXT PRIMARY KEY,
    "primary_niche" TEXT,
    "skills" JSONB DEFAULT '[]'::JSONB,
    "interests" JSONB DEFAULT '[]'::JSONB,
    "experience_level" TEXT DEFAULT 'intermediate' CHECK ("experience_level" IN ('beginner', 'intermediate', 'advanced')),
    "preferences" JSONB DEFAULT '{}'::JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: blue_ocean_analyses
-- Stores the main analysis/project record
CREATE TABLE IF NOT EXISTS "public"."blue_ocean_analyses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "app_id" UUID REFERENCES "public"."apps"("id") ON DELETE SET NULL,
    "name" TEXT NOT NULL CHECK (LENGTH("name") >= 2 AND LENGTH("name") <= 100),
    "description" TEXT CHECK (LENGTH("description") <= 1000),
    "industry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'in_progress', 'completed', 'archived')),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: competitors
-- Stores competitor information for comparison
CREATE TABLE IF NOT EXISTS "public"."competitors" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "analysis_id" UUID NOT NULL REFERENCES "public"."blue_ocean_analyses"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL CHECK (LENGTH("name") >= 1 AND LENGTH("name") <= 100),
    "url" TEXT,
    "description" TEXT CHECK (LENGTH("description") <= 500),
    "features" JSONB DEFAULT '[]'::JSONB,
    "pricing_model" TEXT CHECK ("pricing_model" IS NULL OR "pricing_model" IN ('Freemium', 'Subscription', 'One-time', 'Free')),
    "strengths" JSONB DEFAULT '[]'::JSONB,
    "weaknesses" JSONB DEFAULT '[]'::JSONB,
    "market_position" TEXT CHECK ("market_position" IS NULL OR "market_position" IN ('Leader', 'Challenger', 'Niche')),
    "ai_analyzed" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: errc_matrices
-- Stores the Eliminate/Reduce/Raise/Create framework data
CREATE TABLE IF NOT EXISTS "public"."errc_matrices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "analysis_id" UUID NOT NULL REFERENCES "public"."blue_ocean_analyses"("id") ON DELETE CASCADE,
    "eliminate" JSONB DEFAULT '[]'::JSONB,
    "reduce" JSONB DEFAULT '[]'::JSONB,
    "raise" JSONB DEFAULT '[]'::JSONB,
    "create" JSONB DEFAULT '[]'::JSONB,
    "template_used" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_errc_per_analysis" UNIQUE ("analysis_id")
);

-- Table: strategy_canvas_configs
-- Stores the Strategy Canvas line configurations
CREATE TABLE IF NOT EXISTS "public"."strategy_canvas_configs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "analysis_id" UUID NOT NULL REFERENCES "public"."blue_ocean_analyses"("id") ON DELETE CASCADE,
    "factors" JSONB NOT NULL DEFAULT '[]'::JSONB,
    "your_curve" JSONB NOT NULL DEFAULT '[]'::JSONB,
    "competitor_curves" JSONB DEFAULT '[]'::JSONB,
    "industry_baseline" JSONB DEFAULT '[]'::JSONB,
    "version" INTEGER DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_canvas_per_analysis" UNIQUE ("analysis_id")
);

-- Table: pain_points
-- Stores aggregated user pain points from external sources
CREATE TABLE IF NOT EXISTS "public"."pain_points" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "analysis_id" UUID NOT NULL REFERENCES "public"."blue_ocean_analyses"("id") ON DELETE CASCADE,
    "source" TEXT NOT NULL CHECK ("source" IN ('reddit', 'producthunt', 'appstore', 'playstore', 'manual')),
    "source_url" TEXT,
    "content" TEXT NOT NULL,
    "sentiment_score" REAL,
    "category" TEXT,
    "frequency" INTEGER DEFAULT 1,
    "ai_summary" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: value_cost_estimates
-- Stores cost-value trade-off calculations
CREATE TABLE IF NOT EXISTS "public"."value_cost_estimates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "analysis_id" UUID NOT NULL REFERENCES "public"."blue_ocean_analyses"("id") ON DELETE CASCADE,
    "feature_name" TEXT NOT NULL CHECK (LENGTH("feature_name") >= 1 AND LENGTH("feature_name") <= 200),
    "estimated_dev_hours" REAL,
    "estimated_cost_usd" REAL,
    "perceived_value_score" INTEGER CHECK ("perceived_value_score" IS NULL OR ("perceived_value_score" >= 1 AND "perceived_value_score" <= 10)),
    "differentiation_score" INTEGER CHECK ("differentiation_score" IS NULL OR ("differentiation_score" >= 1 AND "differentiation_score" <= 10)),
    "priority" TEXT DEFAULT 'medium' CHECK ("priority" IN ('high', 'medium', 'low')),
    "action_type" TEXT CHECK ("action_type" IS NULL OR "action_type" IN ('eliminate', 'reduce', 'raise', 'create', 'n/a')),
    "notes" TEXT CHECK (LENGTH("notes") <= 1000),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: implementation_roadmaps
-- Stores the prioritized implementation timeline
CREATE TABLE IF NOT EXISTS "public"."implementation_roadmaps" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "analysis_id" UUID NOT NULL REFERENCES "public"."blue_ocean_analyses"("id") ON DELETE CASCADE,
    "phases" JSONB NOT NULL DEFAULT '[]'::JSONB,
    "success_metrics" JSONB DEFAULT '[]'::JSONB,
    "pivot_log" JSONB DEFAULT '[]'::JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_roadmap_per_analysis" UNIQUE ("analysis_id")
);

-- Table: api_cache
-- Caches external API results to reduce costs and API rate limits
CREATE TABLE IF NOT EXISTS "public"."api_cache" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "cache_key" TEXT NOT NULL UNIQUE,
    "api_source" TEXT NOT NULL CHECK ("api_source" IN ('reddit', 'producthunt', 'appstore', 'playstore', 'web')),
    "query_params" JSONB NOT NULL,
    "response_data" JSONB NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS "idx_user_profiles_user_id" ON "public"."user_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_analyses_user_id" ON "public"."blue_ocean_analyses"("user_id");
CREATE INDEX IF NOT EXISTS "idx_analyses_app_id" ON "public"."blue_ocean_analyses"("app_id");
CREATE INDEX IF NOT EXISTS "idx_analyses_status" ON "public"."blue_ocean_analyses"("status");
CREATE INDEX IF NOT EXISTS "idx_analyses_updated_at" ON "public"."blue_ocean_analyses"("updated_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_competitors_analysis_id" ON "public"."competitors"("analysis_id");
CREATE INDEX IF NOT EXISTS "idx_errc_analysis_id" ON "public"."errc_matrices"("analysis_id");
CREATE INDEX IF NOT EXISTS "idx_canvas_analysis_id" ON "public"."strategy_canvas_configs"("analysis_id");
CREATE INDEX IF NOT EXISTS "idx_pain_points_analysis_id" ON "public"."pain_points"("analysis_id");
CREATE INDEX IF NOT EXISTS "idx_pain_points_source" ON "public"."pain_points"("source");
CREATE INDEX IF NOT EXISTS "idx_pain_points_category" ON "public"."pain_points"("category");
CREATE INDEX IF NOT EXISTS "idx_value_estimates_analysis_id" ON "public"."value_cost_estimates"("analysis_id");
CREATE INDEX IF NOT EXISTS "idx_roadmaps_analysis_id" ON "public"."implementation_roadmaps"("analysis_id");
CREATE INDEX IF NOT EXISTS "idx_api_cache_key" ON "public"."api_cache"("cache_key");
CREATE INDEX IF NOT EXISTS "idx_api_cache_expires" ON "public"."api_cache"("expires_at");

-- Enable Row Level Security
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."blue_ocean_analyses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."competitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."errc_matrices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."strategy_canvas_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pain_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."value_cost_estimates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."implementation_roadmaps" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
    ON "public"."user_profiles"
    FOR SELECT
    TO authenticated
    USING ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id");

CREATE POLICY "Users can create own profile"
    ON "public"."user_profiles"
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id");

CREATE POLICY "Users can update own profile"
    ON "public"."user_profiles"
    FOR UPDATE
    TO authenticated
    USING ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id")
    WITH CHECK ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id");

-- RLS Policies for blue_ocean_analyses
CREATE POLICY "Users can view own analyses"
    ON "public"."blue_ocean_analyses"
    FOR SELECT
    TO authenticated
    USING ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id");

CREATE POLICY "Users can create own analyses"
    ON "public"."blue_ocean_analyses"
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id");

CREATE POLICY "Users can update own analyses"
    ON "public"."blue_ocean_analyses"
    FOR UPDATE
    TO authenticated
    USING ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id")
    WITH CHECK ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id");

CREATE POLICY "Users can delete own analyses"
    ON "public"."blue_ocean_analyses"
    FOR DELETE
    TO authenticated
    USING ((SELECT (auth.jwt() ->> 'sub'::text)) = "user_id");

-- RLS Policies for competitors
CREATE POLICY "Users can view competitors for own analyses"
    ON "public"."competitors"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "competitors"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can create competitors for own analyses"
    ON "public"."competitors"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "competitors"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can update competitors for own analyses"
    ON "public"."competitors"
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "competitors"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "competitors"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can delete competitors for own analyses"
    ON "public"."competitors"
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "competitors"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

-- RLS Policies for errc_matrices
CREATE POLICY "Users can view ERRC for own analyses"
    ON "public"."errc_matrices"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "errc_matrices"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can create ERRC for own analyses"
    ON "public"."errc_matrices"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "errc_matrices"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can update ERRC for own analyses"
    ON "public"."errc_matrices"
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "errc_matrices"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "errc_matrices"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can delete ERRC for own analyses"
    ON "public"."errc_matrices"
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "errc_matrices"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

-- RLS Policies for strategy_canvas_configs (Same pattern as ERRC)
CREATE POLICY "Users can view canvas for own analyses"
    ON "public"."strategy_canvas_configs"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "strategy_canvas_configs"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can create canvas for own analyses"
    ON "public"."strategy_canvas_configs"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "strategy_canvas_configs"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can update canvas for own analyses"
    ON "public"."strategy_canvas_configs"
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "strategy_canvas_configs"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "strategy_canvas_configs"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can delete canvas for own analyses"
    ON "public"."strategy_canvas_configs"
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "strategy_canvas_configs"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

-- RLS Policies for pain_points (Same pattern)
CREATE POLICY "Users can view pain points for own analyses"
    ON "public"."pain_points"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "pain_points"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can create pain points for own analyses"
    ON "public"."pain_points"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "pain_points"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can delete pain points for own analyses"
    ON "public"."pain_points"
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "pain_points"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

-- RLS Policies for value_cost_estimates (Same pattern)
CREATE POLICY "Users can view estimates for own analyses"
    ON "public"."value_cost_estimates"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "value_cost_estimates"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can create estimates for own analyses"
    ON "public"."value_cost_estimates"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "value_cost_estimates"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can update estimates for own analyses"
    ON "public"."value_cost_estimates"
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "value_cost_estimates"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "value_cost_estimates"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can delete estimates for own analyses"
    ON "public"."value_cost_estimates"
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "value_cost_estimates"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

-- RLS Policies for implementation_roadmaps (Same pattern)
CREATE POLICY "Users can view roadmaps for own analyses"
    ON "public"."implementation_roadmaps"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "implementation_roadmaps"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can create roadmaps for own analyses"
    ON "public"."implementation_roadmaps"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "implementation_roadmaps"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can update roadmaps for own analyses"
    ON "public"."implementation_roadmaps"
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "implementation_roadmaps"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "implementation_roadmaps"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

CREATE POLICY "Users can delete roadmaps for own analyses"
    ON "public"."implementation_roadmaps"
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "public"."blue_ocean_analyses"
            WHERE "blue_ocean_analyses"."id" = "implementation_roadmaps"."analysis_id"
            AND "blue_ocean_analyses"."user_id" = (SELECT (auth.jwt() ->> 'sub'::text))
        )
    );

-- Grant permissions
GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";

GRANT ALL ON TABLE "public"."blue_ocean_analyses" TO "anon";
GRANT ALL ON TABLE "public"."blue_ocean_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."blue_ocean_analyses" TO "service_role";

GRANT ALL ON TABLE "public"."competitors" TO "anon";
GRANT ALL ON TABLE "public"."competitors" TO "authenticated";
GRANT ALL ON TABLE "public"."competitors" TO "service_role";

GRANT ALL ON TABLE "public"."errc_matrices" TO "anon";
GRANT ALL ON TABLE "public"."errc_matrices" TO "authenticated";
GRANT ALL ON TABLE "public"."errc_matrices" TO "service_role";

GRANT ALL ON TABLE "public"."strategy_canvas_configs" TO "anon";
GRANT ALL ON TABLE "public"."strategy_canvas_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."strategy_canvas_configs" TO "service_role";

GRANT ALL ON TABLE "public"."pain_points" TO "anon";
GRANT ALL ON TABLE "public"."pain_points" TO "authenticated";
GRANT ALL ON TABLE "public"."pain_points" TO "service_role";

GRANT ALL ON TABLE "public"."value_cost_estimates" TO "anon";
GRANT ALL ON TABLE "public"."value_cost_estimates" TO "authenticated";
GRANT ALL ON TABLE "public"."value_cost_estimates" TO "service_role";

GRANT ALL ON TABLE "public"."implementation_roadmaps" TO "anon";
GRANT ALL ON TABLE "public"."implementation_roadmaps" TO "authenticated";
GRANT ALL ON TABLE "public"."implementation_roadmaps" TO "service_role";

GRANT ALL ON TABLE "public"."api_cache" TO "anon";
GRANT ALL ON TABLE "public"."api_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."api_cache" TO "service_role";

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blue_ocean_analyses_updated_at BEFORE UPDATE ON "public"."blue_ocean_analyses" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON "public"."competitors" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_errc_matrices_updated_at BEFORE UPDATE ON "public"."errc_matrices" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategy_canvas_configs_updated_at BEFORE UPDATE ON "public"."strategy_canvas_configs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_implementation_roadmaps_updated_at BEFORE UPDATE ON "public"."implementation_roadmaps" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
