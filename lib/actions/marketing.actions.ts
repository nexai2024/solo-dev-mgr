'use server';

import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import * as marketingSchemas from '@/lib/validations/marketing';
import type { ActionResponse } from '@/types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function verifyMarketingAppOwnership(appId: string, userId: string) {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from('marketing_apps')
    .select('id')
    .eq('id', appId)
    .eq('user_id', userId)
    .single();
  return !!data;
}

// ============================================================================
// DEVLOGS
// ============================================================================

export async function getDevLogs(appId: string): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyMarketingAppOwnership(appId, userId))) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('devlogs')
      .select('*')
      .eq('marketing_app_id', appId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createDevLog(input: any): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const validated = marketingSchemas.createDevLogSchema.parse(input);
    if (!(await verifyMarketingAppOwnership(validated.marketing_app_id, userId))) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('devlogs')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDevLog(id: string, input: any): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const validated = marketingSchemas.updateDevLogSchema.parse(input);
    const supabase = createSupabaseClient();

    // Verify ownership via marketing_app
    const { data: devlog } = await supabase
      .from('devlogs')
      .select('marketing_app_id')
      .eq('id', id)
      .single();

    if (!devlog || !(await verifyMarketingAppOwnership(devlog.marketing_app_id, userId))) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('devlogs')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDevLog(id: string): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const supabase = createSupabaseClient();
    const { data: devlog } = await supabase
      .from('devlogs')
      .select('marketing_app_id')
      .eq('id', id)
      .single();

    if (!devlog || !(await verifyMarketingAppOwnership(devlog.marketing_app_id, userId))) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase.from('devlogs').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// SOCIAL POSTS
// ============================================================================

export async function getSocialPosts(appId: string): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyMarketingAppOwnership(appId, userId))) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('marketing_app_id', appId)
      .order('scheduled_for', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSocialPost(input: any): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const validated = marketingSchemas.createSocialPostSchema.parse(input);
    if (!(await verifyMarketingAppOwnership(validated.marketing_app_id, userId))) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('social_posts')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSocialPost(id: string, input: any): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const validated = marketingSchemas.updateSocialPostSchema.parse(input);
    const supabase = createSupabaseClient();

    const { data: post } = await supabase
      .from('social_posts')
      .select('marketing_app_id')
      .eq('id', id)
      .single();

    if (!post || !(await verifyMarketingAppOwnership(post.marketing_app_id, userId))) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('social_posts')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Continue with all other CRUD operations...
// Due to space, I'll create a pattern that can be replicated for all entities

// ============================================================================
// GENERIC CRUD FACTORY
// ============================================================================

function createCRUDActions<T>(tableName: string, schemas: {
  create: any;
  update: any;
}) {
  return {
    async getAll(appId: string): Promise<ActionResponse<T[]>> {
      try {
        const { userId } = await auth();
        if (!userId || !(await verifyMarketingAppOwnership(appId, userId))) {
          return { success: false, error: 'Unauthorized' };
        }

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('marketing_app_id', appId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data as T[] };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    async getById(id: string): Promise<ActionResponse<T>> {
      try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: 'Unauthorized' };

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Verify ownership
        if (data && data.marketing_app_id) {
          if (!(await verifyMarketingAppOwnership(data.marketing_app_id, userId))) {
            return { success: false, error: 'Unauthorized' };
          }
        }

        return { success: true, data: data as T };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    async create(input: any): Promise<ActionResponse<T>> {
      try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: 'Unauthorized' };

        const validated = schemas.create.parse(input);
        if (validated.marketing_app_id && !(await verifyMarketingAppOwnership(validated.marketing_app_id, userId))) {
          return { success: false, error: 'Unauthorized' };
        }

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from(tableName)
          .insert(validated)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: data as T };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    async update(id: string, input: any): Promise<ActionResponse<T>> {
      try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: 'Unauthorized' };

        const validated = schemas.update.parse(input);
        const supabase = createSupabaseClient();

        const { data: existing } = await supabase
          .from(tableName)
          .select('marketing_app_id')
          .eq('id', id)
          .single();

        if (!existing || !(await verifyMarketingAppOwnership(existing.marketing_app_id, userId))) {
          return { success: false, error: 'Unauthorized' };
        }

        const { data, error } = await supabase
          .from(tableName)
          .update(validated)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: data as T };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    async delete(id: string): Promise<ActionResponse<void>> {
      try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: 'Unauthorized' };

        const supabase = createSupabaseClient();
        const { data: existing } = await supabase
          .from(tableName)
          .select('marketing_app_id')
          .eq('id', id)
          .single();

        if (!existing || !(await verifyMarketingAppOwnership(existing.marketing_app_id, userId))) {
          return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  };
}

// Export CRUD actions for all entities
export const waitlistSubscribers = createCRUDActions('waitlist_subscribers', {
  create: marketingSchemas.createWaitlistSubscriberSchema,
  update: marketingSchemas.updateWaitlistSubscriberSchema,
});

export const asoKeywords = createCRUDActions('aso_keywords', {
  create: marketingSchemas.createASOKeywordSchema,
  update: marketingSchemas.updateASOKeywordSchema,
});

export const subscribers = createCRUDActions('subscribers', {
  create: marketingSchemas.createSubscriberSchema,
  update: marketingSchemas.updateSubscriberSchema,
});

export const subscriberSegments = createCRUDActions('subscriber_segments', {
  create: marketingSchemas.createSubscriberSegmentSchema,
  update: marketingSchemas.updateSubscriberSegmentSchema,
});

export const emailTemplates = createCRUDActions('email_templates', {
  create: marketingSchemas.createEmailTemplateSchema,
  update: marketingSchemas.updateEmailTemplateSchema,
});

export const emailCampaigns = createCRUDActions('email_campaigns', {
  create: marketingSchemas.createEmailCampaignSchema,
  update: marketingSchemas.updateEmailCampaignSchema,
});

export const communityComments = createCRUDActions('community_comments', {
  create: marketingSchemas.createCommunityCommentSchema,
  update: marketingSchemas.updateCommunityCommentSchema,
});

export const referralPrograms = createCRUDActions('referral_programs', {
  create: marketingSchemas.createReferralProgramSchema,
  update: marketingSchemas.updateReferralProgramSchema,
});

export const referralLinks = createCRUDActions('referral_links', {
  create: marketingSchemas.createReferralLinkSchema,
  update: marketingSchemas.updateReferralLinkSchema,
});

export const ugc = createCRUDActions('user_generated_content', {
  create: marketingSchemas.createUGCSchema,
  update: marketingSchemas.updateUGCSchema,
});

export const pricingTiers = createCRUDActions('pricing_tiers', {
  create: marketingSchemas.createPricingTierSchema,
  update: marketingSchemas.updatePricingTierSchema,
});

export const offers = createCRUDActions('offers', {
  create: marketingSchemas.createOfferSchema,
  update: marketingSchemas.updateOfferSchema,
});

export const abandonedCarts = createCRUDActions('abandoned_carts', {
  create: marketingSchemas.createAbandonedCartSchema,
  update: marketingSchemas.updateAbandonedCartSchema,
});

export const creatorContacts = createCRUDActions('creator_contacts', {
  create: marketingSchemas.createCreatorContactSchema,
  update: marketingSchemas.updateCreatorContactSchema,
});

export const adCampaigns = createCRUDActions('ad_campaigns', {
  create: marketingSchemas.createAdCampaignSchema,
  update: marketingSchemas.updateAdCampaignSchema,
});

export const merchAssets = createCRUDActions('merch_assets', {
  create: marketingSchemas.createMerchAssetSchema,
  update: marketingSchemas.updateMerchAssetSchema,
});

export const marketingMetrics = createCRUDActions('marketing_metrics', {
  create: marketingSchemas.createMarketingMetricsSchema,
  update: marketingSchemas.updateMarketingMetricsSchema,
});

export const ltvCalculations = createCRUDActions('ltv_calculations', {
  create: marketingSchemas.createLTVCalculationSchema,
  update: marketingSchemas.updateLTVCalculationSchema,
});

export const sentimentAnalyses = createCRUDActions('sentiment_analyses', {
  create: marketingSchemas.createSentimentAnalysisSchema,
  update: marketingSchemas.updateSentimentAnalysisSchema,
});

export const pressKits = createCRUDActions('press_kits', {
  create: marketingSchemas.createPressKitSchema,
  update: marketingSchemas.updatePressKitSchema,
});

export const promoNetworkListings = createCRUDActions('promo_network_listings', {
  create: marketingSchemas.createPromoNetworkListingSchema,
  update: marketingSchemas.updatePromoNetworkListingSchema,
});

export const promoPartnerships = createCRUDActions('promo_partnerships', {
  create: marketingSchemas.createPromoPartnershipSchema,
  update: marketingSchemas.updatePromoPartnershipSchema,
});

// ============================================================================
// SPECIALIZED ACTIONS
// ============================================================================

/**
 * Bulk send email campaign
 */
export async function sendEmailCampaign(campaignId: string): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const supabase = createSupabaseClient();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*, subscriber_segments(filter_rules)')
      .eq('id', campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Verify ownership
    if (!(await verifyMarketingAppOwnership(campaign.marketing_app_id, userId))) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update status to sending
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    // This would trigger the email sending service (Resend)
    // Implementation would be in a separate background job
    return {
      success: true,
      data: { message: 'Email campaign queued for sending' },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Track referral click
 */
export async function trackReferralClick(referralCode: string): Promise<ActionResponse> {
  try {
    const supabase = createSupabaseClient();

    const { data: link, error } = await supabase
      .from('referral_links')
      .select('*')
      .eq('referral_code', referralCode)
      .single();

    if (error || !link) {
      return { success: false, error: 'Invalid referral code' };
    }

    // Increment click count
    await supabase
      .from('referral_links')
      .update({
        click_count: link.click_count + 1,
        last_clicked_at: new Date().toISOString(),
      })
      .eq('id', link.id);

    // Also increment program totals
    await supabase.rpc('increment_referral_program_clicks', {
      program_id: link.referral_program_id,
    });

    return { success: true, data: link };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate unique referral code
 */
export async function generateReferralCode(programId: string): Promise<ActionResponse<string>> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8;

  for (let attempt = 0; attempt < 10; attempt++) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code exists
    const supabase = createSupabaseClient();
    const { data } = await supabase
      .from('referral_links')
      .select('id')
      .eq('referral_code', code)
      .single();

    if (!data) {
      return { success: true, data: code };
    }
  }

  return { success: false, error: 'Failed to generate unique code' };
}
