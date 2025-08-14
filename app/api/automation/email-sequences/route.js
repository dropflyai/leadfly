import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Email Sequence Automation Engine
export async function POST(request) {
  try {
    const { action, lead_id, sequence_id, step_number } = await request.json()

    switch (action) {
      case 'start_sequence':
        return await startEmailSequence(lead_id)
      case 'send_email':
        return await sendEmailStep(sequence_id, step_number)
      case 'track_engagement':
        return await trackEmailEngagement(request.json())
      case 'qualify_lead':
        return await qualifyLeadFromEngagement(lead_id)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Email sequence automation error:', error)
    return NextResponse.json(
      { 
        error: 'Email automation failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Start email sequence for a lead
async function startEmailSequence(leadId) {
  try {
    console.log('📧 Starting email sequence for lead:', leadId)

    // Get lead and subscription data
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
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

    const tierName = lead.users.user_subscriptions[0]?.subscription_tiers?.name || 'starter'
    const sequenceType = getSequenceTypeForTier(tierName)

    // Create email sequence record
    const { data: sequence, error } = await supabase
      .from('email_sequences')
      .insert({
        lead_id: leadId,
        user_id: lead.user_id,
        sequence_type: sequenceType,
        status: 'active',
        current_step: 0,
        total_steps: getSequenceSteps(sequenceType).length,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Schedule first email immediately
    await scheduleNextEmail(sequence, 1)

    return NextResponse.json({
      success: true,
      sequence_id: sequence.id,
      sequence_type: sequenceType,
      total_steps: sequence.total_steps,
      next_email: 'scheduled_immediately'
    })

  } catch (error) {
    console.error('❌ Failed to start email sequence:', error)
    throw error
  }
}

// Send specific email step
async function sendEmailStep(sequenceId, stepNumber) {
  try {
    console.log(`📧 Sending email step ${stepNumber} for sequence:`, sequenceId)

    // Get sequence and lead data
    const { data: sequence } = await supabase
      .from('email_sequences')
      .select(`
        *,
        leads(
          *,
          landing_pages(url, slug)
        )
      `)
      .eq('id', sequenceId)
      .single()

    if (!sequence) {
      throw new Error('Email sequence not found')
    }

    const lead = sequence.leads
    const landingPageUrl = lead.landing_pages?.[0]?.url

    // Get email template for this step
    const emailContent = generateEmailContent(
      sequence.sequence_type, 
      stepNumber, 
      lead, 
      landingPageUrl
    )

    // Send email (integrate with your email service)
    const emailResult = await sendEmail(emailContent, lead.email)

    // Record email sent
    await supabase
      .from('email_logs')
      .insert({
        sequence_id: sequenceId,
        lead_id: lead.id,
        step_number: stepNumber,
        email_content: emailContent,
        status: emailResult.status,
        sent_at: new Date().toISOString(),
        external_id: emailResult.messageId
      })

    // Update sequence current step
    await supabase
      .from('email_sequences')
      .update({ 
        current_step: stepNumber,
        last_email_sent: new Date().toISOString()
      })
      .eq('id', sequenceId)

    // Schedule next email if not last step
    if (stepNumber < sequence.total_steps) {
      const nextDelay = getEmailDelay(sequence.sequence_type, stepNumber + 1)
      await scheduleNextEmail(sequence, stepNumber + 1, nextDelay)
    } else {
      // Mark sequence as completed
      await supabase
        .from('email_sequences')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sequenceId)
    }

    return NextResponse.json({
      success: true,
      email_sent: true,
      step: stepNumber,
      next_step: stepNumber < sequence.total_steps ? stepNumber + 1 : null
    })

  } catch (error) {
    console.error('❌ Failed to send email step:', error)
    throw error
  }
}

// Track email engagement (opens, clicks, replies)
async function trackEmailEngagement(engagementData) {
  try {
    const { email_id, event_type, timestamp, lead_email } = engagementData

    console.log(`📊 Tracking email engagement: ${event_type} for ${lead_email}`)

    // Find the lead by email
    const { data: lead } = await supabase
      .from('leads')
      .select('id, user_id')
      .eq('email', lead_email)
      .single()

    if (!lead) {
      console.log('⚠️ Lead not found for email engagement tracking')
      return NextResponse.json({ success: true, message: 'Lead not found' })
    }

    // Record engagement event
    await supabase
      .from('email_engagement')
      .insert({
        lead_id: lead.id,
        user_id: lead.user_id,
        external_email_id: email_id,
        event_type,
        timestamp: timestamp || new Date().toISOString()
      })

    // Update lead score based on engagement
    await updateLeadScoreFromEngagement(lead.id, event_type)

    // Check if lead should be qualified
    if (['clicked', 'replied'].includes(event_type)) {
      await checkLeadQualification(lead.id)
    }

    return NextResponse.json({
      success: true,
      event_tracked: event_type,
      lead_id: lead.id
    })

  } catch (error) {
    console.error('❌ Failed to track email engagement:', error)
    throw error
  }
}

// Generate email content based on sequence type and step
function generateEmailContent(sequenceType, stepNumber, lead, landingPageUrl) {
  const sequences = {
    basic_nurture: generateBasicSequence,
    advanced_nurture: generateAdvancedSequence,
    premium_nurture: generatePremiumSequence,
    custom_nurture: generateCustomSequence
  }

  const generator = sequences[sequenceType] || sequences.basic_nurture
  return generator(stepNumber, lead, landingPageUrl)
}

function generateBasicSequence(step, lead, landingPageUrl) {
  const templates = {
    1: {
      subject: `${lead.first_name}, quick question about ${lead.company}`,
      content: `Hi ${lead.first_name},

I was researching ${lead.industry} companies and came across ${lead.company}. 

Quick question: Are you currently happy with your lead generation results?

Most ${lead.title}s I talk to are struggling with:
• Finding qualified prospects
• Cold outreach that gets ignored  
• Wasting time on uninterested leads

If any of these sound familiar, I'd love to show you how companies like ${lead.company} are solving this.

I've put together a quick 2-minute overview specifically for ${lead.industry} businesses: ${landingPageUrl}

Worth a look?

Best,
The LeadFly Team`
    },
    
    2: {
      subject: `${lead.first_name}, did you see this ${lead.industry} case study?`,
      content: `Hi ${lead.first_name},

Not sure if you had a chance to check out that ${lead.industry} case study I sent over.

The company went from 10 to 250+ qualified leads per month in just 90 days.

Their secret? They stopped cold calling and started with warm, pre-qualified prospects instead.

Here's exactly how they did it: ${landingPageUrl}

The approach works especially well for ${lead.industry} companies because [specific reason].

Questions? Just reply to this email.

Best,
The LeadFly Team

P.S. This strategy is working for 100+ companies in your space. Worth 2 minutes to see if it could work for ${lead.company}?`
    },
    
    3: {
      subject: `Last chance, ${lead.first_name} (${lead.company})`,
      content: `Hi ${lead.first_name},

I've reached out a couple times about how ${lead.company} could generate more qualified leads.

Since I haven't heard back, I'll assume you're either:
1. Already crushing your lead gen goals (amazing!)
2. Too busy to look at new approaches right now
3. My emails ended up in spam (oops!)

If it's #2 or #3, here's one last resource that might help: ${landingPageUrl}

It shows the exact 3-step process ${lead.industry} companies use to turn cold prospects into warm leads before calling.

No pressure either way - just thought it might be useful.

Best of luck,
The LeadFly Team

P.S. If you're not interested, no worries! Just reply with "not interested" and I'll stop following up.`
    }
  }

  return templates[step] || templates[1]
}

function generateAdvancedSequence(step, lead, landingPageUrl) {
  const templates = {
    1: {
      subject: `${lead.first_name}, ${lead.industry} breakthrough (2-min read)`,
      content: `Hi ${lead.first_name},

I've been analyzing what separates the top 10% of ${lead.industry} companies from everyone else.

The difference? They've cracked the code on predictable lead generation.

While most ${lead.title}s are still cold calling, top performers are using AI to pre-qualify prospects and only call warm, interested leads.

The results are dramatic:
• 3x higher connect rates
• 5x better conversion rates  
• 50% less time wasted on bad prospects

I've documented the exact process here: ${landingPageUrl}

It's specifically tailored for ${lead.company} and ${lead.industry} businesses.

Worth a quick look?

Best,
The LeadFly Team`
    },
    
    2: {
      subject: `${lead.first_name}, your competitors are doing this...`,
      content: `Hi ${lead.first_name},

Quick observation: Your ${lead.industry} competitors are scaling fast right now.

While you're manually prospecting, they're using AI to:
• Generate 10x more qualified leads
• Nurture prospects automatically  
• Only call pre-warmed, interested buyers

The gap is widening every day.

I put together a competitive analysis for ${lead.company}: ${landingPageUrl}

It shows exactly what your competitors are doing and how ${lead.company} can leapfrog them.

The window won't stay open forever...

Best,
The LeadFly Team

P.S. One of your competitors just implemented this system last month. They're already seeing 400% more qualified leads.`
    },
    
    3: {
      subject: `ROI Calculator: ${lead.company} lead generation potential`,
      content: `Hi ${lead.first_name},

I ran ${lead.company}'s numbers through our ROI calculator.

Based on ${lead.industry} benchmarks, here's what's possible:

Current state (estimated):
• 20-30 leads per month  
• 2-5% conversion rate
• Manual outreach taking 20+ hours/week

With LeadFly AI:
• 200+ qualified leads per month
• 15-25% conversion rate  
• 5 hours/week (automated nurturing)

Net result: 800% more revenue opportunity

See your custom projection: ${landingPageUrl}

The calculator shows month-by-month growth projections specific to ${lead.company}.

Questions? Just reply.

Best,
The LeadFly Team`
    },
    
    4: {
      subject: `${lead.first_name}, implementation timeline for ${lead.company}`,
      content: `Hi ${lead.first_name},

Been thinking about ${lead.company}'s growth goals.

If you decided to implement an AI lead generation system, here's what the timeline would look like:

Week 1-2: Setup and integration
Week 3-4: First qualified leads flowing  
Month 2: 100+ leads per month
Month 3: 200+ leads per month (full scale)

Most ${lead.industry} companies see positive ROI by week 6.

I've created a custom implementation plan for ${lead.company}: ${landingPageUrl}

It includes:
• Phase-by-phase rollout
• Expected lead volumes
• ROI milestones
• Risk mitigation strategies

Worth reviewing with your team?

Best,
The LeadFly Team`
    },
    
    5: {
      subject: `Final follow-up, ${lead.first_name} (with gift)`,
      content: `Hi ${lead.first_name},

This is my final follow-up about ${lead.company}'s lead generation.

I know you're busy, so I put together something that might help regardless of what you decide.

It's a free ${lead.industry} Lead Generation Playbook: ${landingPageUrl}

Inside:
• 47 proven lead generation tactics for ${lead.industry}
• Templates you can use immediately  
• Case studies from companies like ${lead.company}
• ROI calculator and tracking sheets

No strings attached - just useful stuff for ${lead.title}s.

Download it here: ${landingPageUrl}

Best of luck with ${lead.company},
The LeadFly Team

P.S. If you ever want to chat about scaling lead generation, just reply to this email. Otherwise, enjoy the playbook!`
    }
  }

  return templates[step] || templates[1]
}

function generatePremiumSequence(step, lead, landingPageUrl) {
  // More sophisticated sequences for Scale tier
  const templates = {
    1: {
      subject: `[CONFIDENTIAL] ${lead.company} competitive intelligence`,
      content: `Hi ${lead.first_name},

I've been tracking ${lead.industry} market movements and noticed something concerning for ${lead.company}.

Your top 3 competitors just implemented AI-powered lead generation systems.

The advantage they're gaining:
• 10x more qualified prospects  
• 50% lower acquisition costs
• 30-day faster sales cycles

I've prepared a confidential competitive analysis: ${landingPageUrl}

It shows exactly what they're doing and how ${lead.company} can respond.

This stays between us - worth a private review?

Best,
The LeadFly Team

CONFIDENTIAL: For ${lead.first_name} at ${lead.company} only`
    },
    
    2: {
      subject: `${lead.first_name}, market opportunity closing fast`,
      content: `Hi ${lead.first_name},

Market update for ${lead.industry}:

There's a 6-month window where early AI adopters will capture disproportionate market share.

After that, the competitive advantage diminishes as everyone catches up.

${lead.company} has a choice:
1. Lead the market transformation (next 6 months)
2. Follow the market (6-18 months from now)
3. Get left behind (18+ months from now)

I've modeled the scenarios for ${lead.company}: ${landingPageUrl}

The numbers are eye-opening.

Ready to lead or follow?

Best,
The LeadFly Team`
    }
    // ... more sophisticated templates
  }

  return templates[step] || templates[1]
}

function generateCustomSequence(step, lead, landingPageUrl) {
  // Enterprise-level personalized sequences
  return generatePremiumSequence(step, lead, landingPageUrl)
}

// Utility functions
function getSequenceTypeForTier(tierName) {
  const mapping = {
    'starter': 'basic_nurture',
    'growth': 'advanced_nurture', 
    'scale': 'premium_nurture',
    'enterprise': 'custom_nurture'
  }
  return mapping[tierName.toLowerCase()] || 'basic_nurture'
}

function getSequenceSteps(sequenceType) {
  const steps = {
    'basic_nurture': [1, 2, 3],
    'advanced_nurture': [1, 2, 3, 4, 5],
    'premium_nurture': [1, 2, 3, 4, 5, 6, 7],
    'custom_nurture': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
  return steps[sequenceType] || steps.basic_nurture
}

function getEmailDelay(sequenceType, stepNumber) {
  // Delays in hours
  const delays = {
    'basic_nurture': { 2: 72, 3: 120 }, // 3 days, 5 days
    'advanced_nurture': { 2: 48, 3: 96, 4: 168, 5: 240 }, // 2d, 4d, 7d, 10d
    'premium_nurture': { 2: 24, 3: 48, 4: 96, 5: 168, 6: 240, 7: 336 }, // 1d, 2d, 4d, 7d, 10d, 14d
    'custom_nurture': { 2: 24, 3: 48, 4: 72, 5: 120, 6: 168, 7: 240, 8: 336, 9: 504, 10: 672 }
  }
  
  return delays[sequenceType]?.[stepNumber] || 72 // Default 3 days
}

async function scheduleNextEmail(sequence, stepNumber, delayHours = 0) {
  try {
    const scheduledTime = new Date(Date.now() + (delayHours * 60 * 60 * 1000))
    
    // In production, this would integrate with a job queue (Redis, AWS SQS, etc.)
    await supabase
      .from('scheduled_tasks')
      .insert({
        task_type: 'send_email',
        lead_id: sequence.lead_id,
        user_id: sequence.user_id,
        scheduled_at: scheduledTime.toISOString(),
        task_data: {
          sequence_id: sequence.id,
          step_number: stepNumber
        },
        status: 'pending'
      })

    console.log(`⏰ Scheduled email step ${stepNumber} for ${scheduledTime}`)

  } catch (error) {
    console.error('❌ Failed to schedule email:', error)
  }
}

async function sendEmail(emailContent, recipientEmail) {
  // Mock email sending - integrate with SendGrid, Postmark, etc.
  console.log(`📧 Sending email to ${recipientEmail}:`, emailContent.subject)
  
  // In production, this would use your email service API
  return {
    status: 'sent',
    messageId: `mock_${Date.now()}`,
    timestamp: new Date().toISOString()
  }
}

async function updateLeadScoreFromEngagement(leadId, eventType) {
  try {
    const scoreChanges = {
      'opened': 5,
      'clicked': 15,
      'replied': 25,
      'unsubscribed': -50
    }

    const scoreChange = scoreChanges[eventType] || 0
    
    if (scoreChange !== 0) {
      await supabase
        .from('leads')
        .update({ 
          score: supabase.raw(`score + ${scoreChange}`),
          last_engagement: new Date().toISOString()
        })
        .eq('id', leadId)

      console.log(`📊 Updated lead score by ${scoreChange} for engagement: ${eventType}`)
    }

  } catch (error) {
    console.error('❌ Failed to update lead score:', error)
  }
}

async function checkLeadQualification(leadId) {
  try {
    // Get lead with current score and engagement history
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
        email_engagement(event_type, timestamp)
      `)
      .eq('id', leadId)
      .single()

    if (!lead) return

    // Qualification criteria
    const hasClicked = lead.email_engagement.some(e => e.event_type === 'clicked')
    const hasReplied = lead.email_engagement.some(e => e.event_type === 'replied')
    const scoreThreshold = lead.score >= 50

    if ((hasClicked || hasReplied) && scoreThreshold) {
      // Mark as warm lead ready for calling
      await supabase
        .from('leads')
        .update({ 
          status: 'warm',
          qualified_at: new Date().toISOString(),
          ready_for_call: true
        })
        .eq('id', leadId)

      // Notify sales team or schedule call
      await scheduleWarmLeadCall(leadId)

      console.log('🔥 Lead qualified as warm and ready for calling:', leadId)
    }

  } catch (error) {
    console.error('❌ Failed to check lead qualification:', error)
  }
}

async function scheduleWarmLeadCall(leadId) {
  // Schedule a call for this warm lead
  await supabase
    .from('scheduled_tasks')
    .insert({
      task_type: 'schedule_call',
      lead_id: leadId,
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
      status: 'pending',
      priority: 'high'
    })

  console.log('📞 Scheduled warm lead call for:', leadId)
}