import { generateCompleteLeads } from '../../../../enhanced-lead-api.js'
import { generateLeadsLocally } from '../../../../local-storage-system.js'
import { generateApolloLeads } from '../../../../apollo-enhanced.js'

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, criteria, count = 25 } = body

    // Validate required fields
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!criteria || !criteria.job_titles || criteria.job_titles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one job title is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate lead count
    if (count < 1 || count > 1000) {
      return new Response(
        JSON.stringify({ error: 'Lead count must be between 1 and 1000' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`🚀 Generating ${count} leads for user ${user_id}`)

    // Try Apollo enhanced system first, then fallback to local storage
    console.log('🚀 Using enhanced Apollo lead generation system...')
    let result = await generateApolloLeads(user_id, criteria, count)

    if (!result.success) {
      console.log('⚠️ Apollo enhanced failed, using local storage fallback...')
      result = await generateLeadsLocally(user_id, criteria, count)
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Lead generation failed' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated ${result.count} leads`,
        storage: result.storage || 'api',
        data: {
          leads_generated: result.count,
          high_value_leads: result.high_value_count || 0,
          remaining_credits: result.remaining_leads || 0,
          cost_breakdown: result.cost_breakdown || { total_cost: 0 },
          leads: result.leads ? result.leads.slice(0, 5) : [] // Return first 5 for preview
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Lead generation API error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}