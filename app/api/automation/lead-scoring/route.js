import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// AI-Powered Lead Scoring and Qualification Engine
export async function POST(request) {
  try {
    const { action, lead_id, engagement_data, batch_leads } = await request.json()

    switch (action) {
      case 'score_lead':
        return await scoreSingleLead(lead_id)
      case 'batch_score':
        return await batchScoreLeads(batch_leads)
      case 'update_engagement_score':
        return await updateEngagementScore(lead_id, engagement_data)
      case 'qualify_warm_leads':
        return await qualifyWarmLeads()
      case 'get_lead_insights':
        return await getLeadInsights(lead_id)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Lead scoring error:', error)
    return NextResponse.json(
      { 
        error: 'Lead scoring failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Score individual lead using AI algorithms
async function scoreSingleLead(leadId) {
  try {
    console.log('🎯 Scoring lead:', leadId)

    // Get lead with full context
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
        email_engagement(*),
        landing_pages(views, conversions, last_viewed_at),
        email_sequences(current_step, total_steps, status),
        users!inner(
          user_subscriptions!inner(
            subscription_tiers(name, features)
          )
        )
      `)
      .eq('id', leadId)
      .single()

    if (!lead) {
      throw new Error('Lead not found')
    }

    // Calculate comprehensive AI score
    const scoreData = await calculateAIScore(lead)
    
    // Update lead with new score and insights
    const { error } = await supabase
      .from('leads')
      .update({
        score: scoreData.total_score,
        qualification_level: scoreData.qualification_level,
        scoring_breakdown: scoreData.breakdown,
        ai_insights: scoreData.insights,
        last_scored_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (error) throw error

    // Check if lead qualifies for warm status
    if (scoreData.total_score >= 75 && scoreData.qualification_level === 'warm') {
      await promoteToWarmLead(lead, scoreData)
    }

    console.log(`✅ Lead scored: ${scoreData.total_score}/100 (${scoreData.qualification_level})`)

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      score: scoreData.total_score,
      qualification_level: scoreData.qualification_level,
      breakdown: scoreData.breakdown,
      insights: scoreData.insights
    })

  } catch (error) {
    console.error('❌ Lead scoring failed:', error)
    throw error
  }
}

// Batch score multiple leads efficiently
async function batchScoreLeads(leadIds) {
  try {
    console.log('🎯 Batch scoring leads:', leadIds.length)

    const results = []
    
    // Process in batches of 10 for performance
    for (let i = 0; i < leadIds.length; i += 10) {
      const batch = leadIds.slice(i, i + 10)
      const batchPromises = batch.map(leadId => scoreSingleLead(leadId))
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push({
            lead_id: batch[index],
            success: true,
            data: result.value
          })
        } else {
          results.push({
            lead_id: batch[index],
            success: false,
            error: result.reason.message
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      batch_size: leadIds.length,
      results
    })

  } catch (error) {
    console.error('❌ Batch scoring failed:', error)
    throw error
  }
}

// Update score based on engagement events
async function updateEngagementScore(leadId, engagementData) {
  try {
    const { event_type, timestamp, metadata } = engagementData

    console.log(`📊 Updating engagement score for lead ${leadId}: ${event_type}`)

    // Get current lead data
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (!lead) {
      throw new Error('Lead not found')
    }

    // Calculate engagement boost
    const engagementBoost = calculateEngagementBoost(event_type, metadata, lead)
    
    // Update lead score
    const newScore = Math.min(100, lead.score + engagementBoost.score_change)
    
    await supabase
      .from('leads')
      .update({
        score: newScore,
        last_engagement: timestamp,
        engagement_velocity: calculateEngagementVelocity(lead, engagementBoost)
      })
      .eq('id', leadId)

    // Log engagement event
    await supabase
      .from('lead_scoring_events')
      .insert({
        lead_id: leadId,
        event_type,
        score_change: engagementBoost.score_change,
        new_score: newScore,
        reasoning: engagementBoost.reasoning,
        metadata,
        timestamp
      })

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      event_type,
      score_change: engagementBoost.score_change,
      new_score: newScore,
      reasoning: engagementBoost.reasoning
    })

  } catch (error) {
    console.error('❌ Engagement score update failed:', error)
    throw error
  }
}

// AI-powered scoring algorithm
async function calculateAIScore(lead) {
  const breakdown = {
    profile_quality: 0,
    engagement_score: 0,
    behavioral_signals: 0,
    company_fit: 0,
    timing_indicators: 0
  }

  // 1. Profile Quality Score (0-25 points)
  breakdown.profile_quality = calculateProfileQuality(lead)

  // 2. Engagement Score (0-30 points)
  breakdown.engagement_score = calculateEngagementScore(lead)

  // 3. Behavioral Signals (0-25 points)
  breakdown.behavioral_signals = calculateBehavioralSignals(lead)

  // 4. Company Fit Score (0-15 points)
  breakdown.company_fit = calculateCompanyFit(lead)

  // 5. Timing Indicators (0-5 points)
  breakdown.timing_indicators = calculateTimingIndicators(lead)

  const total_score = Object.values(breakdown).reduce((sum, score) => sum + score, 0)

  // Determine qualification level
  let qualification_level = 'cold'
  if (total_score >= 75) qualification_level = 'warm'
  else if (total_score >= 50) qualification_level = 'lukewarm'
  else if (total_score >= 25) qualification_level = 'cool'

  // Generate AI insights
  const insights = generateAIInsights(lead, breakdown, total_score)

  return {
    total_score: Math.round(total_score),
    qualification_level,
    breakdown,
    insights
  }
}

// Profile Quality Assessment
function calculateProfileQuality(lead) {
  let score = 0

  // Email quality (0-8 points)
  if (lead.email) {
    const domain = lead.email.split('@')[1]
    if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
      score += 8 // Business email
    } else {
      score += 3 // Personal email
    }
  }

  // Complete profile (0-10 points)
  if (lead.first_name) score += 2
  if (lead.last_name) score += 2
  if (lead.company) score += 3
  if (lead.title) score += 2
  if (lead.linkedin_url) score += 1

  // Phone number (0-3 points)
  if (lead.phone) score += 3

  // Industry relevance (0-4 points)
  if (lead.industry) {
    const highValueIndustries = ['technology', 'finance', 'healthcare', 'manufacturing']
    if (highValueIndustries.includes(lead.industry.toLowerCase())) {
      score += 4
    } else {
      score += 2
    }
  }

  return Math.min(25, score)
}

// Engagement Score Calculation
function calculateEngagementScore(lead) {
  let score = 0
  const engagements = lead.email_engagement || []

  // Email opens (0-8 points)
  const opens = engagements.filter(e => e.event_type === 'opened').length
  score += Math.min(8, opens * 2)

  // Email clicks (0-12 points)
  const clicks = engagements.filter(e => e.event_type === 'clicked').length
  score += Math.min(12, clicks * 4)

  // Email replies (0-10 points)
  const replies = engagements.filter(e => e.event_type === 'replied').length
  score += Math.min(10, replies * 10)

  // Landing page engagement (0-8 points)
  if (lead.landing_pages && lead.landing_pages.length > 0) {
    const page = lead.landing_pages[0]
    if (page.views > 0) score += 3
    if (page.views > 2) score += 2
    if (page.conversions > 0) score += 3
  }

  // Sequence progression (0-5 points)
  if (lead.email_sequences && lead.email_sequences.length > 0) {
    const sequence = lead.email_sequences[0]
    const progression = (sequence.current_step / sequence.total_steps) * 5
    score += progression
  }

  return Math.min(30, Math.round(score))
}

// Behavioral Signals Analysis
function calculateBehavioralSignals(lead) {
  let score = 0

  // Response timing (0-8 points)
  const engagements = lead.email_engagement || []
  if (engagements.length > 0) {
    const fastResponses = engagements.filter(e => {
      // Check if engagement happened within 24 hours of email send
      return true // Simplified for demo
    })
    score += Math.min(8, fastResponses.length * 2)
  }

  // Engagement consistency (0-7 points)
  if (engagements.length >= 3) score += 4
  if (engagements.length >= 5) score += 3

  // Forward/share behavior (0-5 points)
  const forwards = engagements.filter(e => e.event_type === 'forwarded').length
  score += Math.min(5, forwards * 5)

  // Time spent on page (0-5 points)
  if (lead.landing_pages && lead.landing_pages.length > 0) {
    // Simplified - in production would track actual time on page
    score += 3
  }

  return Math.min(25, score)
}

// Company Fit Assessment
function calculateCompanyFit(lead) {
  let score = 0

  // Company size indicators (0-6 points)
  if (lead.company_size) {
    const size = lead.company_size.toLowerCase()
    if (size.includes('1000+') || size.includes('enterprise')) score += 6
    else if (size.includes('100-1000') || size.includes('medium')) score += 4
    else if (size.includes('10-100') || size.includes('small')) score += 3
    else score += 1
  }

  // Title relevance (0-6 points)
  if (lead.title) {
    const title = lead.title.toLowerCase()
    const decisionMakerTitles = ['ceo', 'cto', 'vp', 'director', 'head', 'manager']
    if (decisionMakerTitles.some(t => title.includes(t))) {
      score += 6
    } else {
      score += 2
    }
  }

  // Industry alignment (0-3 points)
  if (lead.industry) {
    // Scoring based on how well industry aligns with LeadFly's target market
    score += 3
  }

  return Math.min(15, score)
}

// Timing Indicators
function calculateTimingIndicators(lead) {
  let score = 0

  // Recent engagement (0-3 points)
  if (lead.last_engagement) {
    const hoursSinceEngagement = (new Date() - new Date(lead.last_engagement)) / (1000 * 60 * 60)
    if (hoursSinceEngagement < 24) score += 3
    else if (hoursSinceEngagement < 72) score += 2
    else if (hoursSinceEngagement < 168) score += 1
  }

  // Sequence timing (0-2 points)
  if (lead.email_sequences && lead.email_sequences.length > 0) {
    const sequence = lead.email_sequences[0]
    if (sequence.status === 'active') score += 2
  }

  return Math.min(5, score)
}

// Generate AI insights and recommendations
function generateAIInsights(lead, breakdown, totalScore) {
  const insights = {
    overall_assessment: '',
    strengths: [],
    areas_for_improvement: [],
    recommended_actions: [],
    conversion_probability: 0
  }

  // Overall assessment
  if (totalScore >= 75) {
    insights.overall_assessment = 'High-quality lead ready for direct sales contact'
  } else if (totalScore >= 50) {
    insights.overall_assessment = 'Promising lead requiring additional nurturing'
  } else if (totalScore >= 25) {
    insights.overall_assessment = 'Early-stage lead with potential for development'
  } else {
    insights.overall_assessment = 'Low-quality lead requiring qualification review'
  }

  // Identify strengths
  if (breakdown.engagement_score > 20) {
    insights.strengths.push('High email engagement and responsiveness')
  }
  if (breakdown.profile_quality > 18) {
    insights.strengths.push('Complete professional profile with business email')
  }
  if (breakdown.company_fit > 10) {
    insights.strengths.push('Strong company and role alignment')
  }

  // Areas for improvement
  if (breakdown.engagement_score < 10) {
    insights.areas_for_improvement.push('Low email engagement - needs better content')
  }
  if (breakdown.behavioral_signals < 10) {
    insights.areas_for_improvement.push('Limited behavioral signals - extend nurturing period')
  }

  // Recommended actions
  if (totalScore >= 75) {
    insights.recommended_actions.push('Schedule warm call within 24 hours')
    insights.recommended_actions.push('Prepare personalized pitch deck')
  } else if (totalScore >= 50) {
    insights.recommended_actions.push('Continue email nurturing sequence')
    insights.recommended_actions.push('Send targeted content based on interests')
  } else {
    insights.recommended_actions.push('Re-evaluate lead qualification criteria')
    insights.recommended_actions.push('Consider different messaging approach')
  }

  // Conversion probability (simplified AI prediction)
  insights.conversion_probability = Math.min(95, totalScore * 1.2)

  return insights
}

// Calculate engagement boost from specific events
function calculateEngagementBoost(eventType, metadata, lead) {
  const boosts = {
    'opened': { score: 2, reasoning: 'Email opened - showing initial interest' },
    'clicked': { score: 8, reasoning: 'Clicked link - active engagement with content' },
    'replied': { score: 15, reasoning: 'Replied to email - direct communication initiated' },
    'page_view': { score: 5, reasoning: 'Visited landing page - researching solution' },
    'form_submit': { score: 20, reasoning: 'Submitted form - strong buying signal' },
    'download': { score: 12, reasoning: 'Downloaded resource - information gathering phase' },
    'video_watch': { score: 10, reasoning: 'Watched video - engaged with detailed content' },
    'unsubscribed': { score: -25, reasoning: 'Unsubscribed - no longer interested' }
  }

  const boost = boosts[eventType] || { score: 0, reasoning: 'Unknown event type' }

  // Apply time-based multipliers
  if (metadata?.timestamp) {
    const hoursAgo = (new Date() - new Date(metadata.timestamp)) / (1000 * 60 * 60)
    if (hoursAgo < 1) boost.score *= 1.5 // Recent activity gets bonus
    if (hoursAgo > 168) boost.score *= 0.5 // Old activity gets reduced impact
  }

  return {
    score_change: Math.round(boost.score),
    reasoning: boost.reasoning
  }
}

// Calculate engagement velocity (rate of engagement over time)
function calculateEngagementVelocity(lead, engagementBoost) {
  // Simplified velocity calculation
  const recentEngagements = lead.email_engagement?.filter(e => {
    const hoursAgo = (new Date() - new Date(e.timestamp)) / (1000 * 60 * 60)
    return hoursAgo < 168 // Last week
  }) || []

  return recentEngagements.length + (engagementBoost.score_change / 10)
}

// Promote lead to warm status
async function promoteToWarmLead(lead, scoreData) {
  try {
    console.log('🔥 Promoting lead to warm status:', lead.id)

    // Update lead status
    await supabase
      .from('leads')
      .update({
        status: 'warm',
        qualified_at: new Date().toISOString(),
        ready_for_call: true,
        qualification_notes: `Automated qualification: ${scoreData.insights.overall_assessment}`
      })
      .eq('id', lead.id)

    // Schedule warm lead call
    await supabase
      .from('scheduled_tasks')
      .insert({
        task_type: 'schedule_warm_call',
        lead_id: lead.id,
        user_id: lead.user_id,
        scheduled_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
        task_data: {
          score: scoreData.total_score,
          qualification_level: scoreData.qualification_level,
          priority: scoreData.total_score >= 85 ? 'high' : 'medium'
        },
        status: 'pending',
        priority: scoreData.total_score >= 85 ? 'high' : 'medium'
      })

    // Notify user/sales team
    await supabase
      .from('notifications')
      .insert({
        user_id: lead.user_id,
        type: 'warm_lead_qualified',
        title: 'New Warm Lead Ready',
        message: `${lead.first_name} ${lead.last_name} from ${lead.company} is qualified and ready for calling`,
        data: {
          lead_id: lead.id,
          score: scoreData.total_score,
          call_scheduled: true
        },
        read: false
      })

    console.log('✅ Lead promoted to warm status with call scheduled')

  } catch (error) {
    console.error('❌ Failed to promote lead to warm:', error)
  }
}

// Qualify warm leads across the system
async function qualifyWarmLeads() {
  try {
    console.log('🎯 Running warm lead qualification process')

    // Get all leads that might qualify for warm status
    const { data: candidates } = await supabase
      .from('leads')
      .select(`
        *,
        email_engagement(*),
        landing_pages(*)
      `)
      .eq('status', 'cold')
      .gte('score', 60) // Minimum score threshold
      .order('score', { ascending: false })
      .limit(100)

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No candidates found for warm qualification',
        qualified_count: 0
      })
    }

    let qualifiedCount = 0
    const qualifiedLeads = []

    for (const lead of candidates) {
      const scoreData = await calculateAIScore(lead)
      
      if (scoreData.total_score >= 75 && scoreData.qualification_level === 'warm') {
        await promoteToWarmLead(lead, scoreData)
        qualifiedLeads.push({
          lead_id: lead.id,
          name: `${lead.first_name} ${lead.last_name}`,
          company: lead.company,
          score: scoreData.total_score
        })
        qualifiedCount++
      }
    }

    return NextResponse.json({
      success: true,
      candidates_reviewed: candidates.length,
      qualified_count: qualifiedCount,
      qualified_leads: qualifiedLeads
    })

  } catch (error) {
    console.error('❌ Warm lead qualification failed:', error)
    throw error
  }
}

// Get detailed lead insights
async function getLeadInsights(leadId) {
  try {
    // Get lead with full scoring history
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
        lead_scoring_events(*),
        email_engagement(*),
        landing_pages(*)
      `)
      .eq('id', leadId)
      .single()

    if (!lead) {
      throw new Error('Lead not found')
    }

    // Recalculate current score
    const currentScore = await calculateAIScore(lead)

    // Calculate score trends
    const scoringHistory = lead.lead_scoring_events || []
    const scoreTrend = calculateScoreTrend(scoringHistory)

    return NextResponse.json({
      success: true,
      lead_insights: {
        current_score: currentScore,
        score_trend: scoreTrend,
        engagement_summary: summarizeEngagement(lead.email_engagement),
        recommendation: generateRecommendation(lead, currentScore)
      }
    })

  } catch (error) {
    console.error('❌ Failed to get lead insights:', error)
    throw error
  }
}

// Calculate score trend over time
function calculateScoreTrend(scoringHistory) {
  if (scoringHistory.length < 2) return 'insufficient_data'

  const recent = scoringHistory.slice(-5) // Last 5 events
  const scoreChanges = recent.map(event => event.score_change)
  const avgChange = scoreChanges.reduce((sum, change) => sum + change, 0) / scoreChanges.length

  if (avgChange > 2) return 'improving'
  if (avgChange < -2) return 'declining'
  return 'stable'
}

// Summarize engagement patterns
function summarizeEngagement(engagements) {
  if (!engagements || engagements.length === 0) {
    return { total: 0, pattern: 'no_engagement' }
  }

  const byType = engagements.reduce((acc, eng) => {
    acc[eng.event_type] = (acc[eng.event_type] || 0) + 1
    return acc
  }, {})

  return {
    total: engagements.length,
    breakdown: byType,
    pattern: engagements.length > 5 ? 'highly_engaged' : 
             engagements.length > 2 ? 'moderately_engaged' : 'low_engagement'
  }
}

// Generate actionable recommendation
function generateRecommendation(lead, scoreData) {
  const score = scoreData.total_score

  if (score >= 80) {
    return {
      priority: 'high',
      action: 'immediate_contact',
      message: 'Schedule call within 4 hours - lead is hot and ready to convert'
    }
  } else if (score >= 60) {
    return {
      priority: 'medium',
      action: 'continue_nurturing',
      message: 'Increase email frequency and provide more targeted content'
    }
  } else if (score >= 40) {
    return {
      priority: 'low',
      action: 'long_term_nurturing',
      message: 'Place in long-term nurture sequence, re-evaluate in 30 days'
    }
  } else {
    return {
      priority: 'very_low',
      action: 'review_qualification',
      message: 'Consider removing from active sequences or updating qualification criteria'
    }
  }
}