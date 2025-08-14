import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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
    const status = searchParams.get('status') || null
    const priority = searchParams.get('priority') || null
    const type = searchParams.get('type') || null
    const limit = parseInt(searchParams.get('limit')) || 10

    // Build query
    let query = supabase
      .from('expansion_opportunities')
      .select(`
        *,
        profiles:user_id (
          email,
          subscription_tier_slug
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)
    if (type) query = query.eq('opportunity_type', type)

    const { data: opportunities, error } = await query

    if (error) {
      console.error('Error fetching expansion opportunities:', error)
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    return NextResponse.json({ opportunities })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      opportunity_type,
      current_plan,
      recommended_plan,
      trigger_event,
      trigger_data,
      priority = 'medium',
      potential_arr_increase = 0,
      probability_percentage = 50
    } = body

    // Validate required fields
    if (!opportunity_type || !current_plan || !trigger_event) {
      return NextResponse.json({ 
        error: 'Missing required fields: opportunity_type, current_plan, trigger_event' 
      }, { status: 400 })
    }

    // Create expansion opportunity
    const { data: opportunity, error } = await supabase
      .from('expansion_opportunities')
      .insert({
        user_id: user.id,
        opportunity_type,
        current_plan,
        recommended_plan,
        trigger_event,
        trigger_data: trigger_data || {},
        priority,
        potential_arr_increase,
        probability_percentage
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating expansion opportunity:', error)
      return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
    }

    // Check for matching campaigns and auto-enroll
    const { error: enrollError } = await supabase.rpc('enroll_in_upsell_campaigns')
    if (enrollError) {
      console.warn('Error enrolling in campaigns:', enrollError)
    }

    return NextResponse.json({ opportunity }, { status: 201 })

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
    const { opportunity_id, ...updates } = body

    if (!opportunity_id) {
      return NextResponse.json({ error: 'Missing opportunity_id' }, { status: 400 })
    }

    // Update opportunity
    const { data: opportunity, error } = await supabase
      .from('expansion_opportunities')
      .update(updates)
      .eq('id', opportunity_id)
      .eq('user_id', user.id) // Ensure user owns the opportunity
      .select()
      .single()

    if (error) {
      console.error('Error updating expansion opportunity:', error)
      return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
    }

    return NextResponse.json({ opportunity })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}