// DropFly LeadFly - Feature Toggle API
// Supabase + Next.js API for managing tiered features

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Feature Toggle System
 * Manages access to features based on subscription tier and add-ons
 */

// =============================================
// FEATURE CHECKING FUNCTIONS
// =============================================

/**
 * Check if user has access to a specific feature
 * @param {string} userId - User UUID
 * @param {string} featureId - Feature identifier
 * @returns {boolean} - Whether user has access
 */
export async function hasFeature(userId, featureId) {
  try {
    const { data, error } = await supabase
      .from('user_feature_access')
      .select('has_access')
      .eq('user_id', userId)
      .eq('feature_id', featureId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking feature access:', error)
      return false
    }

    return data?.has_access || false
  } catch (error) {
    console.error('Exception checking feature:', error)
    return false
  }
}

/**
 * Get all features user has access to
 * @param {string} userId - User UUID
 * @returns {Array} - Array of feature objects
 */
export async function getUserFeatures(userId) {
  try {
    const { data, error } = await supabase
      .from('user_feature_access')
      .select('feature_id, feature_name, has_access')
      .eq('user_id', userId)
      .eq('has_access', true)

    if (error) {
      console.error('Error fetching user features:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching features:', error)
    return []
  }
}

/**
 * Check multiple features at once
 * @param {string} userId - User UUID
 * @param {Array} featureIds - Array of feature IDs to check
 * @returns {Object} - Object mapping feature IDs to access boolean
 */
export async function hasFeatures(userId, featureIds) {
  try {
    const { data, error } = await supabase
      .from('user_feature_access')
      .select('feature_id, has_access')
      .eq('user_id', userId)
      .in('feature_id', featureIds)

    if (error) {
      console.error('Error checking multiple features:', error)
      return {}
    }

    // Convert to object for easy lookup
    const featureMap = {}
    featureIds.forEach(id => { featureMap[id] = false }) // default false
    
    data?.forEach(item => {
      featureMap[item.feature_id] = item.has_access
    })

    return featureMap
  } catch (error) {
    console.error('Exception checking multiple features:', error)
    return {}
  }
}

// =============================================
// SUBSCRIPTION MANAGEMENT
// =============================================

/**
 * Get user's current subscription details
 * @param {string} userId - User UUID
 * @returns {Object} - Subscription details
 */
export async function getUserSubscription(userId) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_tiers (
          id, name, description, monthly_price, monthly_leads, features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Exception fetching subscription:', error)
    return null
  }
}

/**
 * Get user's active add-ons
 * @param {string} userId - User UUID
 * @returns {Array} - Array of active add-ons
 */
