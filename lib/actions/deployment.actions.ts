"use server";

import { Deployment, CreateDeploymentInput, UpdateDeploymentInput } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

// Get deployment history for an app
export const getDeployments = async (appId: string): Promise<Deployment[]> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Verify user owns the app
  const { data: app, error: appError } = await supabase
    .from("apps")
    .select("id")
    .eq("id", appId)
    .eq("user_id", userId)
    .single();

  if (appError || !app) {
    throw new Error("App not found or unauthorized");
  }

  // Get deployments for this app
  const { data: deployments, error } = await supabase
    .from("deployments")
    .select("*")
    .eq("app_id", appId)
    .order("deployed_at", { ascending: false });

  if (error) throw new Error(error.message);

  return deployments as Deployment[];
};

// Record new deployment
export const createDeployment = async (data: CreateDeploymentInput): Promise<Deployment> => {
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

  // Insert deployment
  const { data: deployment, error } = await supabase
    .from("deployments")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update app's updated_at timestamp to reflect latest activity
  await supabase
    .from("apps")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", data.app_id);

  return deployment as Deployment;
};

// Update deployment record (edit version or notes)
export const updateDeployment = async (id: string, data: UpdateDeploymentInput): Promise<Deployment> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Get deployment with app join to verify ownership
  const { data: deployment, error: fetchError } = await supabase
    .from("deployments")
    .select("*, apps!inner(user_id)")
    .eq("id", id)
    .single();

  if (fetchError || !deployment) {
    throw new Error("Deployment not found");
  }

  // Check ownership
  const app = deployment.apps as { user_id: string };
  if (app.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  // Update deployment
  const { data: updatedDeployment, error: updateError } = await supabase
    .from("deployments")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updatedDeployment as Deployment;
};

// Delete deployment record
export const deleteDeployment = async (id: string): Promise<void> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Get deployment with app join to verify ownership
  const { data: deployment, error: fetchError } = await supabase
    .from("deployments")
    .select("*, apps!inner(user_id)")
    .eq("id", id)
    .single();

  if (fetchError || !deployment) {
    throw new Error("Deployment not found");
  }

  // Check ownership
  const app = deployment.apps as { user_id: string };
  if (app.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  // Delete deployment
  const { error } = await supabase
    .from("deployments")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};
