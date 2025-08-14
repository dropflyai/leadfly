import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Centralized Task Queue Processor for Automation
export async function POST(request) {
  try {
    const { action, task_id, batch_size = 50, force_process } = await request.json()

    switch (action) {
      case 'process_pending_tasks':
        return await processPendingTasks(batch_size)
      case 'process_single_task':
        return await processSingleTask(task_id)
      case 'get_task_queue_status':
        return await getTaskQueueStatus()
      case 'retry_failed_task':
        return await retryFailedTask(task_id)
      case 'cleanup_completed_tasks':
        return await cleanupCompletedTasks()
      case 'get_task_statistics':
        return await getTaskStatistics()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Task processor error:', error)
    return NextResponse.json(
      { 
        error: 'Task processing failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for health checks and status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'health_check'

    if (action === 'health_check') {
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        processor: 'task-queue-v1'
      })
    }

    if (action === 'queue_status') {
      return await getTaskQueueStatus()
    }

    return NextResponse.json({ error: 'Invalid GET action' }, { status: 400 })

  } catch (error) {
    console.error('❌ Task processor GET error:', error)
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 })
  }
}

// Process pending tasks in the queue
async function processPendingTasks(batchSize = 50) {
  try {
    console.log('🔄 Processing pending tasks, batch size:', batchSize)

    // Get pending tasks that are due for execution
    const { data: pendingTasks } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: false }) // High priority first
      .order('scheduled_at', { ascending: true }) // Then by schedule time
      .limit(batchSize)

    if (!pendingTasks || pendingTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending tasks to process',
        processed_count: 0
      })
    }

    console.log(`📋 Found ${pendingTasks.length} pending tasks to process`)

    const results = []
    let successCount = 0
    let failureCount = 0

    // Process tasks concurrently in smaller batches
    const concurrentBatchSize = 10
    for (let i = 0; i < pendingTasks.length; i += concurrentBatchSize) {
      const batch = pendingTasks.slice(i, i + concurrentBatchSize)
      const batchPromises = batch.map(task => processSingleTaskInternal(task))
      const batchResults = await Promise.allSettled(batchPromises)

      batchResults.forEach((result, index) => {
        const task = batch[index]
        if (result.status === 'fulfilled') {
          results.push({
            task_id: task.id,
            task_type: task.task_type,
            status: 'completed',
            result: result.value
          })
          successCount++
        } else {
          results.push({
            task_id: task.id,
            task_type: task.task_type,
            status: 'failed',
            error: result.reason.message
          })
          failureCount++
        }
      })
    }

    console.log(`✅ Task processing completed: ${successCount} success, ${failureCount} failed`)

    return NextResponse.json({
      success: true,
      processed_count: pendingTasks.length,
      success_count: successCount,
      failure_count: failureCount,
      results
    })

  } catch (error) {
    console.error('❌ Failed to process pending tasks:', error)
    throw error
  }
}

// Process a single task by ID
async function processSingleTask(taskId) {
  try {
    const { data: task } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (!task) {
      throw new Error('Task not found')
    }

    const result = await processSingleTaskInternal(task)

    return NextResponse.json({
      success: true,
      task_id: taskId,
      result
    })

  } catch (error) {
    console.error('❌ Failed to process single task:', error)
    throw error
  }
}

// Internal function to process individual tasks
async function processSingleTaskInternal(task) {
  try {
    console.log(`🔧 Processing task ${task.id}: ${task.task_type}`)

    // Mark task as in progress
    await updateTaskStatus(task.id, 'in_progress', {
      started_at: new Date().toISOString()
    })

    let result = null

    // Route to appropriate task handler
    switch (task.task_type) {
      case 'send_email':
        result = await handleSendEmailTask(task)
        break
        
      case 'schedule_call':
        result = await handleScheduleCallTask(task)
        break
        
      case 'score_update':
        result = await handleScoreUpdateTask(task)
        break
        
      case 'engagement_check':
        result = await handleEngagementCheckTask(task)
        break
        
      case 'qualification_review':
        result = await handleQualificationReviewTask(task)
        break
        
      case 'call_reminder':
        result = await handleCallReminderTask(task)
        break
        
      case 'warm_lead_notification':
        result = await handleWarmLeadNotificationTask(task)
        break
        
      case 'sequence_progression':
        result = await handleSequenceProgressionTask(task)
        break
        
      case 'landing_page_analytics':
        result = await handleLandingPageAnalyticsTask(task)
        break
        
      case 'cleanup_expired_data':
        result = await handleCleanupTask(task)
        break
        
      default:
        throw new Error(`Unknown task type: ${task.task_type}`)
    }

    // Mark task as completed
    await updateTaskStatus(task.id, 'completed', {
      completed_at: new Date().toISOString(),
      result
    })

    console.log(`✅ Task ${task.id} completed successfully`)
    return result

  } catch (error) {
    console.error(`❌ Task ${task.id} failed:`, error)

    // Mark task as failed with retry logic
    await handleTaskFailure(task, error)
    throw error
  }
}

