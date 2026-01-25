"use server";

import { App, CreateAppInput, UpdateAppInput } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

// Get all apps for current user
export const getApps = async (): Promise<App[]> => {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createSupabaseClient();

  const { data: apps, error } = await supabase
    .from("apps")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return apps as App[];
};

// Get single app by ID for current user
export const getApp = async (id: string): Promise<App | null> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  const { data: app, error } = await supabase
    .from("apps")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(error.message);
  }

  return app as App;
};

// Create new app for current user
export const createApp = async (data: CreateAppInput): Promise<App> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  const insertData = {
    ...data,
    user_id: userId,
  };

  const { data: app, error } = await supabase
    .from("apps")
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return app as App;
};

// Update existing app
export const updateApp = async (id: string, data: UpdateAppInput): Promise<App> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: app, error } = await supabase
    .from("apps")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error("App not found or unauthorized");
    }
    throw new Error(error.message);
  }

  return app as App;
};

// Delete app and all related data (cascade)
export const deleteApp = async (id: string): Promise<void> => {
  const { userId } = await auth();

  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("apps")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};
