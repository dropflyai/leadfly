// DropFly LeadFly - n8n Workflow Integration
// Complete automation with your n8n instances

// Your n8n API Keys
const N8N_TOKENS = {
  CORTEX_CRAWLER: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNWYzODQzNy00NzM5LTRhODQtYTcwZi0wZjFiMmM3OTRiOGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMjAxODEzfQ.q4GeksOz4LswWPdrLwGI4vVYHDqvrypGejWTMl1FloQ',
  N8N_MCP: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZTEyODc0Ni0yNTk3LTRkYjAtYmQzNy1hMzBkZTQ3MjRjZjAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMjg4NTYzfQ.fBaYlJW8FewpxM3FLyidyV8aiPcq09knZ3jf2qXa8yY',
  ELEVEN_LABS: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZTEyODc0Ni0yNTk3LTRkYjAtYmQzNy1hMzBkZTQ3MjRjZjAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDEyODU1fQ.CimDPfrcZBoUEQJX_qMA9olOgu59EN4u5TIM2Pbf_YM',
  VOICE_AUTH: 'Bearer maya-voice-app-secure-token-2024-1234'
}

// n8n Base URLs (update with your actual instances)
const N8N_ENDPOINTS = {
  CORTEX: 'https://botthentic.com', // Your main n8n instance
  MCP: 'https://n8n-mcp.botthentic.com', // MCP instance
  VOICE: 'https://voice.botthentic.com' // Voice automation instance
}

// =============================================
// N8N WORKFLOW MANAGEMENT
// =============================================

/**
 * Execute n8n workflow with lead data
 */
export async function executeN8nWorkflow(workflowId, leadData, instance = 'CORTEX') {
  try {
    const endpoint = N8N_ENDPOINTS[instance]
    const token = N8N_TOKENS[instance === 'CORTEX' ? 'CORTEX_CRAWLER' : 'N8N_MCP']

    const response = await fetch(`${endpoint}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        data: leadData,
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`n8n workflow execution failed: ${response.status}`)
    }

    const result = await response.json()
    
    return {
      success: true,
      execution_id: result.executionId,
      workflow_id: workflowId,
      instance,
      result
    }

  } catch (error) {
    console.error('n8n workflow execution error:', error)
    return {
      success: false,
      error: error.message,
      workflow_id: workflowId,
      instance
    }
  }
}

/**
 * Get n8n workflow execution status
 */
export async function getWorkflowStatus(executionId, instance = 'CORTEX') {
  try {
    const endpoint = N8N_ENDPOINTS[instance]
    const token = N8N_TOKENS[instance === 'CORTEX' ? 'CORTEX_CRAWLER' : 'N8N_MCP']

    const response = await fetch(`${endpoint}/api/v1/executions/${executionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get execution status: ${response.status}`)
    }

    return await response.json()

  } catch (error) {
    console.error('n8n status check error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * List available n8n workflows
 */
export async function listN8nWorkflows(instance = 'CORTEX') {
  try {
    const endpoint = N8N_ENDPOINTS[instance]
    const token = N8N_TOKENS[instance === 'CORTEX' ? 'CORTEX_CRAWLER' : 'N8N_MCP']

    const response = await fetch(`${endpoint}/api/v1/workflows`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to list workflows: ${response.status}`)
    }

    const workflows = await response.json()
    
    return {
      success: true,
      workflows: workflows.data || workflows,
      count: workflows.data?.length || workflows.length || 0,
      instance
    }

  } catch (error) {
    console.error('n8n workflow list error:', error)
    return {
      success: false,
      error: error.message,
      instance
    }
  }
}

// =============================================
// VOICE AUTOMATION WITH ELEVEN LABS
// =============================================

/**
 * Trigger voice call automation for high-value leads
 */
