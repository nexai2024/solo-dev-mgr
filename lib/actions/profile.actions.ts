"use server";

import { UserProfile, UpdateUserProfileInput } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";
import { updateUserProfileSchema } from "../validations/blueocean";

// Get user profile (creates default if doesn't exist)
export const getUserProfile = async (): Promise<UserProfile> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Profile doesn't exist, create default
      const defaultProfile = {
        user_id: userId,
        primary_niche: null,
        skills: [],
        interests: [],
        experience_level: "intermediate" as const,
        preferences: {},
      };

      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert(defaultProfile)
        .select()
        .single();

      if (createError) throw new Error(createError.message);
      return newProfile as UserProfile;
    }
    throw new Error(error.message);
  }

  return data as UserProfile;
};

// Update user profile
export const updateUserProfile = async (input: UpdateUserProfileInput): Promise<UserProfile> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validated = updateUserProfileSchema.parse(input);
  const supabase = createSupabaseClient();

  // Ensure profile exists
  const existing = await getUserProfile();

  const { data, error } = await supabase
    .from("user_profiles")
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as UserProfile;
};

// Check if user has completed their profile
export const hasCompletedProfile = async (): Promise<boolean> => {
  const profile = await getUserProfile();
  return !!(profile.primary_niche && profile.skills.length > 0);
};
