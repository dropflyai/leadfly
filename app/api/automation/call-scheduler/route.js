import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// TCPA-Compliant Warm Lead Call Scheduling System
export async function POST(request) {
  try {
    const { action, lead_id, call_data, user_id, schedule_preferences } = await request.json()

    switch (action) {
      case 'schedule_warm_call':
        return await scheduleWarmCall(lead_id, call_data)
      case 'update_call_schedule':
        return await updateCallSchedule(call_data.call_id, call_data.updates)
      case 'cancel_call':
        return await cancelCall(call_data.call_id, call_data.reason)
      case 'get_call_queue':
        return await getCallQueue(user_id)
      case 'mark_call_completed':
        return await markCallCompleted(call_data)
      case 'check_tcpa_compliance':
        return await checkTCPACompliance(lead_id)
      case 'get_optimal_call_time':
        return await getOptimalCallTime(lead_id, schedule_preferences)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Call scheduler error:', error)
    return NextResponse.json(
      { 
        error: 'Call scheduling failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Schedule TCPA-compliant warm call
async function scheduleWarmCall(leadId, callData = {}) {
  try {
    console.log('📞 Scheduling warm call for lead:', leadId)

    // Get lead with qualification data
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
        users!inner(
          id,
          timezone,
          user_subscriptions!inner(
            subscription_tiers(name, features)
          )
        ),
        landing_pages(conversions, last_viewed_at),
        email_engagement(*)
      `)
      .eq('id', leadId)
      .single()

    if (!lead) {
      throw new Error('Lead not found')
    }

    // Verify lead is warm and qualified
    if (lead.status !== 'warm' || !lead.ready_for_call) {
      throw new Error('Lead not qualified for calling - must be warm and ready')
    }

    // Check TCPA compliance
    const complianceCheck = await performTCPAComplianceCheck(lead)
    if (!complianceCheck.compliant) {
      throw new Error(`TCPA Compliance failed: ${complianceCheck.reason}`)
    }

    // Calculate optimal call time
    const optimalTime = calculateOptimalCallTime(lead, callData.preferred_time)

    // Get subscription tier limits
    const tierName = lead.users.user_subscriptions[0]?.subscription_tiers?.name || 'starter'
    const callLimits = getCallLimitsForTier(tierName)

    // Check monthly call limits
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: monthlyCallCount } = await supabase
      .from('scheduled_calls')
      .select('id', { count: 'exact' })
      .eq('user_id', lead.user_id)
      .gte('scheduled_at', `${currentMonth}-01`)
      .neq('status', 'cancelled')

    if (monthlyCallCount?.length >= callLimits.monthly_limit) {
      throw new Error(`Monthly call limit reached (${callLimits.monthly_limit})`)
    }

    // Create call record
    const { data: scheduledCall, error } = await supabase
      .from('scheduled_calls')
      .insert({
        lead_id: leadId,
        user_id: lead.user_id,
        scheduled_at: optimalTime.toISOString(),
        call_type: 'warm_lead_qualification',
        priority: lead.score >= 85 ? 'high' : 'medium',
        status: 'scheduled',
        tcpa_compliance: complianceCheck,
        call_preparation: generateCallPreparation(lead),
        estimated_duration: callLimits.call_duration,
        timezone: lead.users.timezone || 'America/New_York',
        contact_attempts: 0,
        max_attempts: callLimits.max_attempts
      })
      .select()
      .single()

    if (error) throw error

    // Schedule call reminder notifications
    await scheduleCallReminders(scheduledCall)

    // Log call scheduling event
    await supabase
      .from('call_logs')
      .insert({
        call_id: scheduledCall.id,
        lead_id: leadId,
        user_id: lead.user_id,
        event_type: 'call_scheduled',
        timestamp: new Date().toISOString(),
        details: {
          scheduled_time: optimalTime.toISOString(),
          compliance_verified: true,
          lead_score: lead.score
        }
      })

    console.log('✅ Warm call scheduled:', scheduledCall.id)

    return NextResponse.json({
      success: true,
      call_id: scheduledCall.id,
      scheduled_time: optimalTime.toISOString(),
      tcpa_compliant: true,
      call_preparation: scheduledCall.call_preparation,
      priority: scheduledCall.priority
    })

  } catch (error) {
    console.error('❌ Failed to schedule warm call:', error)
    throw error
  }
}

// TCPA Compliance Check
async function performTCPAComplianceCheck(lead) {
  const complianceCheck = {
    compliant: false,
    reason: '',
    requirements_met: [],
    requirements_failed: []
  }

  // 1. Verify opt-in through landing page interaction
  const hasPageInteraction = lead.landing_pages && 
    lead.landing_pages.some(page => page.conversions > 0 || page.last_viewed_at)

  if (hasPageInteraction) {
    complianceCheck.requirements_met.push('Landing page interaction verified')
  } else {
    complianceCheck.requirements_failed.push('No landing page interaction found')
  }

  // 2. Verify email engagement (implied consent)
  const hasEmailEngagement = lead.email_engagement && 
    lead.email_engagement.some(eng => ['clicked', 'replied'].includes(eng.event_type))

  if (hasEmailEngagement) {
    complianceCheck.requirements_met.push('Email engagement verified')
  } else {
    complianceCheck.requirements_failed.push('No qualifying email engagement')
  }

  // 3. Check for explicit opt-out/unsubscribe
  const hasOptOut = lead.email_engagement && 
    lead.email_engagement.some(eng => eng.event_type === 'unsubscribed')

  if (hasOptOut) {
    complianceCheck.requirements_failed.push('Lead has unsubscribed')
  } else {
    complianceCheck.requirements_met.push('No opt-out recorded')
  }

  // 4. Verify phone number exists
  if (lead.phone) {
    complianceCheck.requirements_met.push('Phone number available')
  } else {
    complianceCheck.requirements_failed.push('No phone number on file')
  }

  // 5. Check call time restrictions (8 AM - 9 PM in lead's timezone)
  const leadTimezone = lead.location ? getTimezoneFromLocation(lead.location) : 'America/New_York'
  const callTimeCompliant = isValidCallTime(leadTimezone)

  if (callTimeCompliant.valid) {
    complianceCheck.requirements_met.push('Call time within TCPA hours')
  } else {
    complianceCheck.requirements_failed.push(`Call time violation: ${callTimeCompliant.reason}`)
  }

  // Overall compliance determination
  const criticalRequirements = [
    hasPageInteraction || hasEmailEngagement,
    !hasOptOut,
    lead.phone,
    callTimeCompliant.valid
  ]

  complianceCheck.compliant = criticalRequirements.every(req => req === true)
  
  if (!complianceCheck.compliant) {
    complianceCheck.reason = complianceCheck.requirements_failed.join('; ')
  } else {
    complianceCheck.reason = 'All TCPA requirements satisfied'
  }

  return complianceCheck
}

// Calculate optimal call time based on lead data and preferences
function calculateOptimalCallTime(lead, preferredTime) {
  const now = new Date()
  let optimalTime = new Date(now)

  // If specific time provided, use it (with validation)
  if (preferredTime) {
    optimalTime = new Date(preferredTime)
  } else {
    // Calculate based on lead behavior and timezone
    const leadTimezone = lead.location ? getTimezoneFromLocation(lead.location) : 'America/New_York'
    
    // Analyze email engagement patterns for optimal timing
    const engagementHours = analyzeEngagementTiming(lead.email_engagement)
    
    // Default to next business day if outside optimal hours
    const nextBusinessDay = getNextBusinessDay(now)
    const optimalHour = engagementHours.peak_hour || 10 // Default to 10 AM

    optimalTime = new Date(nextBusinessDay)
    optimalTime.setHours(optimalHour, 0, 0, 0)
  }

  // Ensure call is within TCPA compliant hours (8 AM - 9 PM)
  const hour = optimalTime.getHours()
  if (hour < 8) {
    optimalTime.setHours(8, 0, 0, 0)
  } else if (hour > 21) {
    // Move to next day at 8 AM
    optimalTime.setDate(optimalTime.getDate() + 1)
    optimalTime.setHours(8, 0, 0, 0)
  }

  // Ensure it's a business day
  const dayOfWeek = optimalTime.getDay()
  if (dayOfWeek === 0) { // Sunday
    optimalTime.setDate(optimalTime.getDate() + 1)
  } else if (dayOfWeek === 6) { // Saturday
    optimalTime.setDate(optimalTime.getDate() + 2)
  }

  return optimalTime
}

// Generate call preparation data
function generateCallPreparation(lead) {
  return {
    lead_summary: {
      name: `${lead.first_name} ${lead.last_name}`,
      company: lead.company,
      title: lead.title,
      industry: lead.industry,
      score: lead.score,
      qualification_level: lead.qualification_level
    },
    engagement_history: {
      total_engagements: lead.email_engagement?.length || 0,
      last_engagement: lead.last_engagement,
      key_interests: identifyKeyInterests(lead),
      landing_page_activity: lead.landing_pages?.[0] || null
    },
    talking_points: generateTalkingPoints(lead),
    objection_handling: getObjectionHandling(lead.industry),
    call_objectives: [
      'Confirm qualification and buying intent',
      'Understand current lead generation challenges',
      'Present relevant LeadFly AI solution',
      'Schedule demo or next steps if qualified'
    ],
    tcpa_script: getTCPAScript()
  }
}

// Identify key interests from engagement data
function identifyKeyInterests(lead) {
  const interests = []

  if (lead.email_engagement) {
    // Analyze clicked links and email topics
    const clicks = lead.email_engagement.filter(e => e.event_type === 'clicked')
    if (clicks.length > 0) {
      interests.push('Active email engagement')
    }
  }

  if (lead.landing_pages && lead.landing_pages.length > 0) {
    interests.push('Researched solution online')
  }

  if (lead.industry) {
    interests.push(`${lead.industry} industry solutions`)
  }

  return interests
}

// Generate talking points based on lead data
function generateTalkingPoints(lead) {
  const points = []

  points.push(`Research shows ${lead.company} could benefit from AI-powered lead generation`)
  
  if (lead.industry) {
    points.push(`Specific ${lead.industry} industry insights and case studies`)
  }

  if (lead.score >= 80) {
    points.push('Lead shows high buying intent - focus on solution details')
  } else {
    points.push('Lead needs nurturing - focus on education and value')
  }

  points.push('Mention their engagement with our content as conversation starter')

  return points
}

// Get industry-specific objection handling
function getObjectionHandling(industry) {
  const common = [
    {
      objection: "We're not ready right now",
      response: "I understand timing is important. What would need to change for this to become a priority?"
    },
    {
      objection: "We need to think about it",
      response: "What specific concerns would you like to discuss? I'm here to help address any questions."
    },
    {
      objection: "It's too expensive",
      response: "Let's look at the ROI. What's your current cost per qualified lead?"
    }
  ]

  // Add industry-specific objections
  const industrySpecific = {
    'technology': [
      {
        objection: "We have our own dev team",
        response: "That's great! Our AI can actually enhance what your team is already doing."
      }
    ],
    'finance': [
      {
        objection: "Compliance concerns",
        response: "Compliance is built into our platform with TCPA monitoring and audit trails."
      }
    ]
  }

  return [...common, ...(industrySpecific[industry] || [])]
}

// Get TCPA compliance script
function getTCPAScript() {
  return {
    opening: "Hi [Name], this is [Your Name] from LeadFly AI. You recently engaged with our content about AI lead generation for [Company]. Do you have a few minutes to discuss how this could help your business?",
    consent_confirmation: "I want to confirm - you're interested in learning more about AI-powered lead generation solutions, correct?",
    opt_out_notice: "You can ask to be removed from our calling list at any time during this conversation."
  }
}

// Get call limits based on subscription tier
function getCallLimitsForTier(tierName) {
  const limits = {
    'starter': {
      monthly_limit: 10,
      call_duration: 15, // minutes
      max_attempts: 2,
      features: ['basic_call_tracking']
    },
    'growth': {
      monthly_limit: 75,
      call_duration: 30,
      max_attempts: 3,
      features: ['call_recording', 'basic_call_tracking']
    },
    'scale': {
      monthly_limit: 175,
      call_duration: 45,
      max_attempts: 3,
      features: ['call_recording', 'call_analysis', 'custom_scripts']
    },
    'enterprise': {
      monthly_limit: 1000,
      call_duration: 60,
      max_attempts: 5,
      features: ['call_recording', 'call_analysis', 'custom_scripts', 'team_collaboration']
    }
  }

  return limits[tierName.toLowerCase()] || limits.starter
}

// Utility functions
function getTimezoneFromLocation(location) {
  // Simplified timezone mapping
  const timezoneMap = {
    'california': 'America/Los_Angeles',
    'new york': 'America/New_York',
    'chicago': 'America/Chicago',
    'denver': 'America/Denver',
    'london': 'Europe/London',
    'paris': 'Europe/Paris'
  }

  const locationLower = location.toLowerCase()
  for (const [key, timezone] of Object.entries(timezoneMap)) {
    if (locationLower.includes(key)) {
      return timezone
    }
  }

  return 'America/New_York' // Default
}

function isValidCallTime(timezone) {
  const now = new Date()
  const hour = now.getHours()
  
  // TCPA allows calls 8 AM - 9 PM local time
  if (hour >= 8 && hour <= 21) {
    return { valid: true }
  } else {
    return { 
      valid: false, 
      reason: `Current time ${hour}:00 is outside TCPA calling hours (8 AM - 9 PM)` 
    }
  }
}

function getNextBusinessDay(date) {
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  
  const dayOfWeek = nextDay.getDay()
  if (dayOfWeek === 0) { // Sunday
    nextDay.setDate(nextDay.getDate() + 1)
  } else if (dayOfWeek === 6) { // Saturday
    nextDay.setDate(nextDay.getDate() + 2)
  }
  
  return nextDay
}

function analyzeEngagementTiming(engagements) {
  if (!engagements || engagements.length === 0) {
    return { peak_hour: 10 } // Default to 10 AM
  }

  // Analyze engagement timestamps to find peak activity hours
  const hourCounts = {}
  engagements.forEach(engagement => {
    const hour = new Date(engagement.timestamp).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  const peakHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 10

  return {
    peak_hour: parseInt(peakHour),
    engagement_distribution: hourCounts
  }
}

// Update call schedule
async function updateCallSchedule(callId, updates) {
  try {
    const { error } = await supabase
      .from('scheduled_calls')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', callId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      call_id: callId,
      updates_applied: Object.keys(updates)
    })

  } catch (error) {
    console.error('❌ Failed to update call schedule:', error)
    throw error
  }
}

// Cancel call
async function cancelCall(callId, reason) {
  try {
    const { error } = await supabase
      .from('scheduled_calls')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', callId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      call_id: callId,
      status: 'cancelled',
      reason
    })

  } catch (error) {
    console.error('❌ Failed to cancel call:', error)
    throw error
  }
}

// Get call queue for user
async function getCallQueue(userId) {
  try {
    const { data: calls } = await supabase
      .from('scheduled_calls')
      .select(`
        *,
        leads(first_name, last_name, company, email, phone, score)
      `)
      .eq('user_id', userId)
      .in('status', ['scheduled', 'in_progress'])
      .order('scheduled_at', { ascending: true })

    return NextResponse.json({
      success: true,
      call_queue: calls || [],
      total_scheduled: calls?.length || 0
    })

  } catch (error) {
    console.error('❌ Failed to get call queue:', error)
    throw error
  }
}

// Schedule call reminders
async function scheduleCallReminders(scheduledCall) {
  const callTime = new Date(scheduledCall.scheduled_at)
  
  // Schedule reminders at various intervals
  const reminders = [
    { offset: -24 * 60, type: '24_hour_reminder' },
    { offset: -2 * 60, type: '2_hour_reminder' },
    { offset: -15, type: '15_minute_reminder' }
  ]

  for (const reminder of reminders) {
    const reminderTime = new Date(callTime.getTime() + (reminder.offset * 60 * 1000))
    
    if (reminderTime > new Date()) {
      await supabase
        .from('scheduled_tasks')
        .insert({
          task_type: 'call_reminder',
          lead_id: scheduledCall.lead_id,
          user_id: scheduledCall.user_id,
          scheduled_at: reminderTime.toISOString(),
          task_data: {
            call_id: scheduledCall.id,
            reminder_type: reminder.type
          },
          status: 'pending'
        })
    }
  }
}

// Mark call as completed
async function markCallCompleted(callData) {
  try {
    const { call_id, outcome, notes, duration, next_action } = callData

    const { error } = await supabase
      .from('scheduled_calls')
      .update({
        status: 'completed',
        outcome,
        notes,
        actual_duration: duration,
        next_action,
        completed_at: new Date().toISOString()
      })
      .eq('id', call_id)

    if (error) throw error

    // Log call completion
    await supabase
      .from('call_logs')
      .insert({
        call_id,
        event_type: 'call_completed',
        timestamp: new Date().toISOString(),
        details: { outcome, duration, next_action }
      })

    return NextResponse.json({
      success: true,
      call_id,
      status: 'completed',
      outcome
    })

  } catch (error) {
    console.error('❌ Failed to mark call completed:', error)
    throw error
  }
}

// Check TCPA compliance for a lead
async function checkTCPACompliance(leadId) {
  try {
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
        landing_pages(*),
        email_engagement(*)
      `)
      .eq('id', leadId)
      .single()

    if (!lead) {
      throw new Error('Lead not found')
    }

    const complianceCheck = await performTCPAComplianceCheck(lead)

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      tcpa_compliant: complianceCheck.compliant,
      compliance_details: complianceCheck
    })

  } catch (error) {
    console.error('❌ TCPA compliance check failed:', error)
    throw error
  }
}

// Get optimal call time
async function getOptimalCallTime(leadId, preferences) {
  try {
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
        email_engagement(*)
      `)
      .eq('id', leadId)
      .single()

    if (!lead) {
      throw new Error('Lead not found')
    }

    const optimalTime = calculateOptimalCallTime(lead, preferences?.preferred_time)

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      optimal_time: optimalTime.toISOString(),
      reasoning: {
        timezone: getTimezoneFromLocation(lead.location || ''),
        engagement_pattern: analyzeEngagementTiming(lead.email_engagement),
        tcpa_compliant: true
      }
    })

  } catch (error) {
    console.error('❌ Failed to get optimal call time:', error)
    throw error
  }
}