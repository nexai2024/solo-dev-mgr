"use server";

import { Repository, CreateRepositoryInput, UpdateRepositoryInput } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

// Get all linked repositories for an app
export const getRepositories = async (appId: string): Promise<Repository[]> => {
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

  // Get repositories for this app (primary repo first)
  const { data: repositories, error } = await supabase
    .from("repositories")
    .select("*")
    .eq("app_id", appId)
    .order("is_primary", { ascending: false })
    .order("name");

  if (error) throw new Error(error.message);

  return repositories as Repository[];
};

// Link new repository to app
export const createRepository = async (data: CreateRepositoryInput): Promise<Repository> => {
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

  // If is_primary is true, first update existing repos to set is_primary = false
  if (data.is_primary) {
    await supabase
      .from("repositories")
      .update({ is_primary: false })
      .eq("app_id", data.app_id);
  }

  // Insert repository
  const { data: repository, error } = await supabase
    .from("repositories")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return repository as Repository;
};

// Update repository details
export const updateRepository = async (id: string, data: UpdateRepositoryInput): Promise<Repository> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Get repository with app join to verify ownership
  const { data: repository, error: fetchError } = await supabase
    .from("repositories")
    .select("*, apps!inner(user_id, id)")
    .eq("id", id)
    .single();

  if (fetchError || !repository) {
    throw new Error("Repository not found");
  }

  // Check ownership
  const app = repository.apps as { user_id: string; id: string };
  if (app.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  // If is_primary is changing to true, first update all other repos for same app
  if (data.is_primary === true) {
    await supabase
      .from("repositories")
      .update({ is_primary: false })
      .eq("app_id", app.id);
  }

  // Update repository
  const { data: updatedRepository, error: updateError } = await supabase
    .from("repositories")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updatedRepository as Repository;
};

// Delete repository link
export const deleteRepository = async (id: string): Promise<void> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  // Get repository with app join to verify ownership
  const { data: repository, error: fetchError } = await supabase
    .from("repositories")
    .select("*, apps!inner(user_id)")
    .eq("id", id)
    .single();

  if (fetchError || !repository) {
    throw new Error("Repository not found");
  }

  // Check ownership
  const app = repository.apps as { user_id: string; id: string };
  if (app.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  // Delete repository
  const { error } = await supabase
    .from("repositories")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};
