import { generateCompleteLeads } from '../../../../enhanced-lead-api.js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, criteria, count = 25 } = body

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!criteria || !criteria.job_titles || criteria.job_titles.length === 0) {
      return NextResponse.json(
        { error: 'At least one job title is required' },
        { status: 400 }
      )
    }

    // Validate lead count
    if (count < 1 || count > 1000) {
      return NextResponse.json(
        { error: 'Lead count must be between 1 and 1000' },
        { status: 400 }
      )
    }

    console.log(`🚀 Generating ${count} leads for user ${user_id}`)

    // Generate leads using your API
    const result = await generateCompleteLeads(user_id, criteria, count)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Lead generation failed' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully generated ${result.count} leads`,
      data: {
        leads_generated: result.count,
        high_value_leads: result.high_value_count,
        remaining_credits: result.remaining_leads,
        cost_breakdown: result.cost_breakdown,
        leads: result.leads.slice(0, 5) // Return first 5 for preview
      }
    })

  } catch (error) {
    console.error('Lead generation API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}