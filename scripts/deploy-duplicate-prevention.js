#!/usr/bin/env node

/**
 * Deploy Duplicate Prevention Workflow to n8n
 * 
 * This script deploys the duplicate prevention agent workflow to your n8n instance
 * and verifies that it's working correctly with the LeadFly API.
 */

import fs from 'fs'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const config = {
  n8nBaseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  n8nApiKey: process.env.N8N_API_KEY || '', // Will be prompted if not set
  leadflyApiUrl: process.env.LEADFLY_API_URL || 'https://leadfly-ai.vercel.app',
  workflowFile: join(__dirname, '../n8n-workflows/duplicate-prevention-agent.json')
}

console.log('🚀 LeadFly AI - Duplicate Prevention Deployment\n')

async function main() {
  try {
    // Step 1: Validate configuration
    console.log('📋 Step 1: Validating configuration...')
    await validateConfiguration()
    
    // Step 2: Check n8n connectivity
    console.log('🔗 Step 2: Testing n8n connectivity...')
    await testN8nConnection()
    
    // Step 3: Load and validate workflow
    console.log('📁 Step 3: Loading workflow file...')
    const workflow = await loadWorkflow()
    
    // Step 4: Deploy workflow
    console.log('🚀 Step 4: Deploying workflow to n8n...')
    const deployedWorkflow = await deployWorkflow(workflow)
    
    // Step 5: Activate workflow
    console.log('⚡ Step 5: Activating workflow...')
    await activateWorkflow(deployedWorkflow.id)
    
    // Step 6: Test webhook endpoint
    console.log('🧪 Step 6: Testing webhook endpoint...')
    await testWebhookEndpoint(deployedWorkflow.id)
    
    // Step 7: Verify integration with LeadFly API
    console.log('🔧 Step 7: Testing LeadFly API integration...')
    await testLeadFlyIntegration()
    
    console.log('\n✅ Deployment completed successfully!')
    console.log('\n📊 Deployment Summary:')
    console.log(`   Workflow ID: ${deployedWorkflow.id}`)
    console.log(`   Webhook URL: ${config.n8nBaseUrl}/webhook/leadfly/duplicate-prevention`)
    console.log(`   Status: Active and ready for production`)
    console.log(`   Next Steps: Update your lead capture forms to use the webhook URL`)
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message)
    console.error('\n🔧 Troubleshooting steps:')
    console.error('   1. Ensure n8n is running and accessible')
    console.error('   2. Verify N8N_API_KEY is configured correctly')
    console.error('   3. Check network connectivity to n8n instance')
    console.error('   4. Review n8n logs for any errors')
    process.exit(1)
  }
}

async function validateConfiguration() {
  // Check if workflow file exists
  if (!fs.existsSync(config.workflowFile)) {
    throw new Error(`Workflow file not found: ${config.workflowFile}`)
  }
  
  // Check if API key is configured
  if (!config.n8nApiKey) {
    console.log('\n⚠️  N8N_API_KEY not found in environment variables')
    console.log('   Please create an API key in your n8n instance:')
    console.log('   1. Go to Settings > API Keys in your n8n interface')
    console.log('   2. Create a new API key with workflow permissions')
    console.log('   3. Set the environment variable: export N8N_API_KEY="your-api-key"')
    console.log('   4. Re-run this deployment script')
    throw new Error('N8N_API_KEY is required for deployment')
  }
  
  console.log('   ✓ Configuration validated')
}