// Task Handlers
async function handleSendEmailTask(task) {
  const { sequence_id, step_number } = task.task_data

  // Call email sequence API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/email-sequences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'send_email',
      sequence_id,
      step_number
    })
  })

  if (!response.ok) {
    throw new Error(`Email sending failed: ${response.statusText}`)
  }

  const result = await response.json()
  return { email_sent: true, step: step_number, ...result }
}

async function handleScheduleCallTask(task) {
  const { lead_id, call_preferences } = task.task_data

  // Call call scheduler API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/call-scheduler`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'schedule_warm_call',
      lead_id,
      call_data: call_preferences || {}
    })
  })

  if (!response.ok) {
    throw new Error(`Call scheduling failed: ${response.statusText}`)
  }

  const result = await response.json()
  return { call_scheduled: true, ...result }
}

async function handleScoreUpdateTask(task) {
  const { lead_id } = task.task_data

  // Call lead scoring API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/lead-scoring`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'score_lead',
      lead_id
    })
  })

  if (!response.ok) {
    throw new Error(`Lead scoring failed: ${response.statusText}`)
  }

  const result = await response.json()
  return { score_updated: true, ...result }
}

async function handleEngagementCheckTask(task) {
  const { lead_id } = task.task_data

  // Get lead engagement data and analyze
  const { data: lead } = await supabase
    .from('leads')
    .select(`
      *,
      email_engagement(*),
      landing_pages(*)
    `)
    .eq('id', lead_id)
    .single()

  if (!lead) {
    throw new Error('Lead not found for engagement check')
  }

  // Analyze engagement patterns
  const engagementSummary = analyzeEngagementPatterns(lead)

  // Update lead with engagement insights
  await supabase
    .from('leads')
    .update({
      engagement_summary: engagementSummary,
      last_engagement_check: new Date().toISOString()
    })
    .eq('id', lead_id)

  return { engagement_checked: true, summary: engagementSummary }
}

