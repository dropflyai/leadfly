import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Email Service Provider Webhook Handler
export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature') || request.headers.get('signature')
    const provider = request.headers.get('x-email-provider') || 'unknown'

    console.log('📧 Received email engagement webhook from:', provider)

    // Verify webhook signature (security)
    if (!verifyWebhookSignature(body, signature, provider)) {
      console.error('❌ Webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse webhook payload based on provider
    const eventData = parseWebhookPayload(body, provider)
    
    if (!eventData) {
      console.error('❌ Failed to parse webhook payload')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Process engagement event
    const result = await processEngagementEvent(eventData)

    return NextResponse.json({
      success: true,
      event_processed: true,
      event_type: eventData.event_type,
      lead_id: result.lead_id
    })

  } catch (error) {
    console.error('❌ Email engagement webhook error:', error)
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Verify webhook signature for security
function verifyWebhookSignature(payload, signature, provider) {
  if (!signature) return false

  try {
    switch (provider.toLowerCase()) {
      case 'sendgrid':
        return verifySendGridSignature(payload, signature)
      case 'mailgun':
        return verifyMailgunSignature(payload, signature)
      case 'postmark':
        return verifyPostmarkSignature(payload, signature)
      case 'ses':
        return verifySESSignature(payload, signature)
      default:
        // For testing/development, allow unsigned webhooks
        return process.env.NODE_ENV === 'development' || !process.env.WEBHOOK_SECRET
    }
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

function verifySendGridSignature(payload, signature) {
  const secret = process.env.SENDGRID_WEBHOOK_SECRET
  if (!secret) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

function verifyMailgunSignature(payload, signature) {
  const secret = process.env.MAILGUN_WEBHOOK_SECRET
  if (!secret) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

function verifyPostmarkSignature(payload, signature) {
  const secret = process.env.POSTMARK_WEBHOOK_SECRET
  if (!secret) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')

  return signature === expectedSignature
}

function verifySESSignature(payload, signature) {
  // AWS SES uses SNS, which has its own signature verification
  // This would typically verify the SNS message signature
  return true // Simplified for demo
}

// Parse webhook payload based on provider format
function parseWebhookPayload(payload, provider) {
  try {
    const data = JSON.parse(payload)

    switch (provider.toLowerCase()) {
      case 'sendgrid':
        return parseSendGridWebhook(data)
      case 'mailgun':
        return parseMailgunWebhook(data)
      case 'postmark':
        return parsePostmarkWebhook(data)
      case 'ses':
        return parseSESWebhook(data)
      default:
        return parseGenericWebhook(data)
    }
  } catch (error) {
    console.error('Payload parsing error:', error)
    return null
  }
}

function parseSendGridWebhook(data) {
  // SendGrid sends an array of events
  const events = Array.isArray(data) ? data : [data]
  
  return events.map(event => ({
    event_type: mapSendGridEvent(event.event),
    email: event.email,
    timestamp: new Date(event.timestamp * 1000).toISOString(),
    message_id: event.sg_message_id,
    user_agent: event.useragent,
    ip_address: event.ip,
    url: event.url,
    reason: event.reason,
    metadata: {
      provider: 'sendgrid',
      raw_event: event.event,
      category: event.category,
      asm_group_id: event.asm_group_id
    }
  }))
}

function parseMailgunWebhook(data) {
  const eventData = data['event-data'] || data

  return [{
    event_type: mapMailgunEvent(eventData.event),
    email: eventData.recipient,
    timestamp: new Date(eventData.timestamp * 1000).toISOString(),
    message_id: eventData['message']['headers']['message-id'],
    user_agent: eventData['client-info']?.['user-agent'],
    ip_address: eventData['client-info']?.['client-ip'],
    url: eventData.url,
    reason: eventData.reason,
    metadata: {
      provider: 'mailgun',
      raw_event: eventData.event,
      severity: eventData.severity
    }
  }]
}

function parsePostmarkWebhook(data) {
  return [{
    event_type: mapPostmarkEvent(data.RecordType),
    email: data.Email,
    timestamp: new Date(data.ReceivedAt).toISOString(),
    message_id: data.MessageID,
    user_agent: data.UserAgent,
    ip_address: data.Geo?.IP,
    url: data.OriginalLink,
    reason: data.Description,
    metadata: {
      provider: 'postmark',
      raw_event: data.RecordType,
      tag: data.Tag,
      server_id: data.ServerID
    }
  }]
}

function parseSESWebhook(data) {
  // AWS SES typically sends SNS notifications
  const message = JSON.parse(data.Message || '{}')
  const mail = message.mail || {}
  const eventType = message.eventType || message.notificationType

  return [{
    event_type: mapSESEvent(eventType),
    email: mail.commonHeaders?.to?.[0] || mail.destination?.[0],
    timestamp: new Date(mail.timestamp).toISOString(),
    message_id: mail.messageId,
    metadata: {
      provider: 'ses',
      raw_event: eventType,
      source: mail.source,
      sending_account_id: message.mail?.sendingAccountId
    }
  }]
}

function parseGenericWebhook(data) {
  // Fallback for custom or unknown providers
  return [{
    event_type: data.event_type || data.type || 'unknown',
    email: data.email || data.recipient,
    timestamp: data.timestamp || new Date().toISOString(),
    message_id: data.message_id || data.id,
    user_agent: data.user_agent,
    ip_address: data.ip_address || data.ip,
    url: data.url || data.link,
    reason: data.reason || data.description,
    metadata: {
      provider: 'generic',
      raw_data: data
    }
  }]
}

// Event type mapping functions
function mapSendGridEvent(event) {
  const eventMap = {
    'delivered': 'delivered',
    'open': 'opened',
    'click': 'clicked',
    'bounce': 'bounced',
    'dropped': 'dropped',
    'deferred': 'deferred',
    'processed': 'processed',
    'unsubscribe': 'unsubscribed',
    'group_unsubscribe': 'unsubscribed',
    'spam_report': 'spam_reported'
  }
  return eventMap[event] || event
}

function mapMailgunEvent(event) {
  const eventMap = {
    'delivered': 'delivered',
    'opened': 'opened',
    'clicked': 'clicked',
    'unsubscribed': 'unsubscribed',
    'complained': 'spam_reported',
    'bounced': 'bounced',
    'dropped': 'dropped',
    'rejected': 'rejected'
  }
  return eventMap[event] || event
}

function mapPostmarkEvent(recordType) {
  const eventMap = {
    'Delivery': 'delivered',
    'Open': 'opened',
    'Click': 'clicked',
    'Bounce': 'bounced',
    'SpamComplaint': 'spam_reported',
    'Unsubscribe': 'unsubscribed'
  }
  return eventMap[recordType] || recordType.toLowerCase()
}

function mapSESEvent(eventType) {
  const eventMap = {
    'delivery': 'delivered',
    'open': 'opened',
    'click': 'clicked',
    'bounce': 'bounced',
    'complaint': 'spam_reported',
    'reject': 'rejected'
  }
  return eventMap[eventType] || eventType
}

// Process engagement event and update lead data
async function processEngagementEvent(eventData) {
  try {
    const events = Array.isArray(eventData) ? eventData : [eventData]
    const results = []

    for (const event of events) {
      console.log(`📊 Processing ${event.event_type} event for ${event.email}`)

      // Find lead by email
      const { data: lead } = await supabase
        .from('leads')
        .select('id, user_id, score, status')
        .eq('email', event.email)
        .single()

      if (!lead) {
        console.log(`⚠️ Lead not found for email: ${event.email}`)
        continue
      }

      // Record engagement event
      const { error: engagementError } = await supabase
        .from('email_engagement')
        .insert({
          lead_id: lead.id,
          user_id: lead.user_id,
          event_type: event.event_type,
          timestamp: event.timestamp,
          external_message_id: event.message_id,
          user_agent: event.user_agent,
          ip_address: event.ip_address,
          url: event.url,
          reason: event.reason,
          metadata: event.metadata
        })

      if (engagementError) {
        console.error('❌ Failed to record engagement:', engagementError)
        continue
      }

      // Update lead score based on engagement
      const scoreResult = await updateLeadScoreFromEngagement(lead, event)

      // Check if lead qualifies for warm status
      if (scoreResult.should_qualify) {
        await checkAndPromoteToWarm(lead.id, scoreResult.new_score)
      }

      // Schedule follow-up tasks based on engagement type
      await scheduleFollowUpTasks(lead, event)

      results.push({
        lead_id: lead.id,
        email: event.email,
        event_type: event.event_type,
        score_change: scoreResult.score_change,
        new_score: scoreResult.new_score
      })

      console.log(`✅ Processed ${event.event_type} for lead ${lead.id}`)
    }

    return {
      processed_count: results.length,
      results
    }

  } catch (error) {
    console.error('❌ Failed to process engagement event:', error)
    throw error
  }
}

// Update lead score based on engagement type
async function updateLeadScoreFromEngagement(lead, event) {
  const scoreChanges = {
    'delivered': 1,
    'opened': 5,
    'clicked': 15,
    'replied': 25,
    'unsubscribed': -50,
    'spam_reported': -100,
    'bounced': -10,
    'dropped': -5
  }

  const scoreChange = scoreChanges[event.event_type] || 0
  let newScore = Math.max(0, Math.min(100, lead.score + scoreChange))

  // Apply time-based multipliers for recent activity
  const eventTime = new Date(event.timestamp)
  const hoursAgo = (new Date() - eventTime) / (1000 * 60 * 60)
  
  if (hoursAgo < 1 && scoreChange > 0) {
    newScore = Math.min(100, newScore + 2) // Bonus for immediate engagement
  }

  // Update lead score
  const { error } = await supabase
    .from('leads')
    .update({
      score: newScore,
      last_engagement: event.timestamp,
      engagement_velocity: calculateEngagementVelocity(lead.id)
    })
    .eq('id', lead.id)

  if (error) {
    console.error('❌ Failed to update lead score:', error)
  }

  return {
    score_change: scoreChange,
    new_score: newScore,
    should_qualify: newScore >= 75 && lead.status === 'cold'
  }
}

// Calculate engagement velocity
async function calculateEngagementVelocity(leadId) {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: recentEngagements } = await supabase
      .from('email_engagement')
      .select('id')
      .eq('lead_id', leadId)
      .gte('timestamp', weekAgo)

    return (recentEngagements?.length || 0) / 7 // Engagements per day
  } catch (error) {
    console.error('❌ Failed to calculate engagement velocity:', error)
    return 0
  }
}

// Check if lead should be promoted to warm status
async function checkAndPromoteToWarm(leadId, currentScore) {
  try {
    if (currentScore < 75) return

    // Call lead scoring API to perform full qualification check
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/lead-scoring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'score_lead',
        lead_id: leadId
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log(`🎯 Lead ${leadId} re-scored: ${result.score}/100 (${result.qualification_level})`)
    }
  } catch (error) {
    console.error('❌ Failed to check warm qualification:', error)
  }
}

// Schedule follow-up tasks based on engagement
async function scheduleFollowUpTasks(lead, event) {
  try {
    const tasks = []

    switch (event.event_type) {
      case 'clicked':
        // High-value engagement - schedule immediate follow-up
        tasks.push({
          task_type: 'warm_lead_notification',
          scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          priority: 'high',
          task_data: {
            lead_id: lead.id,
            trigger_event: 'email_click',
            urgency: 'immediate'
          }
        })
        break

      case 'opened':
        // Moderate engagement - schedule score update
        tasks.push({
          task_type: 'score_update',
          scheduled_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          priority: 'medium',
          task_data: {
            lead_id: lead.id,
            trigger_event: 'email_open'
          }
        })
        break

      case 'unsubscribed':
        // Negative engagement - clean up sequences
        tasks.push({
          task_type: 'sequence_cleanup',
          scheduled_at: new Date().toISOString(), // Immediate
          priority: 'high',
          task_data: {
            lead_id: lead.id,
            action: 'stop_all_sequences',
            reason: 'unsubscribed'
          }
        })
        break
    }

    // Insert tasks if any
    if (tasks.length > 0) {
      const tasksWithCommonFields = tasks.map(task => ({
        ...task,
        lead_id: lead.id,
        user_id: lead.user_id,
        status: 'pending'
      }))

      await supabase
        .from('scheduled_tasks')
        .insert(tasksWithCommonFields)

      console.log(`📋 Scheduled ${tasks.length} follow-up tasks for lead ${lead.id}`)
    }

  } catch (error) {
    console.error('❌ Failed to schedule follow-up tasks:', error)
  }
}

// GET endpoint for webhook testing and health checks
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'health_check'

    if (action === 'health_check') {
      return NextResponse.json({
        status: 'healthy',
        webhook_endpoint: 'email-engagement',
        supported_providers: ['sendgrid', 'mailgun', 'postmark', 'ses', 'generic'],
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'test_event') {
      // Test webhook with sample data
      const testEvent = {
        event_type: 'opened',
        email: 'test@example.com',
        timestamp: new Date().toISOString(),
        message_id: 'test-message-id',
        metadata: { provider: 'test' }
      }

      // Don't actually process test events
      return NextResponse.json({
        success: true,
        test_event: testEvent,
        message: 'Test event processed (simulation only)'
      })
    }

    return NextResponse.json({ error: 'Invalid GET action' }, { status: 400 })

  } catch (error) {
    console.error('❌ Email engagement webhook GET error:', error)
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 })
  }
}