export async function getUserAddons(userId) {
  try {
    const { data, error } = await supabase
      .from('user_addons')
      .select(`
        *,
        addon_packages (
          id, name, description, category, features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching add-ons:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching add-ons:', error)
    return []
  }
}

/**
 * Check if user can generate more leads this period
 * @param {string} userId - User UUID
 * @param {number} requestedCount - Number of leads to generate
 * @returns {Object} - {canGenerate: boolean, limit: number, used: number}
 */
export async function canGenerateLeads(userId, requestedCount = 1) {
  try {
    const { data, error } = await supabase
      .rpc('can_generate_leads', {
        p_user_id: userId,
        p_requested_count: requestedCount
      })

    if (error) {
      console.error('Error checking lead generation limit:', error)
      return { canGenerate: false, limit: 0, used: 0 }
    }

    // Also get the actual numbers for display
    const subscription = await getUserSubscription(userId)
    const limit = subscription?.subscription_tiers?.monthly_leads || 0
    const used = subscription?.leads_used_this_period || 0

    return {
      canGenerate: data,
      limit,
      used,
      remaining: limit - used
    }
  } catch (error) {
    console.error('Exception checking lead limits:', error)
    return { canGenerate: false, limit: 0, used: 0, remaining: 0 }
  }
}

// =============================================
// FEATURE GATE DECORATORS
// =============================================

/**
 * Feature gate decorator for API endpoints
 * @param {string} requiredFeature - Feature required to access endpoint
 * @returns {Function} - Middleware function
 */
export function requireFeature(requiredFeature) {
  return async function(req, res, next) {
    try {
      const userId = req.user?.id || req.body?.user_id || req.query?.user_id
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const hasAccess = await hasFeature(userId, requiredFeature)
      
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Feature not available', 
          feature: requiredFeature,
          message: 'This feature requires a subscription upgrade or add-on'
        })
      }

      // Add feature info to request for use in handler
      req.featureAccess = { [requiredFeature]: true }
      
      if (next) {
        next()
      } else {
        return true // For direct usage
      }
    } catch (error) {
      console.error('Feature gate error:', error)
      return res.status(500).json({ error: 'Failed to check feature access' })
    }
  }
}

/**
 * Multiple feature gate - requires ALL features
 * @param {Array} requiredFeatures - Array of required features
 * @returns {Function} - Middleware function
 */
export function requireFeatures(requiredFeatures) {
  return async function(req, res, next) {
    try {
      const userId = req.user?.id || req.body?.user_id || req.query?.user_id
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const featureAccess = await hasFeatures(userId, requiredFeatures)
      const missingFeatures = requiredFeatures.filter(f => !featureAccess[f])
      
      if (missingFeatures.length > 0) {
        return res.status(403).json({ 
          error: 'Features not available', 
          missing_features: missingFeatures,
          message: 'Some required features are not available with your current plan'
        })
      }

      req.featureAccess = featureAccess
      
      if (next) {
        next()
      } else {
        return true
      }
    } catch (error) {
      console.error('Multi-feature gate error:', error)
      return res.status(500).json({ error: 'Failed to check feature access' })
    }
  }
}

/**
 * Lead limit gate - checks if user can generate requested leads
 * @param {number} defaultCount - Default number of leads if not specified
 * @returns {Function} - Middleware function
 */
export function requireLeadCapacity(defaultCount = 1) {
  return async function(req, res, next) {
    try {
      const userId = req.user?.id || req.body?.user_id || req.query?.user_id
      const requestedCount = req.body?.count || req.query?.count || defaultCount
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const capacity = await canGenerateLeads(userId, requestedCount)
      
      if (!capacity.canGenerate) {
        return res.status(403).json({ 
          error: 'Lead limit exceeded',
          limit: capacity.limit,
          used: capacity.used,
          requested: requestedCount,
          message: 'You have reached your monthly lead limit. Please upgrade your plan.'
        })
      }

      req.leadCapacity = capacity
      
      if (next) {
        next()
      } else {
        return true
      }
    } catch (error) {
      console.error('Lead capacity gate error:', error)
      return res.status(500).json({ error: 'Failed to check lead capacity' })
    }
  }
}

// =============================================
// USAGE TRACKING
// =============================================

/**
 * Track feature usage
 * @param {string} userId - User UUID
 * @param {string} feature - Feature used
 * @param {number} count - Usage count (default 1)
 * @param {Object} metadata - Additional metadata
 */
export async function trackUsage(userId, feature, count = 1, metadata = {}) {
  try {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Update or insert usage tracking
    const { error } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        [`${feature}_requests`]: count // Dynamic column based on feature
      }, {
        onConflict: 'user_id,period_start',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error tracking usage:', error)
    }
  } catch (error) {
    console.error('Exception tracking usage:', error)
  }
}

/**
 * Update lead usage count
 * @param {string} userId - User UUID
 * @param {number} count - Number of leads generated
 */
export async function updateLeadUsage(userId, count = 1) {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        leads_used_this_period: supabase.raw(`leads_used_this_period + ${count}`)
      })
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) {
      console.error('Error updating lead usage:', error)
    }
  } catch (error) {
    console.error('Exception updating lead usage:', error)
  }
}

// =============================================
// FEATURE CONSTANTS
// =============================================

export const FEATURES = {
  // Core features
  BASIC_LEAD_TABLE: 'basic_lead_table',
  GENERIC_EMAIL: 'generic_email',
  CSV_EXPORT: 'csv_export',
  LEAD_SCORING: 'lead_scoring',
  PRIORITY_QUALITY: 'priority_quality',
  ADVANCED_FILTERS: 'advanced_filters',
  DAILY_DELIVERY: 'daily_delivery',
  CUSTOM_CRITERIA: 'custom_criteria',
  PRIORITY_PROCESSING: 'priority_processing',
  SLACK_INCLUDED: 'slack_included',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',

  // Research add-on features
  COMPANY_NEWS: 'company_news',
  RECENT_EVENTS: 'recent_events',
  PAIN_POINTS: 'pain_points',
  DECISION_MAPPING: 'decision_mapping',

  // Email add-on features
  PERSONALIZED_EMAILS: 'personalized_emails',
  AB_TESTING: 'ab_testing',
  MULTI_TOUCH_SEQUENCES: 'multi_touch_sequences',

  // Automation add-on features
  AUTO_EMAIL_CAMPAIGNS: 'auto_email_campaigns',
  LEAD_WARMER: 'lead_warmer',
  LINKEDIN_AUTOMATION: 'linkedin_automation',

  // Voice add-on features
  AI_VOICE_CALLS: 'ai_voice_calls',
  MEETING_BOOKING: 'meeting_booking',
  CALL_ANALYTICS: 'call_analytics',

  // Conversion add-on features
  LANDING_PAGES: 'landing_pages',
  CRM_INTEGRATION: 'crm_integration',
  SLACK_ALERTS: 'slack_alerts'
}

export const SUBSCRIPTION_TIERS = {
  STARTER: 'starter',
  GROWTH: 'growth',
  SCALE: 'scale',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
}

export const ADDON_PACKAGES = {
  RESEARCH_INTEL: 'research_intel',
  EMAIL_PERSONALIZATION: 'email_personalization',
  AUTOMATION_SUITE: 'automation_suite',
  VOICE_AI_CALLING: 'voice_ai_calling',
  CONVERSION_OPTIMIZATION: 'conversion_optimization'
}

// Export all functions as default object
export default {
  hasFeature,
  getUserFeatures,
  hasFeatures,
  getUserSubscription,
  getUserAddons,
  canGenerateLeads,
  requireFeature,
  requireFeatures,
  requireLeadCapacity,
  trackUsage,
  updateLeadUsage,
  FEATURES,
  SUBSCRIPTION_TIERS,
  ADDON_PACKAGES
}