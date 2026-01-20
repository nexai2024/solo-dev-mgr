"use server";

import { EnvironmentVariable, CreateEnvVarInput, UpdateEnvVarInput } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

// Get all environment variables for an app, grouped by environment
export const getEnvVars = async (appId: string) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // First verify user owns the app
  const { data: app, error: appError } = await supabase
    .from("apps")
    .select("id")
    .eq("id", appId)
    .eq("user_id", userId)
    .single();

  if (appError || !app) {
    throw new Error("App not found or unauthorized");
  }

  // Get all env vars for this app
  const { data: envVars, error } = await supabase
    .from("environment_variables")
    .select("*")
    .eq("app_id", appId)
    .order("environment")
    .order("key_name");

  if (error) throw new Error(error.message);

  // Group by environment
  const grouped = {
    development: [] as EnvironmentVariable[],
    staging: [] as EnvironmentVariable[],
    production: [] as EnvironmentVariable[],
  };

  (envVars as EnvironmentVariable[]).forEach((envVar) => {
    grouped[envVar.environment].push(envVar);
  });

  return grouped;
};

// Create new environment variable
export const createEnvVar = async (data: CreateEnvVarInput): Promise<EnvironmentVariable> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify user owns the app
  const { data: app, error: appError } = await supabase
    .from("apps")
    .select("id")
    .eq("id", data.app_id)
    .eq("user_id", userId)
    .single();

  if (appError || !app) {
    throw new Error("App not found or unauthorized");
  }

  // Insert env var
  const { data: envVar, error } = await supabase
    .from("environment_variables")
    .insert(data)
    .select()
    .single();

  if (error) {
    // Check for unique constraint violation
    if (error.code === '23505') {
      throw new Error("Variable already exists for this environment");
    }
    throw new Error(error.message);
  }

  return envVar as EnvironmentVariable;
};

// Update existing environment variable
export const updateEnvVar = async (id: string, data: UpdateEnvVarInput): Promise<EnvironmentVariable> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Get env var with app join to verify ownership
  const { data: envVar, error: fetchError } = await supabase
    .from("environment_variables")
    .select("*, apps!inner(user_id)")
    .eq("id", id)
    .single();

  if (fetchError || !envVar) {
    throw new Error("Environment variable not found");
  }

  // Check ownership
  const app = envVar.apps as { user_id: string };
  if (app.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  // Update env var
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedEnvVar, error: updateError } = await supabase
    .from("environment_variables")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updatedEnvVar as EnvironmentVariable;
};

// Delete environment variable
export const deleteEnvVar = async (id: string): Promise<void> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Get env var with app join to verify ownership
  const { data: envVar, error: fetchError } = await supabase
    .from("environment_variables")
    .select("*, apps!inner(user_id)")
    .eq("id", id)
    .single();

  if (fetchError || !envVar) {
    throw new Error("Environment variable not found");
  }

  // Check ownership
  const app = envVar.apps as { user_id: string };
  if (app.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  // Delete env var
  const { error } = await supabase
    .from("environment_variables")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};
