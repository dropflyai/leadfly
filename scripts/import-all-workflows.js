#!/usr/bin/env node

/**
 * Import all LeadFly workflows to local n8n Docker instance
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

async function importAllWorkflows() {
  console.log('🚀 Importing All LeadFly Workflows to Docker n8n');
  console.log('===============================================');
  
  try {
    // Get all workflow files
    const workflowsDir = path.join(__dirname, '../n8n-workflows');
    const workflowFiles = fs.readdirSync(workflowsDir)
      .filter(file => file.endsWith('.json') && file !== 'README.md');
    
    console.log(`📁 Found ${workflowFiles.length} workflow files:`);
    workflowFiles.forEach(file => console.log(`   - ${file}`));
    
    let imported = 0;
    let failed = 0;
    
    for (const filename of workflowFiles) {
      try {
        console.log(`\n📥 Importing: ${filename}`);
        
        // Import workflow using n8n CLI in Docker
        const { stdout, stderr } = await execAsync(
          `docker exec leadfly-n8n n8n import:workflow --input="/home/node/.n8n/workflows/${filename}"`
        );
        
        if (stderr && !stderr.includes('deprecation')) {
          console.error(`⚠️  Warning for ${filename}: ${stderr}`);
        }
        
        console.log(`✅ Imported: ${filename}`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Failed to import ${filename}: ${error.message}`);
        failed++;
      }
    }
    
    console.log('\n🎉 Import Summary');
    console.log('================');
    console.log(`✅ Successfully imported: ${imported} workflows`);
    console.log(`❌ Failed to import: ${failed} workflows`);
    
    // List all workflows to confirm
    console.log('\n📋 Verifying workflows in n8n...');
    try {
      const { stdout } = await execAsync('docker exec leadfly-n8n n8n list:workflow');
      console.log('Current workflows in n8n:');
      console.log(stdout);
    } catch (error) {
      console.error('Could not list workflows:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Import process failed:', error.message);
  }
}

// Copy workflows to n8n container first
async function copyWorkflowsToContainer() {
  try {
    console.log('📁 Copying workflow files to n8n container...');
    
    const workflowsDir = path.join(__dirname, '../n8n-workflows');
    const workflowFiles = fs.readdirSync(workflowsDir)
      .filter(file => file.endsWith('.json'));
    
    for (const filename of workflowFiles) {
      const sourcePath = path.join(workflowsDir, filename);
      await execAsync(
        `docker cp "${sourcePath}" leadfly-n8n:/home/node/.n8n/workflows/`
      );
    }
    
    console.log(`✅ Copied ${workflowFiles.length} workflow files to container`);
    
  } catch (error) {
    console.error('❌ Failed to copy workflows:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await copyWorkflowsToContainer();
    await importAllWorkflows();
  } catch (error) {
    console.error('❌ Process failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);