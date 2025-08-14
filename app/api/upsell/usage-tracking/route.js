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
      metric_name,
      metric_value,
      metric_unit = 'count',
      measurement_date = new Date().toISOString().split('T')[0]
    } = body

    // Validate required fields
    if (!metric_name || metric_value === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: metric_name, metric_value' 
      }, { status: 400 })
    }

    // Get user's current subscription tier to determine limits
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

    // Determine plan limits based on tier and metric
    const tierSlug = subscription.subscription_tiers.slug
    const planLimits = {
      leads_processed: {
        starter: 50,
        growth: 200,
        scale: 500,
        pro: 2000,
        enterprise: -1 // unlimited
      },
      api_calls: {
        starter: 0,
        growth: 100,
        scale: 1000,
        pro: 10000,
        enterprise: -1
      },
      team_members: {
        starter: 1,
        growth: 3,
        scale: 10,
        pro: 25,
        enterprise: -1
      },
      integrations: {
        starter: 1,
        growth: 3,
        scale: 10,
        pro: 25,
        enterprise: -1
      }
    }

    const plan_limit = planLimits[metric_name]?.[tierSlug] || 0

    // Insert usage analytics
    const { data: analytics, error } = await supabase
      .from('usage_analytics')
      .insert({
        user_id: user.id,
        metric_name,
        metric_value,
        metric_unit,
        measurement_date,
        plan_limit: plan_limit === -1 ? null : plan_limit
      })
      .select()
      .single()

    if (error) {
      console.error('Error recording usage analytics:', error)
      return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 })
    }

    // Check for usage-based upsell triggers
    if (plan_limit > 0) {
      const utilization = (metric_value / plan_limit) * 100
      
      // Create expansion opportunity if usage is high
      if (utilization >= 80) {
        await createUsageOpportunity(supabase, user.id, tierSlug, metric_name, utilization, metric_value, plan_limit)
      }
    }

    return NextResponse.json({ 
      analytics,
      utilization: plan_limit > 0 ? (metric_value / plan_limit) * 100 : 0,
      plan_limit
    })

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
    const metric_name = searchParams.get('metric_name')
    const days = parseInt(searchParams.get('days')) || 30
    const start_date = new Date()
    start_date.setDate(start_date.getDate() - days)

    // Build query
    let query = supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('measurement_date', start_date.toISOString().split('T')[0])
      .order('measurement_date', { ascending: false })

    if (metric_name) {
      query = query.eq('metric_name', metric_name)
    }

    const { data: analytics, error } = await query

    if (error) {
      console.error('Error fetching usage analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Calculate trends and insights
    const insights = calculateUsageInsights(analytics)

    return NextResponse.json({ analytics, insights })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to create usage-based expansion opportunities
async function createUsageOpportunity(supabase, userId, currentPlan, metricName, utilization, currentValue, planLimit) {
  const recommendedPlans = {
    starter: 'growth',
    growth: 'scale',
    scale: 'pro',
    pro: 'enterprise'
  }

  const potentialArrIncrease = {
    starter: 1200,  // $149-$49 = $100 * 12
    growth: 1800,   // $299-$149 = $150 * 12
    scale: 5400,    // $749-$299 = $450 * 12
    pro: 9000       // $1499-$749 = $750 * 12
  }

  const recommendedPlan = recommendedPlans[currentPlan]
  if (!recommendedPlan) return

  // Check if opportunity already exists
  const { data: existingOpportunity } = await supabase
    .from('expansion_opportunities')
    .select('id')
    .eq('user_id', userId)
    .eq('opportunity_type', 'usage_upgrade')
    .eq('current_plan', currentPlan)
    .in('status', ['identified', 'qualified', 'engaged'])
    .single()

  if (existingOpportunity) return // Don't create duplicate

  // Create new expansion opportunity
  const { error } = await supabase
    .from('expansion_opportunities')
    .insert({
      user_id: userId,
      opportunity_type: 'usage_upgrade',
      current_plan: currentPlan,
      recommended_plan: recommendedPlan,
      trigger_event: 'usage_threshold_exceeded',
      trigger_data: {
        metric_name: metricName,
        current_usage: currentValue,
        plan_limit: planLimit,
        utilization_percentage: utilization
      },
      priority: utilization >= 95 ? 'critical' : utilization >= 90 ? 'high' : 'medium',
      potential_arr_increase: potentialArrIncrease[currentPlan] || 0,
      probability_percentage: utilization >= 95 ? 80 : utilization >= 90 ? 70 : 60
    })

  if (error) {
    console.error('Error creating usage opportunity:', error)
  }
}

// Helper function to calculate usage insights
function calculateUsageInsights(analytics) {
  if (!analytics || analytics.length === 0) return {}

  const insights = {}
  
  // Group by metric name
  const metricGroups = analytics.reduce((groups, record) => {
    if (!groups[record.metric_name]) {
      groups[record.metric_name] = []
    }
    groups[record.metric_name].push(record)
    return groups
  }, {})

  // Calculate insights for each metric
  Object.keys(metricGroups).forEach(metricName => {
    const records = metricGroups[metricName].sort((a, b) => 
      new Date(a.measurement_date) - new Date(b.measurement_date)
    )

    const latest = records[records.length - 1]
    const previous = records[records.length - 2]
    
    insights[metricName] = {
      current_value: latest?.metric_value || 0,
      current_utilization: latest?.utilization_percentage || 0,
      plan_limit: latest?.plan_limit,
      trend: previous ? 
        ((latest.metric_value - previous.metric_value) / previous.metric_value * 100).toFixed(1) : 
        0,
      approaching_limit: latest?.utilization_percentage >= 75,
      upgrade_recommended: latest?.utilization_percentage >= 80,
      days_until_limit: latest?.plan_limit && latest?.metric_value > 0 ? 
        Math.max(0, Math.floor((latest.plan_limit - latest.metric_value) / (latest.metric_value / records.length))) : 
        null
    }
  })

  return insights
}