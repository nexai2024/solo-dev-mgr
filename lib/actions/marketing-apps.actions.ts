'use server';

import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import {
  createMarketingAppSchema,
  updateMarketingAppSchema,
} from '@/lib/validations/marketing';
import type {
  MarketingApp,
  CreateMarketingAppInput,
  UpdateMarketingAppInput,
  ActionResponse,
} from '@/types';

/**
 * Get all marketing apps for current user
 */
export async function getMarketingApps(): Promise<ActionResponse<MarketingApp[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('marketing_apps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as MarketingApp[] };
  } catch (error: any) {
    console.error('Get marketing apps error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get marketing app by ID
 */
export async function getMarketingAppById(
  id: string
): Promise<ActionResponse<MarketingApp>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('marketing_apps')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) {
      return { success: false, error: 'Marketing app not found' };
    }

    return { success: true, data: data as MarketingApp };
  } catch (error: any) {
    console.error('Get marketing app by ID error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new marketing app
 */
export async function createMarketingApp(
  input: CreateMarketingAppInput
): Promise<ActionResponse<MarketingApp>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const validated = createMarketingAppSchema.parse(input);

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('marketing_apps')
      .insert({
        ...validated,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as MarketingApp };
  } catch (error: any) {
    console.error('Create marketing app error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update marketing app
 */
export async function updateMarketingApp(
  id: string,
  input: UpdateMarketingAppInput
): Promise<ActionResponse<MarketingApp>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const validated = updateMarketingAppSchema.parse(input);

    const supabase = createSupabaseClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('marketing_apps')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return { success: false, error: 'Marketing app not found or unauthorized' };
    }

    const { data, error } = await supabase
      .from('marketing_apps')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as MarketingApp };
  } catch (error: any) {
    console.error('Update marketing app error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete marketing app
 */
export async function deleteMarketingApp(id: string): Promise<ActionResponse<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createSupabaseClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('marketing_apps')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return { success: false, error: 'Marketing app not found or unauthorized' };
    }

    const { error } = await supabase.from('marketing_apps').delete().eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Delete marketing app error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get marketing app dashboard summary
 */
export async function getMarketingAppSummary(
  appId: string
): Promise<
  ActionResponse<{
    totalSubscribers: number;
    totalDevLogs: number;
    totalSocialPosts: number;
    totalEmailCampaigns: number;
    recentActivity: any[];
  }>
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createSupabaseClient();

    // Verify ownership
    const { data: app } = await supabase
      .from('marketing_apps')
      .select('id')
      .eq('id', appId)
      .eq('user_id', userId)
      .single();

    if (!app) {
      return { success: false, error: 'Marketing app not found or unauthorized' };
    }

    // Fetch all summary data in parallel
    const [subscribers, devlogs, socialPosts, emailCampaigns] = await Promise.all([
      supabase
        .from('subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('marketing_app_id', appId)
        .eq('status', 'active'),
      supabase
        .from('devlogs')
        .select('id', { count: 'exact', head: true })
        .eq('marketing_app_id', appId),
      supabase
        .from('social_posts')
        .select('id', { count: 'exact', head: true })
        .eq('marketing_app_id', appId),
      supabase
        .from('email_campaigns')
        .select('id', { count: 'exact', head: true })
        .eq('marketing_app_id', appId),
    ]);

    // Recent activity (last 10 items)
    const { data: recentDevLogs } = await supabase
      .from('devlogs')
      .select('id, title, created_at')
      .eq('marketing_app_id', appId)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      success: true,
      data: {
        totalSubscribers: subscribers.count || 0,
        totalDevLogs: devlogs.count || 0,
        totalSocialPosts: socialPosts.count || 0,
        totalEmailCampaigns: emailCampaigns.count || 0,
        recentActivity: recentDevLogs || [],
      },
    };
  } catch (error: any) {
    console.error('Get marketing app summary error:', error);
    return { success: false, error: error.message };
  }
}
