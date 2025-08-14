import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      feature_name,
      feature_category,
      request_description,
      business_justification,
      urgency_level = 'medium',
      request_source = 'in_app'
    } = body

    // Validate required fields
    if (!feature_name || !request_description) {
      return NextResponse.json({ 
        error: 'Missing required fields: feature_name, request_description' 
      }, { status: 400 })
    }

    // Get user's current subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        subscription_tiers (
          slug,
          features
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'User subscription not found' }, { status: 404 })
    }

    const currentPlan = subscription.subscription_tiers.slug

    // Determine if feature requires upgrade and which plan
    const featureAvailability = analyzeFeatureAvailability(feature_name, feature_category, currentPlan)

    // Create feature request
    const { data: featureRequest, error } = await supabase
      .from('feature_requests')
      .insert({
        user_id: user.id,
        feature_name,
        feature_category,
        request_description,
        business_justification,
        urgency_level,
        request_source,
        available_in_plan: featureAvailability.available_in_plan,
        upgrade_required: featureAvailability.upgrade_required,
        estimated_upgrade_value: featureAvailability.estimated_upgrade_value
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating feature request:', error)
      return NextResponse.json({ error: 'Failed to create feature request' }, { status: 500 })
    }

    // Create expansion opportunity if upgrade is required
    if (featureAvailability.upgrade_required) {
      await createFeatureOpportunity(
        supabase, 
        user.id, 
        currentPlan, 
        featureAvailability, 
        featureRequest,
        urgency_level
      )
    }

    // Send confirmation email/notification
    await sendFeatureRequestConfirmation(supabase, user.id, featureRequest)

    return NextResponse.json({ 
      feature_request: featureRequest,
      upgrade_analysis: featureAvailability
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit')) || 50

    // Build query
    let query = supabase
      .from('feature_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)
    if (category) query = query.eq('feature_category', category)

    const { data: requests, error } = await query

    if (error) {
      console.error('Error fetching feature requests:', error)
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    return NextResponse.json({ requests })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { request_id, status, response_content } = body

    if (!request_id) {
      return NextResponse.json({ error: 'Missing request_id' }, { status: 400 })
    }

    // Update feature request
    const updates = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (response_content) updates.response_content = response_content
    if (status === 'responded') updates.response_sent_at = new Date().toISOString()

    const { data: featureRequest, error } = await supabase
      .from('feature_requests')
      .update(updates)
      .eq('id', request_id)
      .eq('user_id', user.id) // Ensure user owns the request
      .select()
      .single()

    if (error) {
      console.error('Error updating feature request:', error)
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
    }

    return NextResponse.json({ feature_request: featureRequest })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to analyze feature availability across plans
function analyzeFeatureAvailability(featureName, featureCategory, currentPlan) {
  const featureMap = {
    // API and Integration Features
    'api_access': { plan: 'scale', category: 'api' },
    'webhook_access': { plan: 'scale', category: 'api' },
    'advanced_integrations': { plan: 'scale', category: 'integrations' },
    'custom_integrations': { plan: 'enterprise', category: 'integrations' },
    'zapier_integration': { plan: 'growth', category: 'integrations' },
    'salesforce_integration': { plan: 'scale', category: 'integrations' },
    'hubspot_integration': { plan: 'growth', category: 'integrations' },
    
    // Advanced Features
    'white_label': { plan: 'enterprise', category: 'branding' },
    'custom_branding': { plan: 'enterprise', category: 'branding' },
    'advanced_analytics': { plan: 'pro', category: 'analytics' },
    'custom_reports': { plan: 'pro', category: 'analytics' },
    'data_export': { plan: 'scale', category: 'data' },
    'bulk_operations': { plan: 'scale', category: 'operations' },
    
    // Team Features
    'team_collaboration': { plan: 'scale', category: 'team' },
    'role_management': { plan: 'pro', category: 'team' },
    'advanced_permissions': { plan: 'enterprise', category: 'team' },
    'sso_integration': { plan: 'enterprise', category: 'security' },
    
    // Support Features
    'priority_support': { plan: 'pro', category: 'support' },
    'dedicated_manager': { plan: 'enterprise', category: 'support' },
    'phone_support': { plan: 'scale', category: 'support' },
    '24_7_support': { plan: 'pro', category: 'support' }
  }

  // Check feature name variations
  const normalizedFeatureName = featureName.toLowerCase().replace(/[\s-]/g, '_')
  let featureInfo = featureMap[normalizedFeatureName]

  // If not found, try to match by category and keywords
  if (!featureInfo) {
    if (featureName.toLowerCase().includes('api')) {
      featureInfo = { plan: 'scale', category: 'api' }
    } else if (featureName.toLowerCase().includes('integration')) {
      featureInfo = { plan: 'scale', category: 'integrations' }
    } else if (featureName.toLowerCase().includes('white') && featureName.toLowerCase().includes('label')) {
      featureInfo = { plan: 'enterprise', category: 'branding' }
    } else if (featureName.toLowerCase().includes('custom')) {
      featureInfo = { plan: 'enterprise', category: 'custom' }
    } else if (featureName.toLowerCase().includes('advanced')) {
      featureInfo = { plan: 'pro', category: 'advanced' }
    } else if (featureName.toLowerCase().includes('team') || featureName.toLowerCase().includes('collaboration')) {
      featureInfo = { plan: 'scale', category: 'team' }
    } else {
      // Default to next tier up
      const planProgression = { starter: 'growth', growth: 'scale', scale: 'pro', pro: 'enterprise' }
      featureInfo = { plan: planProgression[currentPlan] || 'enterprise', category: 'general' }
    }
  }

  const requiredPlan = featureInfo.plan
  const planHierarchy = ['starter', 'growth', 'scale', 'pro', 'enterprise']
  const currentPlanIndex = planHierarchy.indexOf(currentPlan)
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan)

  const upgradeRequired = requiredPlanIndex > currentPlanIndex
  
  // Calculate upgrade value
  const planPricing = {
    starter: 588,   // $49/month
    growth: 1788,   // $149/month
    scale: 3588,    // $299/month
    pro: 8988,      // $749/month
    enterprise: 17988 // $1499/month
  }

  const estimatedUpgradeValue = upgradeRequired ? 
    planPricing[requiredPlan] - planPricing[currentPlan] : 0

  return {
    available_in_plan: requiredPlan,
    upgrade_required: upgradeRequired,
    estimated_upgrade_value: estimatedUpgradeValue,
    feature_category: featureInfo.category,
    current_plan_index: currentPlanIndex,
    required_plan_index: requiredPlanIndex
  }
}

// Helper function to create feature-based expansion opportunity
async function createFeatureOpportunity(supabase, userId, currentPlan, featureAvailability, featureRequest, urgencyLevel) {
  // Check if similar opportunity already exists
  const { data: existingOpportunity } = await supabase
    .from('expansion_opportunities')
    .select('id')
    .eq('user_id', userId)
    .eq('opportunity_type', 'feature_upgrade')
    .eq('current_plan', currentPlan)
    .eq('recommended_plan', featureAvailability.available_in_plan)
    .in('status', ['identified', 'qualified', 'engaged'])
    .single()

  if (existingOpportunity) return // Don't create duplicate

  const probabilityMap = {
    critical: 85,
    high: 75,
    medium: 65,
    low: 50
  }

  const priorityMap = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low'
  }

  // Create expansion opportunity
  const { error } = await supabase
    .from('expansion_opportunities')
    .insert({
      user_id: userId,
      opportunity_type: 'feature_upgrade',
      current_plan: currentPlan,
      recommended_plan: featureAvailability.available_in_plan,
      trigger_event: 'feature_request_submitted',
      trigger_data: {
        feature_name: featureRequest.feature_name,
        feature_category: featureRequest.feature_category,
        urgency_level: urgencyLevel,
        request_id: featureRequest.id,
        business_justification: featureRequest.business_justification
      },
      priority: priorityMap[urgencyLevel] || 'medium',
      potential_arr_increase: featureAvailability.estimated_upgrade_value,
      probability_percentage: probabilityMap[urgencyLevel] || 65
    })

  if (error) {
    console.error('Error creating feature opportunity:', error)
  }
}

// Helper function to send feature request confirmation
async function sendFeatureRequestConfirmation(supabase, userId, featureRequest) {
  try {
    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!profile) return

    // Log interaction for follow-up
    await supabase
      .from('upsell_interactions')
      .insert({
        user_id: userId,
        interaction_type: 'feature_requested',
        interaction_medium: 'email',
        subject_line: `Feature Request Received: ${featureRequest.feature_name}`,
        message_content: `Thank you for your feature request. We've received your request for "${featureRequest.feature_name}" and will review it shortly.`,
        interaction_data: {
          feature_request_id: featureRequest.id,
          feature_name: featureRequest.feature_name,
          urgency_level: featureRequest.urgency_level
        },
        performed_by: 'System'
      })

    // TODO: Send actual email using your email service
    console.log('Feature request confirmation logged for:', profile.email)

  } catch (error) {
    console.error('Error sending feature request confirmation:', error)
  }
}