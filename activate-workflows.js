#!/usr/bin/env node

/**
 * Activate all LeadFly n8n workflows
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const WORKFLOWS = [
  'leadfly-duplicate-prevention',
  'leadfly-lead-qualification', 
  'leadfly-call-scheduler',
  'leadfly-email-engagement',
  'leadfly-task-processor',
  'leadfly-ai-master-coordinator'
];

async function activateWorkflows() {
  console.log('🚀 Activating LeadFly n8n Workflows');
  console.log('===================================');
  
  let activated = 0;
  let failed = 0;
  
  for (const workflowId of WORKFLOWS) {
    try {
      console.log(`\n🔄 Activating: ${workflowId}`);
      
      const { stdout, stderr } = await execAsync(
        `docker exec leadfly-n8n n8n update:workflow --id="${workflowId}" --active=true`
      );
      
      if (stderr && !stderr.includes('deprecation')) {
        console.log(`⚠️ Warning: ${stderr}`);
      }
      
      console.log(`✅ Activated: ${workflowId}`);
      activated++;
      
    } catch (error) {
      console.error(`❌ Failed to activate ${workflowId}: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n🎉 Activation Summary');
  console.log('====================');
  console.log(`✅ Activated: ${activated} workflows`);
  console.log(`❌ Failed: ${failed} workflows`);
  
  // List final status
  try {
    console.log('\n📋 Final Workflow Status:');
    const { stdout } = await execAsync('docker exec leadfly-n8n n8n list:workflow');
    console.log(stdout);
  } catch (error) {
    console.error('Could not list final status:', error.message);
  }
}

activateWorkflows().catch(console.error);