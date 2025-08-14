#!/usr/bin/env node

/**
 * Import LeadFly workflows to your n8n instance
 * Uses the correct n8n API format
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const N8N_URL = 'https://botthentic.com';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZTEyODc0Ni0yNTk3LTRkYjAtYmQzNy1hMzBkZTQ3MjRjZjAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMjg4NTYzfQ.fBaYlJW8FewpxM3FLyidyV8aiPcq09knZ3jf2qXa8yY';
const LEADFLY_API_URL = 'https://leadfly-ai.vercel.app';

const client = axios.create({
  baseURL: `${N8N_URL}/api/v1`,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

async function importLeadFlyWorkflows() {
  console.log('🚀 Importing LeadFly Workflows to n8n');
  console.log('=====================================');
  
  try {
    // Test connection
    console.log('📡 Testing n8n connection...');
    const { data: workflows } = await client.get('/workflows');
    console.log(`✅ Connected! Found ${workflows.data.length} existing workflows`);
    
    // Import each workflow
    const workflowsDir = path.join(__dirname, '../n8n-workflows');
    const workflowFiles = [
      'lead-qualification-master.json',
      'email-engagement-processor.json',
      'warm-lead-call-scheduler.json',
      'task-queue-processor.json'
    ];
    
    let imported = 0;
    let skipped = 0;
    
    for (const filename of workflowFiles) {
      const filePath = path.join(workflowsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filename}`);
        continue;
      }
      
      try {
        const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Update workflow URLs to use your LeadFly API
        updateWorkflowUrls(workflowData);
        
        // Check if workflow already exists
        const existingWorkflow = workflows.data.find(w => w.name === workflowData.name);
        
        if (existingWorkflow) {
          console.log(`⏭️  Workflow already exists: ${workflowData.name}`);
          skipped++;
          continue;
        }
        
        // Import workflow
        console.log(`📥 Importing: ${workflowData.name}`);
        const response = await client.post('/workflows', workflowData);
        
        // Activate the workflow
        if (response.data && response.data.id) {
          await client.patch(`/workflows/${response.data.id}`, { active: true });
          console.log(`✅ Imported and activated: ${workflowData.name}`);
          imported++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to import ${filename}:`, error.response?.data || error.message);
      }
    }
    
    console.log('\n🎉 Import Summary');
    console.log('================');
    console.log(`✅ Imported: ${imported} workflows`);
    console.log(`⏭️  Skipped: ${skipped} workflows`);
    
    if (imported > 0) {
      console.log('\n🔗 Webhook Endpoints Available:');
      console.log(`📧 New Leads: ${N8N_URL}/webhook/leadfly/webhook/new-lead`);
      console.log(`📊 Email Engagement: ${N8N_URL}/webhook/leadfly/webhook/email-engagement`);
      
      console.log('\n⚙️  Next Steps:');
      console.log('1. Configure your email providers to use the webhook endpoints above');
      console.log('2. Test the automation by sending sample data');
      console.log('3. Monitor workflow executions in your n8n interface');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.response?.data || error.message);
  }
}

function updateWorkflowUrls(workflowData) {
  if (!workflowData.nodes) return;
  
  workflowData.nodes.forEach(node => {
    if (node.parameters?.url) {
      // Update LeadFly API URLs
      if (node.parameters.url.includes('{{$env.LEADFLY_API_URL}}')) {
        node.parameters.url = node.parameters.url.replace('{{$env.LEADFLY_API_URL}}', LEADFLY_API_URL);
      }
    }
    
    // Update header parameters
    if (node.parameters?.headerParameters?.parameters) {
      node.parameters.headerParameters.parameters.forEach(param => {
        if (param.value && param.value.includes('{{$env.LEADFLY_API_KEY}}')) {
          param.value = param.value.replace('{{$env.LEADFLY_API_KEY}}', 'sk-leadfly-placeholder-key');
        }
      });
    }
  });
}

// Run the import
importLeadFlyWorkflows().catch(console.error);