async function testN8nConnection() {
  try {
    const response = await axios.get(`${config.n8nBaseUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': config.n8nApiKey
      }
    })
    
    console.log(`   ✓ n8n connection successful (${response.data.data.length} workflows found)`)
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid N8N_API_KEY. Please check your API key configuration.')
    }
    throw new Error(`Failed to connect to n8n: ${error.message}`)
  }
}

async function loadWorkflow() {
  try {
    const workflowData = fs.readFileSync(config.workflowFile, 'utf8')
    const workflow = JSON.parse(workflowData)
    
    // Validate workflow structure
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Invalid workflow format: missing nodes array')
    }
    
    if (!workflow.connections || typeof workflow.connections !== 'object') {
      throw new Error('Invalid workflow format: missing connections object')
    }
    
    console.log(`   ✓ Workflow loaded (${workflow.nodes.length} nodes)`)
    return workflow
  } catch (error) {
    throw new Error(`Failed to load workflow: ${error.message}`)
  }
}

async function deployWorkflow(workflow) {
  try {
    // Remove any properties that n8n auto-generates
    const cleanWorkflow = {
      ...workflow,
      id: undefined,
      versionId: undefined,
      meta: undefined,
      active: undefined
    }
    
    const response = await axios.post(`${config.n8nBaseUrl}/api/v1/workflows`, cleanWorkflow, {
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': config.n8nApiKey
      }
    })
    
    console.log(`   ✓ Workflow deployed successfully (ID: ${response.data.data.id})`)
    return response.data.data
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(`n8n API error: ${error.response.data.message}`)
    }
    throw new Error(`Failed to deploy workflow: ${error.message}`)
  }
}

async function activateWorkflow(workflowId) {
  try {
    await axios.patch(`${config.n8nBaseUrl}/api/v1/workflows/${workflowId}`, 
      { active: true },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': config.n8nApiKey
        }
      }
    )
    
    console.log('   ✓ Workflow activated successfully')
  } catch (error) {
    throw new Error(`Failed to activate workflow: ${error.message}`)
  }
}

async function testWebhookEndpoint(workflowId) {
  try {
    // Wait a moment for webhook to register
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const testPayload = {
      user_id: 'test-user-123',
      source_id: 'deployment-test',
      lead_data: {
        email: 'test@deployment.com',
        first_name: 'Test',
        last_name: 'User',
        company: 'Deployment Test Co',
        phone: '+1-555-123-4567'
      }
    }
    
    const response = await axios.post(
      `${config.n8nBaseUrl}/webhook/leadfly/duplicate-prevention`,
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )
    
    if (response.data.success && response.data.duplicate_check_complete) {
      console.log('   ✓ Webhook endpoint test successful')
      console.log(`   ✓ Duplicate check result: ${response.data.action_taken}`)
    } else {
      throw new Error('Webhook test failed: Invalid response format')
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Webhook test timeout - check workflow execution logs')
    }
    throw new Error(`Webhook test failed: ${error.message}`)
  }
}

async function testLeadFlyIntegration() {
  try {
    // Test if LeadFly API is accessible
    const response = await axios.get(`${config.leadflyApiUrl}/api/health`, {
      timeout: 5000
    })
    
    console.log('   ✓ LeadFly API connectivity verified')
    
    // Test duplicate check endpoint
    const testResponse = await axios.post(
      `${config.leadflyApiUrl}/api/automation/lead-processor`,
      {
        action: 'duplicate_check',
        user_id: 'test-user-123',
        lead_data: {
          email: 'integration@test.com',
          first_name: 'Integration',
          last_name: 'Test'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )
    
    if (testResponse.data.success) {
      console.log('   ✓ LeadFly duplicate check integration verified')
    }
  } catch (error) {
    console.log('   ⚠️  LeadFly API test failed (this may be expected in development)')
    console.log(`   📝 Error: ${error.message}`)
    console.log('   💡 Ensure LeadFly API is deployed and accessible')
  }
}

// Performance monitoring function
async function setupMonitoring() {
  console.log('\n📊 Setting up monitoring and alerts...')
  
  const monitoringConfig = {
    webhook_health_check: `${config.n8nBaseUrl}/webhook/leadfly/duplicate-prevention/health`,
    expected_response_time: '< 500ms',
    uptime_target: '99.9%',
    error_threshold: '< 0.1%'
  }
  
  console.log('   ✓ Monitoring configuration prepared:')
  console.log(`   • Health Check URL: ${monitoringConfig.webhook_health_check}`)
  console.log(`   • Response Time Target: ${monitoringConfig.expected_response_time}`)
  console.log(`   • Uptime Target: ${monitoringConfig.uptime_target}`)
  console.log(`   • Error Rate Threshold: ${monitoringConfig.error_threshold}`)
  
  return monitoringConfig
}

// Run the deployment
main().catch(console.error)

export { config, setupMonitoring }