export async function triggerVoiceAutomation(leadData) {
  try {
    const voiceWorkflowData = {
      lead: leadData,
      call_type: leadData.lead_score >= 90 ? 'executive' : 'standard',
      script_template: getVoiceScript(leadData),
      priority: leadData.lead_score >= 80 ? 'high' : 'normal'
    }

    // Execute voice workflow on Eleven Labs instance
    const result = await executeN8nWorkflow('voice-automation-workflow', voiceWorkflowData, 'VOICE')

    if (result.success) {
      // Log voice automation in database
      await logVoiceAutomation(leadData.id, result.execution_id)
    }

    return result

  } catch (error) {
    console.error('Voice automation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate voice script based on lead data
 */
function getVoiceScript(leadData) {
  const scripts = {
    executive: `Hi ${leadData.first_name}, this is Maya from DropFly. I noticed ${leadData.company_name} and thought you might be interested in how companies like yours are increasing their lead generation by 500%. Do you have 30 seconds to hear about a breakthrough approach?`,
    
    standard: `Hello ${leadData.first_name}, this is Maya calling about lead generation solutions for ${leadData.company_name}. We're helping ${leadData.industry} companies like yours generate qualified leads automatically. Would you be interested in a 2-minute overview?`,
    
    follow_up: `Hi ${leadData.first_name}, Maya from DropFly following up on our automated lead generation solution. I have some specific results from ${leadData.industry} companies that might interest you.`
  }

  return scripts[leadData.lead_score >= 90 ? 'executive' : 'standard']
}

// =============================================
// CORTEX CRAWLER INTEGRATION
// =============================================

/**
 * Trigger competitive intelligence crawling
 */
export async function triggerCortexCrawler(companyDomain) {
  try {
    const crawlerData = {
      target_domain: companyDomain,
      crawl_depth: 3,
      extract_contacts: true,
      analyze_technology: true,
      competitor_analysis: true,
      intent_signals: true
    }

    const result = await executeN8nWorkflow('cortex-crawler-workflow', crawlerData, 'CORTEX')

    return {
      success: result.success,
      crawl_id: result.execution_id,
      domain: companyDomain,
      estimated_completion: new Date(Date.now() + 10 * 60000).toISOString() // 10 minutes
    }

  } catch (error) {
    console.error('Cortex crawler error:', error)
    return { success: false, error: error.message }
  }
}

// =============================================
// COMPLETE AUTOMATION PIPELINE
// =============================================

/**
 * Execute complete lead automation pipeline
 */
export async function executeCompleteAutomation(leadData) {
  try {
    console.log(`🤖 Starting complete automation for lead: ${leadData.first_name} ${leadData.last_name}`)

    const automationResults = {
      lead_id: leadData.id,
      automations: [],
      success_count: 0,
      total_count: 0
    }

    // 1. Trigger data enrichment workflow
    console.log('📊 Triggering data enrichment...')
    const enrichmentResult = await executeN8nWorkflow('lead-enrichment-workflow', leadData, 'MCP')
    automationResults.automations.push({
      type: 'enrichment',
      success: enrichmentResult.success,
      execution_id: enrichmentResult.execution_id
    })
    if (enrichmentResult.success) automationResults.success_count++
    automationResults.total_count++

    // 2. Trigger competitive intelligence if high-value lead
    if (leadData.lead_score >= 75 && leadData.company_domain) {
      console.log('🕵️ Triggering competitive intelligence...')
      const crawlerResult = await triggerCortexCrawler(leadData.company_domain)
      automationResults.automations.push({
        type: 'competitive_intelligence',
        success: crawlerResult.success,
        crawl_id: crawlerResult.crawl_id
      })
      if (crawlerResult.success) automationResults.success_count++
      automationResults.total_count++
    }

    // 3. Trigger email automation
    console.log('📧 Triggering email automation...')
    const emailResult = await executeN8nWorkflow('email-automation-workflow', {
      ...leadData,
      email_type: leadData.lead_score >= 80 ? 'personalized' : 'template'
    }, 'MCP')
    automationResults.automations.push({
      type: 'email_automation',
      success: emailResult.success,
      execution_id: emailResult.execution_id
    })
    if (emailResult.success) automationResults.success_count++
    automationResults.total_count++

    // 4. Trigger voice automation for high-value leads
    if (leadData.lead_score >= 80 && leadData.phone) {
      console.log('📞 Triggering voice automation...')
      const voiceResult = await triggerVoiceAutomation(leadData)
      automationResults.automations.push({
        type: 'voice_automation',
        success: voiceResult.success,
        execution_id: voiceResult.execution_id
      })
      if (voiceResult.success) automationResults.success_count++
      automationResults.total_count++
    }

    // 5. Update lead status in database
    await updateLeadAutomationStatus(leadData.id, automationResults)

    console.log(`✅ Automation complete: ${automationResults.success_count}/${automationResults.total_count} successful`)

    return {
      success: true,
      ...automationResults,
      completion_rate: (automationResults.success_count / automationResults.total_count) * 100
    }

  } catch (error) {
    console.error('Complete automation error:', error)
    return {
      success: false,
      error: error.message,
      lead_id: leadData.id
    }
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

async function logVoiceAutomation(leadId, executionId) {
  // This would log to your Supabase database
  console.log(`📞 Voice automation logged for lead ${leadId}: ${executionId}`)
}

async function updateLeadAutomationStatus(leadId, automationResults) {
  // This would update the lead record in Supabase
  console.log(`📝 Updated automation status for lead ${leadId}`)
}

// =============================================
// WORKFLOW DEFINITIONS
// =============================================

/**
 * Get predefined workflow configurations
 */
export function getWorkflowConfigs() {
  return {
    'lead-enrichment-workflow': {
      name: 'Lead Data Enrichment',
      description: 'Enriches lead data from multiple sources',
      triggers: ['new_lead', 'lead_update'],
      estimated_duration: '2-5 minutes'
    },
    
    'email-automation-workflow': {
      name: 'Email Campaign Automation',
      description: 'Sends personalized emails based on lead score',
      triggers: ['lead_qualified', 'manual_trigger'],
      estimated_duration: '1-2 minutes'
    },
    
    'voice-automation-workflow': {
      name: 'Voice Call Automation',
      description: 'Initiates AI voice calls for high-value leads',
      triggers: ['high_value_lead', 'manual_trigger'],
      estimated_duration: '5-10 minutes'
    },
    
    'cortex-crawler-workflow': {
      name: 'Competitive Intelligence Crawler',
      description: 'Crawls competitor websites for intelligence',
      triggers: ['new_company', 'scheduled_crawl'],
      estimated_duration: '10-30 minutes'
    },
    
    'linkedin-automation-workflow': {
      name: 'LinkedIn Outreach',
      description: 'Automates LinkedIn connection and messaging',
      triggers: ['lead_qualified', 'social_trigger'],
      estimated_duration: '3-5 minutes'
    }
  }
}

// =============================================
// API ENDPOINTS
// =============================================

/**
 * POST /api/automation/execute
 */
export async function handleExecuteAutomation(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { workflow_id, lead_data, instance = 'CORTEX' } = req.body

    if (!workflow_id || !lead_data) {
      return res.status(400).json({ error: 'Workflow ID and lead data required' })
    }

    const result = await executeN8nWorkflow(workflow_id, lead_data, instance)

    return res.status(200).json(result)

  } catch (error) {
    console.error('Automation API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

/**
 * GET /api/automation/workflows
 */
export async function handleListWorkflows(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { instance = 'CORTEX' } = req.query

    const result = await listN8nWorkflows(instance)

    return res.status(200).json(result)

  } catch (error) {
    console.error('List workflows API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

export default {
  executeN8nWorkflow,
  getWorkflowStatus,
  listN8nWorkflows,
  triggerVoiceAutomation,
  triggerCortexCrawler,
  executeCompleteAutomation,
  getWorkflowConfigs,
  handleExecuteAutomation,
  handleListWorkflows,
  N8N_TOKENS,
  N8N_ENDPOINTS
}