async function handleQualificationReviewTask(task) {
  const { lead_id } = task.task_data

  // Call lead scoring API for comprehensive review
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/lead-scoring`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'get_lead_insights',
      lead_id
    })
  })

  if (!response.ok) {
    throw new Error(`Qualification review failed: ${response.statusText}`)
  }

  const result = await response.json()
  return { qualification_reviewed: true, ...result }
}

async function handleCallReminderTask(task) {
  const { call_id, reminder_type } = task.task_data

  // Send notification to user about upcoming call
  const { data: call } = await supabase
    .from('scheduled_calls')
    .select(`
      *,
      leads(first_name, last_name, company)
    `)
    .eq('id', call_id)
    .single()

  if (!call) {
    throw new Error('Scheduled call not found')
  }

  const reminderMessages = {
    '24_hour_reminder': 'You have a call scheduled with [NAME] in 24 hours',
    '2_hour_reminder': 'Upcoming call with [NAME] in 2 hours - prepare your materials',
    '15_minute_reminder': 'Call with [NAME] starting in 15 minutes'
  }

  const message = reminderMessages[reminder_type]?.replace(
    '[NAME]', 
    `${call.leads.first_name} ${call.leads.last_name} from ${call.leads.company}`
  )

  // Create notification
  await supabase
    .from('notifications')
    .insert({
      user_id: call.user_id,
      type: 'call_reminder',
      title: `Call Reminder - ${reminder_type}`,
      message,
      data: { call_id, reminder_type },
      read: false
    })

  return { reminder_sent: true, type: reminder_type }
}

async function handleWarmLeadNotificationTask(task) {
  const { lead_id, qualification_data } = task.task_data

  // Get lead data
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', lead_id)
    .single()

  if (!lead) {
    throw new Error('Lead not found for warm notification')
  }

  // Create urgent notification for sales team
  await supabase
    .from('notifications')
    .insert({
      user_id: lead.user_id,
      type: 'warm_lead_urgent',
      title: '🔥 New Warm Lead Ready for Contact',
      message: `${lead.first_name} ${lead.last_name} from ${lead.company} is qualified and ready for immediate contact. Score: ${lead.score}/100`,
      data: { 
        lead_id, 
        score: lead.score,
        qualification_data 
      },
      priority: 'high',
      read: false
    })

  return { notification_sent: true, lead_name: `${lead.first_name} ${lead.last_name}` }
}

async function handleSequenceProgressionTask(task) {
  const { sequence_id, action } = task.task_data

  // Progress email sequence to next step
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/email-sequences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      sequence_id
    })
  })

  if (!response.ok) {
    throw new Error(`Sequence progression failed: ${response.statusText}`)
  }

  const result = await response.json()
  return { sequence_progressed: true, ...result }
}

async function handleLandingPageAnalyticsTask(task) {
  const { landing_page_id } = task.task_data

  // Analyze landing page performance
  const { data: analytics } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('landing_page_id', landing_page_id)
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const performanceMetrics = {
    views_24h: analytics?.filter(a => a.event_type === 'page_view').length || 0,
    conversions_24h: analytics?.filter(a => a.event_type === 'form_submit').length || 0,
    bounce_rate: calculateBounceRate(analytics),
    avg_time_on_page: calculateAvgTimeOnPage(analytics)
  }

  // Update landing page with performance data
  await supabase
    .from('landing_pages')
    .update({
      performance_metrics: performanceMetrics,
      last_analytics_update: new Date().toISOString()
    })
    .eq('id', landing_page_id)

  return { analytics_updated: true, metrics: performanceMetrics }
}

async function handleCleanupTask(task) {
  const { cleanup_type, days_old = 30 } = task.task_data
  const cutoffDate = new Date(Date.now() - days_old * 24 * 60 * 60 * 1000).toISOString()

  let cleanupCount = 0

  switch (cleanup_type) {
    case 'completed_tasks':
      const { data: oldTasks } = await supabase
        .from('scheduled_tasks')
        .delete()
        .eq('status', 'completed')
        .lt('completed_at', cutoffDate)
        .select('id')

      cleanupCount = oldTasks?.length || 0
      break

    case 'old_analytics':
      const { data: oldAnalytics } = await supabase
        .from('page_analytics')
        .delete()
        .lt('timestamp', cutoffDate)
        .select('id')

      cleanupCount = oldAnalytics?.length || 0
      break

    default:
      throw new Error(`Unknown cleanup type: ${cleanup_type}`)
  }

  return { cleanup_completed: true, type: cleanup_type, records_removed: cleanupCount }
}

// Utility Functions
async function updateTaskStatus(taskId, status, additionalData = {}) {
  const updateData = {
    status,
    updated_at: new Date().toISOString(),
    ...additionalData
  }

  const { error } = await supabase
    .from('scheduled_tasks')
    .update(updateData)
    .eq('id', taskId)

  if (error) {
    console.error('Failed to update task status:', error)
  }
}

async function handleTaskFailure(task, error) {
  const maxRetries = 3
  const currentRetries = task.retry_count || 0

  if (currentRetries < maxRetries) {
    // Schedule retry
    const retryDelay = Math.pow(2, currentRetries) * 60 * 1000 // Exponential backoff
    const retryTime = new Date(Date.now() + retryDelay)

    await supabase
      .from('scheduled_tasks')
      .update({
        status: 'pending',
        retry_count: currentRetries + 1,
        last_error: error.message,
        scheduled_at: retryTime.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)

    console.log(`📋 Task ${task.id} scheduled for retry ${currentRetries + 1}/${maxRetries} at ${retryTime}`)
  } else {
    // Mark as permanently failed
    await supabase
      .from('scheduled_tasks')
      .update({
        status: 'failed',
        last_error: error.message,
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)

    console.log(`❌ Task ${task.id} permanently failed after ${maxRetries} retries`)
  }
}

function analyzeEngagementPatterns(lead) {
  const engagements = lead.email_engagement || []
  const landingPages = lead.landing_pages || []

  return {
    total_engagements: engagements.length,
    engagement_types: engagements.reduce((acc, eng) => {
      acc[eng.event_type] = (acc[eng.event_type] || 0) + 1
      return acc
    }, {}),
    last_engagement: engagements[engagements.length - 1]?.timestamp,
    landing_page_views: landingPages.reduce((sum, page) => sum + page.views, 0),
    engagement_velocity: calculateEngagementVelocity(engagements)
  }
}

function calculateEngagementVelocity(engagements) {
  if (engagements.length < 2) return 0

  const recent = engagements.filter(e => {
    const hoursAgo = (new Date() - new Date(e.timestamp)) / (1000 * 60 * 60)
    return hoursAgo <= 168 // Last week
  })

  return recent.length / 7 // Engagements per day
}

function calculateBounceRate(analytics) {
  if (!analytics || analytics.length === 0) return 0

  const pageViews = analytics.filter(a => a.event_type === 'page_view')
  const engagements = analytics.filter(a => a.event_type !== 'page_view')

  if (pageViews.length === 0) return 0

  return ((pageViews.length - engagements.length) / pageViews.length) * 100
}

function calculateAvgTimeOnPage(analytics) {
  // Simplified calculation - in production would track actual time spent
  return analytics?.length > 0 ? 45 : 0 // Default 45 seconds
}

// Get task queue status
async function getTaskQueueStatus() {
  try {
    const { data: stats } = await supabase
      .from('scheduled_tasks')
      .select('status')

    const statusCounts = (stats || []).reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    // Get overdue tasks
    const { data: overdueTasks } = await supabase
      .from('scheduled_tasks')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .lt('scheduled_at', new Date().toISOString())

    return NextResponse.json({
      success: true,
      queue_status: {
        total_tasks: stats?.length || 0,
        by_status: statusCounts,
        overdue_tasks: overdueTasks?.length || 0,
        last_updated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Failed to get task queue status:', error)
    throw error
  }
}

// Retry a failed task
async function retryFailedTask(taskId) {
  try {
    const { error } = await supabase
      .from('scheduled_tasks')
      .update({
        status: 'pending',
        scheduled_at: new Date().toISOString(),
        retry_count: 0,
        last_error: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('status', 'failed')

    if (error) throw error

    return NextResponse.json({
      success: true,
      task_id: taskId,
      status: 'rescheduled_for_retry'
    })

  } catch (error) {
    console.error('❌ Failed to retry task:', error)
    throw error
  }
}

// Cleanup completed tasks
async function cleanupCompletedTasks() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: deletedTasks } = await supabase
      .from('scheduled_tasks')
      .delete()
      .eq('status', 'completed')
      .lt('completed_at', thirtyDaysAgo)
      .select('id')

    return NextResponse.json({
      success: true,
      cleanup_completed: true,
      deleted_count: deletedTasks?.length || 0
    })

  } catch (error) {
    console.error('❌ Failed to cleanup completed tasks:', error)
    throw error
  }
}

// Get task statistics
async function getTaskStatistics() {
  try {
    const { data: recentTasks } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const stats = {
      total_week: recentTasks?.length || 0,
      by_type: {},
      by_status: {},
      success_rate: 0
    }

    if (recentTasks) {
      stats.by_type = recentTasks.reduce((acc, task) => {
        acc[task.task_type] = (acc[task.task_type] || 0) + 1
        return acc
      }, {})

      stats.by_status = recentTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      }, {})

      const completed = stats.by_status.completed || 0
      const failed = stats.by_status.failed || 0
      const total = completed + failed

      stats.success_rate = total > 0 ? Math.round((completed / total) * 100) : 100
    }

    return NextResponse.json({
      success: true,
      statistics: stats
    })

  } catch (error) {
    console.error('❌ Failed to get task statistics:', error)
    throw error
  }
}