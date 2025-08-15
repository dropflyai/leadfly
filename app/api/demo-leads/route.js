import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3loaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg1MjE3NCwiZXhwIjoyMDQ5NDI4MTc0fQ.q30mqGJAOJ-Bk-2_sMqfWWTTpvhjRVpJP6KBM3GzgDo'
)

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'company_name', 'job_title', 'industry']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Prepare data for insertion
    const demoLeadData = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      company_name: body.company_name,
      job_title: body.job_title,
      phone: body.phone || null,
      industry: body.industry,
      employee_count: body.employee_count || null,
      lead_volume_goal: body.lead_volume_goal || null,
      current_lead_generation: body.current_lead_generation || null,
      biggest_challenge: body.biggest_challenge || null,
      timeline: body.timeline || null,
      budget_range: body.budget_range || null,
      status: 'demo_requested',
      source: 'website_demo_form',
      created_at: new Date().toISOString()
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('demo_leads')
      .insert([demoLeadData])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      
      // Check if it's a table doesn't exist error
      if (error.code === '42P01') {
        // Table doesn't exist, let's try to create it
        const { error: createError } = await supabase.rpc('create_demo_leads_table')
        
        if (createError) {
          console.error('Table creation error:', createError)
          return NextResponse.json(
            { error: 'Database table setup required. Please contact support.' },
            { status: 500 }
          )
        }
        
        // Try insert again after table creation
        const { data: retryData, error: retryError } = await supabase
          .from('demo_leads')
          .insert([demoLeadData])
          .select()
          
        if (retryError) {
          console.error('Retry insert error:', retryError)
          return NextResponse.json(
            { error: 'Failed to save demo request' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'Demo request submitted successfully',
          demo_lead: retryData[0]
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to save demo request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Demo request submitted successfully',
      demo_lead: data[0]
    })

  } catch (error) {
    console.error('Demo leads API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('demo_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: demoLeads, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch demo requests' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('demo_leads')
      .select('*', { count: 'exact', head: true })
    
    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      success: true,
      demo_leads: demoLeads || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get demo leads API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    )
  }
}