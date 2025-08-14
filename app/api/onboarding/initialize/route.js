import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    const { 
      user_id, 
      email, 
      plan_type = 'starter', 
      stripe_customer_id, 
      subscription_id 
    } = body

    // Validate required fields
    if (!user_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, email' },
        { status: 400 }
      )
    }

    // Check if onboarding already exists
    const { data: existing } = await supabase
      .from('subscriber_onboarding')
      .select('id, status')
      .eq('user_id', user_id)
      .single()

    if (existing && existing.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Onboarding already completed',
        onboarding_id: existing.id,
        status: 'completed'
      })
    }

    // Define onboarding flows based on plan type
    const onboardingFlows = {
      starter: {
        steps: [
          { name: 'welcome_complete', order: 1, required: true },
          { name: 'profile_setup', order: 2, required: true },
          { name: 'first_lead_capture', order: 3, required: true },
          { name: 'ai_features_intro', order: 4, required: false },
          { name: 'dashboard_tour', order: 5, required: false }
        ],
        duration_days: 7,
        email_sequence: 'starter_onboarding',
        features_to_enable: ['basic_lead_processing', 'email_templates', 'basic_analytics']
      },
      pro: {
        steps: [
          { name: 'welcome_complete', order: 1, required: true },
          { name: 'profile_setup', order: 2, required: true },
          { name: 'integration_setup', order: 3, required: true },
          { name: 'first_lead_capture', order: 4, required: true },
          { name: 'ai_features_intro', order: 5, required: false },
          { name: 'dashboard_tour', order: 6, required: false }
        ],
        duration_days: 14,
        email_sequence: 'pro_onboarding',
        features_to_enable: ['advanced_ai', 'integrations', 'advanced_analytics', 'api_access']
      },
      enterprise: {
        steps: [
          { name: 'welcome_complete', order: 1, required: true },
          { name: 'profile_setup', order: 2, required: true },
          { name: 'team_setup', order: 3, required: true },
          { name: 'integration_setup', order: 4, required: true },
          { name: 'first_lead_capture', order: 5, required: true },
          { name: 'ai_features_intro', order: 6, required: false },
          { name: 'dashboard_tour', order: 7, required: false }
        ],
        duration_days: 21,
        email_sequence: 'enterprise_onboarding',
        features_to_enable: ['all_features', 'white_label', 'custom_integrations', 'priority_support']
      }
    }

    const flow = onboardingFlows[plan_type] || onboardingFlows.starter

    // Create or update onboarding session
    const onboardingData = {
      user_id,
      email,
      plan_type,
      stripe_customer_id,
      subscription_id,
      onboarding_data: {
        flow: flow,
        started_at: new Date().toISOString(),
        expected_completion: new Date(Date.now() + flow.duration_days * 24 * 60 * 60 * 1000).toISOString()
      },
      current_step: 0,
      status: 'started'
    }

    let onboardingId

    if (existing) {
      // Update existing onboarding
      const { data: updated, error: updateError } = await supabase
        .from('subscriber_onboarding')
        .update(onboardingData)
        .eq('user_id', user_id)
        .select()
        .single()

      if (updateError) throw updateError
      onboardingId = updated.id

    } else {
      // Create new onboarding
      const { data: created, error: createError } = await supabase
        .from('subscriber_onboarding')
        .insert(onboardingData)
        .select()
        .single()

      if (createError) throw createError
      onboardingId = created.id
    }

    // Create onboarding steps
    const steps = flow.steps.map(step => ({
      user_id,
      onboarding_id: onboardingId,
      step_name: step.name,
      step_order: step.order,
      status: 'pending',
      step_data: { required: step.required }
    }))

    // Delete existing steps and insert new ones
    await supabase
      .from('onboarding_steps')
      .delete()
      .eq('onboarding_id', onboardingId)

    const { error: stepsError } = await supabase
      .from('onboarding_steps')
      .insert(steps)

    if (stepsError) throw stepsError

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_status: 'in_progress',
        subscription_plan: plan_type,
        stripe_customer_id,
        features_enabled: flow.features_to_enable,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (profileError) throw profileError

    // Trigger onboarding workflow via n8n
    try {
      const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/leadfly/subscriber-onboarding`
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id,
          email,
          plan_type,
          stripe_customer_id,
          subscription_id,
          onboarding_id: onboardingId,
          trigger_source: 'api'
        })
      })

      if (!webhookResponse.ok) {
        console.error('Failed to trigger onboarding workflow:', await webhookResponse.text())
      }

    } catch (webhookError) {
      console.error('Error triggering onboarding workflow:', webhookError)
      // Don't fail the API call if webhook fails
    }

    // Track analytics
    await supabase.rpc('track_onboarding_event', {
      p_user_id: user_id,
      p_event_type: 'onboarding_initialized',
      p_event_data: {
        plan_type,
        flow_type: flow.email_sequence,
        expected_duration_days: flow.duration_days,
        total_steps: flow.steps.length
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding initialized successfully',
      onboarding_id: onboardingId,
      plan_type,
      current_step: 0,
      total_steps: flow.steps.length,
      expected_completion_days: flow.duration_days,
      dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?session=${user_id}`,
      features_enabled: flow.features_to_enable
    })

  } catch (error) {
    console.error('Error initializing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to initialize onboarding', details: error.message },
      { status: 500 }
    )
  }
}