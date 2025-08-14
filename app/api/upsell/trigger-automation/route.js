import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const body = await request.json()
    const { trigger_type, user_id, data } = body

    // Validate required fields
    if (!trigger_type || !user_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: trigger_type, user_id' 
      }, { status: 400 })
    }

    let opportunities = []

    // Process different trigger types
    switch (trigger_type) {
      case 'usage_threshold':
        opportunities = await handleUsageThreshold(supabase, user_id, data)
        break
      
      case 'feature_request':
        opportunities = await handleFeatureRequest(supabase, user_id, data)
        break
      
      case 'success_milestone':
        opportunities = await handleSuccessMilestone(supabase, user_id, data)
        break
      
      case 'competitive_situation':
        opportunities = await handleCompetitiveSituation(supabase, user_id, data)
        break
      
      default:
        return NextResponse.json({ error: 'Invalid trigger_type' }, { status: 400 })
    }

    // Trigger automated email sequences for each opportunity
    const emailResults = await Promise.all(
      opportunities.map(opp => triggerEmailSequence(opp))
    )

    return NextResponse.json({ 
      success: true,
      opportunities_created: opportunities.length,
      email_sequences_triggered: emailResults.filter(r => r.success).length,
      opportunities
    })

  } catch (error) {
    console.error('Error in upsell automation trigger:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle usage threshold triggers
async function handleUsageThreshold(supabase, userId, data) {
  const { metric_name, current_usage, plan_limit, utilization_percentage } = data

  // Get user's current plan
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`
      subscription_tiers (
        slug,
        features
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!subscription) return []

  const currentPlan = subscription.subscription_tiers.slug
  const recommendedPlan = getNextTier(currentPlan)

  if (!recommendedPlan) return []

  // Create expansion opportunity
  const { data: opportunity, error } = await supabase
    .from('expansion_opportunities')
    .insert({
      user_id: userId,
      opportunity_type: 'usage_upgrade',
      current_plan: currentPlan,
      recommended_plan: recommendedPlan,
      trigger_event: 'usage_threshold_exceeded',
      trigger_data: {
        metric_name,
        current_usage,
        plan_limit,
        utilization_percentage
      },
      priority: utilization_percentage >= 95 ? 'critical' : 
               utilization_percentage >= 90 ? 'high' : 'medium',
      potential_arr_increase: calculateUpgradeValue(currentPlan, recommendedPlan),
      probability_percentage: utilization_percentage >= 95 ? 80 : 
                             utilization_percentage >= 90 ? 70 : 60
    })
    .select()
    .single()

  return error ? [] : [opportunity]
}

// Handle feature request triggers
async function handleFeatureRequest(supabase, userId, data) {
  const { feature_name, feature_category, urgency_level, business_justification } = data

  // Get user's current plan
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`
      subscription_tiers (
        slug,
        features
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!subscription) return []

  const currentPlan = subscription.subscription_tiers.slug
  const recommendedPlan = getRequiredPlanForFeature(feature_name, feature_category)

  if (!recommendedPlan || !isUpgrade(currentPlan, recommendedPlan)) return []

  // Create expansion opportunity
  const { data: opportunity, error } = await supabase
    .from('expansion_opportunities')
    .insert({
      user_id: userId,
      opportunity_type: 'feature_upgrade',
      current_plan: currentPlan,
      recommended_plan: recommendedPlan,
      trigger_event: 'feature_request_submitted',
      trigger_data: {
        feature_name,
        feature_category,
        urgency_level,
        business_justification
      },
      priority: urgency_level === 'critical' ? 'critical' :
               urgency_level === 'high' ? 'high' : 'medium',
      potential_arr_increase: calculateUpgradeValue(currentPlan, recommendedPlan),
      probability_percentage: urgency_level === 'critical' ? 85 :
                             urgency_level === 'high' ? 75 : 65
    })
    .select()
    .single()

  return error ? [] : [opportunity]
}

// Handle success milestone triggers
async function handleSuccessMilestone(supabase, userId, data) {
  const { milestone_type, milestone_value, improvement_percentage } = data

  // Get user's current plan
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`
      subscription_tiers (
        slug,
        features
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!subscription) return []

  const currentPlan = subscription.subscription_tiers.slug
  const recommendedPlan = getNextTier(currentPlan)

  if (!recommendedPlan) return []

  // Create expansion opportunity
  const { data: opportunity, error } = await supabase
    .from('expansion_opportunities')
    .insert({
      user_id: userId,
      opportunity_type: 'tier_progression',
      current_plan: currentPlan,
      recommended_plan: recommendedPlan,
      trigger_event: 'success_milestone_achieved',
      trigger_data: {
        milestone_type,
        milestone_value,
        improvement_percentage
      },
      priority: 'high', // Success milestones are high priority
      potential_arr_increase: calculateUpgradeValue(currentPlan, recommendedPlan),
      probability_percentage: 85 // High probability due to demonstrated success
    })
    .select()
    .single()

  return error ? [] : [opportunity]
}

// Handle competitive situation triggers
async function handleCompetitiveSituation(supabase, userId, data) {
  const { competitor_name, situation_type, urgency_level } = data

  // Get user's current plan
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`
      subscription_tiers (
        slug,
        features
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!subscription) return []

  const currentPlan = subscription.subscription_tiers.slug
  const recommendedPlan = getCompetitiveUpgradePlan(currentPlan, competitor_name)

  if (!recommendedPlan) return []

  // Create expansion opportunity
  const { data: opportunity, error } = await supabase
    .from('expansion_opportunities')
    .insert({
      user_id: userId,
      opportunity_type: 'competitive_upgrade',
      current_plan: currentPlan,
      recommended_plan: recommendedPlan,
      trigger_event: 'competitive_situation_detected',
      trigger_data: {
        competitor_name,
        situation_type,
        urgency_level
      },
      priority: urgency_level === 'critical' ? 'critical' : 'high',
      potential_arr_increase: calculateUpgradeValue(currentPlan, recommendedPlan),
      probability_percentage: urgency_level === 'critical' ? 90 : 75
    })
    .select()
    .single()

  return error ? [] : [opportunity]
}

// Trigger email automation sequence
async function triggerEmailSequence(opportunity) {
  try {
    const n8nWebhookUrl = process.env.N8N_UPSELL_WEBHOOK_URL
    if (!n8nWebhookUrl) {
      console.warn('N8N webhook URL not configured')
      return { success: false, error: 'Webhook not configured' }
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(opportunity)
    })

    if (response.ok) {
      return { success: true, opportunity_id: opportunity.id }
    } else {
      console.error('Failed to trigger email sequence:', await response.text())
      return { success: false, error: 'Failed to trigger sequence' }
    }

  } catch (error) {
    console.error('Error triggering email sequence:', error)
    return { success: false, error: error.message }
  }
}

// Helper functions
function getNextTier(currentPlan) {
  const progression = {
    starter: 'growth',
    growth: 'scale',
    scale: 'pro',
    pro: 'enterprise'
  }
  return progression[currentPlan] || null
}

function getRequiredPlanForFeature(featureName, featureCategory) {
  // Map features to required plans
  const featureMap = {
    api_access: 'scale',
    webhook_access: 'scale',
    advanced_integrations: 'scale',
    custom_integrations: 'enterprise',
    white_label: 'enterprise',
    custom_branding: 'enterprise',
    advanced_analytics: 'pro',
    custom_reports: 'pro',
    team_collaboration: 'scale',
    role_management: 'pro',
    sso_integration: 'enterprise',
    priority_support: 'pro',
    dedicated_manager: 'enterprise'
  }

  const normalizedFeatureName = featureName.toLowerCase().replace(/[\s-]/g, '_')
  return featureMap[normalizedFeatureName] || 'pro'
}

function getCompetitiveUpgradePlan(currentPlan, competitor) {
  // Strategic upgrade recommendations based on competitive threats
  const competitiveUpgrades = {
    apollo: 'scale', // Need API and integrations to compete
    outreach: 'pro', // Need advanced features
    zoominfo: 'enterprise', // Need enterprise features
    hubspot: 'scale' // Need integration capabilities
  }

  const recommended = competitiveUpgrades[competitor.toLowerCase()]
  return isUpgrade(currentPlan, recommended) ? recommended : getNextTier(currentPlan)
}

function isUpgrade(currentPlan, targetPlan) {
  const hierarchy = ['starter', 'growth', 'scale', 'pro', 'enterprise']
  const currentIndex = hierarchy.indexOf(currentPlan)
  const targetIndex = hierarchy.indexOf(targetPlan)
  return targetIndex > currentIndex
}

function calculateUpgradeValue(currentPlan, targetPlan) {
  const pricing = {
    starter: 588,
    growth: 1788,
    scale: 3588,
    pro: 8988,
    enterprise: 17988
  }

  return pricing[targetPlan] - pricing[currentPlan]
}