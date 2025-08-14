import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3loaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg1MjE3NCwiZXhwIjoyMDQ5NDI4MTc0fQ.q30mqGJAOJ-Bk-2_sMqfWWTTpvhjRVpJP6KBM3GzgDo'
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const min_score = searchParams.get('min_score')
    const industry = searchParams.get('industry')
    const company_size = searchParams.get('company_size')

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Apply filters
    if (min_score) {
      query = query.gte('lead_score', parseInt(min_score))
    }
    if (industry) {
      query = query.eq('industry', industry)
    }
    if (company_size) {
      query = query.eq('company_size', company_size)
    }

    const { data: leads, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)

    return NextResponse.json({
      success: true,
      leads: leads || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get leads API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { lead_id, status, notes } = body

    if (!lead_id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const updateData = {}
    if (status) updateData.status = status
    if (notes) updateData.notes = notes
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', lead_id)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead: data[0]
    })

  } catch (error) {
    console.error('Update lead API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    )
  }
}