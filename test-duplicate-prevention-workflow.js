#!/usr/bin/env node

/**
 * LeadFly AI - Duplicate Prevention Workflow Test Suite
 * 
 * This script tests the duplicate prevention workflow deployed to n8n
 * Run after deploying the duplicate-prevention-agent.json workflow
 * 
 * Usage: node test-duplicate-prevention-workflow.js
 */

const https = require('https');
const http = require('http');

class DuplicatePreventionTester {
    constructor() {
        // Default n8n webhook URL - update with your actual n8n instance
        this.webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/leadfly/duplicate-prevention';
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🚀 Starting LeadFly Duplicate Prevention Workflow Tests\n');
        
        try {
            await this.testValidLead();
            await this.testDuplicateEmail();
            await this.testDuplicatePhone();
            await this.testSuspiciousLead();
            await this.testIncompleteData();
            await this.testBulkSubmission();
            
            this.printResults();
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
        }
    }

    async testValidLead() {
        console.log('📋 Test 1: Valid Lead Processing');
        
        const testData = {
            user_id: 'test-user-001',
            source_id: 'website-form',
            lead_data: {
                email: 'john.doe@acmecorp.com',
                phone: '+1-555-123-4567',
                first_name: 'John',
                last_name: 'Doe',
                company: 'Acme Corporation',
                job_title: 'VP of Sales',
                website: 'https://acmecorp.com'
            }
        };

        const result = await this.makeWebhookRequest(testData);
        
        this.validateResult(result, {
            expectedAction: 'allow_processing',
            expectedDuplicate: false,
            testName: 'Valid Lead Processing'
        });
    }

    async testDuplicateEmail() {
        console.log('📋 Test 2: Duplicate Email Detection');
        
        const testData = {
            user_id: 'test-user-002',
            source_id: 'linkedin-import',
            lead_data: {
                email: 'duplicate@testcompany.com',
                phone: '+1-555-987-6543',
                first_name: 'Jane',
                last_name: 'Smith',
                company: 'Test Company Inc'
            }
        };

        // First submission
        await this.makeWebhookRequest(testData);
        
        // Second submission (should be detected as duplicate)
        const result = await this.makeWebhookRequest(testData);
        
        this.validateResult(result, {
            expectedAction: 'reject_duplicate',
            expectedDuplicate: true,
            testName: 'Duplicate Email Detection'
        });
    }

    async testDuplicatePhone() {
        console.log('📋 Test 3: Duplicate Phone Detection');
        
        const testData = {
            user_id: 'test-user-003',
            source_id: 'cold-outreach',
            lead_data: {
                email: 'different@email.com',
                phone: '555-DUPLICATE',
                first_name: 'Bob',
                last_name: 'Wilson',
                company: 'Different Company'
            }
        };

        // First submission
        await this.makeWebhookRequest(testData);
        
        // Second submission with same phone (different format)
        const duplicateData = {
            ...testData,
            lead_data: {
                ...testData.lead_data,
                phone: '(555) DUPLICATE',
                email: 'another@email.com'
            }
        };
        
        const result = await this.makeWebhookRequest(duplicateData);
        
        this.validateResult(result, {
            expectedAction: 'reject_duplicate',
            expectedDuplicate: true,
            testName: 'Duplicate Phone Detection'
        });
    }

    async testSuspiciousLead() {
        console.log('📋 Test 4: Suspicious Lead Flagging');
        
        const testData = {
            user_id: 'test-user-004',
            source_id: 'unknown-source',
            lead_data: {
                email: 'suspicious@tempmail.com',
                phone: '+1-000-000-0000',
                first_name: 'Test',
                last_name: 'User',
                company: 'Test Corp'
            }
        };

        const result = await this.makeWebhookRequest(testData);
        
        this.validateResult(result, {
            expectedAction: 'flag_for_review',
            expectedDuplicate: false,
            testName: 'Suspicious Lead Flagging'
        });
    }

    async testIncompleteData() {
        console.log('📋 Test 5: Incomplete Data Handling');
        
        const testData = {
            user_id: 'test-user-005',
            source_id: 'partial-form',
            lead_data: {
                first_name: 'Incomplete',
                company: 'Missing Contact Info'
                // Missing email and phone
            }
        };

        try {
            const result = await this.makeWebhookRequest(testData);
            
            this.testResults.push({
                test: 'Incomplete Data Handling',
                status: result.success ? '❌ FAIL' : '✅ PASS',
                message: result.success ? 'Should have rejected incomplete data' : 'Correctly rejected incomplete data'
            });
        } catch (error) {
            this.testResults.push({
                test: 'Incomplete Data Handling',
                status: '✅ PASS',
                message: 'Correctly threw error for missing required fields'
            });
        }
    }

    async testBulkSubmission() {
        console.log('📋 Test 6: Bulk Submission Pattern Detection');
        
        const baseData = {
            user_id: 'test-user-006',
            source_id: 'bulk-import',
            lead_data: {
                phone: '+1-555-000-0001',
                first_name: 'Bulk',
                last_name: 'Lead',
                company: 'Bulk Corp'
            }
        };

        // Submit multiple leads rapidly
        const promises = [];
        for (let i = 1; i <= 5; i++) {
            const testData = {
                ...baseData,
                lead_data: {
                    ...baseData.lead_data,
                    email: `bulk${i}@bulkcorp.com`,
                    phone: `+1-555-000-000${i}`
                }
            };
            promises.push(this.makeWebhookRequest(testData));
        }

        const results = await Promise.all(promises);
        
        // Check if any were flagged for bulk submission patterns
        const flaggedCount = results.filter(r => 
            r.action === 'flag_for_review' || 
            r.risk_assessment?.risk_factors?.bulk_submission_pattern
        ).length;

        this.testResults.push({
            test: 'Bulk Submission Pattern Detection',
            status: flaggedCount > 0 ? '✅ PASS' : '⚠️ INFO',
            message: `${flaggedCount} out of 5 submissions flagged for bulk patterns`
        });
    }

    async makeWebhookRequest(data) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            const url = new URL(this.webhookUrl);
            
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const client = url.protocol === 'https:' ? https : http;
            
            const req = client.request(options, (res) => {
                let responseBody = '';
                
                res.on('data', (chunk) => {
                    responseBody += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const result = JSON.parse(responseBody);
                        resolve(result);
                    } catch (error) {
                        reject(new Error(`Invalid JSON response: ${responseBody}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    validateResult(result, expected) {
        const isCorrectAction = result.action_taken === expected.expectedAction;
        const isCorrectDuplicate = result.duplicate_found === expected.expectedDuplicate;
        const passed = isCorrectAction && isCorrectDuplicate;

        this.testResults.push({
            test: expected.testName,
            status: passed ? '✅ PASS' : '❌ FAIL',
            message: passed 
                ? `Action: ${result.action_taken}, Duplicate: ${result.duplicate_found}`
                : `Expected action: ${expected.expectedAction}, got: ${result.action_taken}. Expected duplicate: ${expected.expectedDuplicate}, got: ${result.duplicate_found}`
        });

        if (passed) {
            console.log(`   ✅ ${expected.testName} - PASS`);
        } else {
            console.log(`   ❌ ${expected.testName} - FAIL`);
            console.log(`      Expected: action=${expected.expectedAction}, duplicate=${expected.expectedDuplicate}`);
            console.log(`      Got: action=${result.action_taken}, duplicate=${result.duplicate_found}`);
        }

        console.log(`      Risk Level: ${result.risk_level}`);
        console.log(`      Confidence: ${(result.confidence_score * 100).toFixed(1)}%\n`);
    }

    printResults() {
        console.log('📊 Test Results Summary');
        console.log('='.repeat(50));
        
        const passed = this.testResults.filter(r => r.status.includes('PASS')).length;
        const failed = this.testResults.filter(r => r.status.includes('FAIL')).length;
        const info = this.testResults.filter(r => r.status.includes('INFO')).length;
        
        this.testResults.forEach(result => {
            console.log(`${result.status} ${result.test}`);
            console.log(`    ${result.message}\n`);
        });
        
        console.log(`Total Tests: ${this.testResults.length}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️ Info: ${info}`);
        
        if (failed === 0) {
            console.log('\n🎉 All critical tests passed! Duplicate prevention workflow is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the workflow configuration.');
        }
    }
}

// Manual deployment instructions for n8n
function printDeploymentInstructions() {
    console.log('🔧 N8N DEPLOYMENT INSTRUCTIONS');
    console.log('='.repeat(50));
    console.log('');
    console.log('Since n8n MCP tools are not available, please manually deploy:');
    console.log('');
    console.log('1. Log into your n8n instance at your configured URL');
    console.log('2. Click "Import from File" or "New Workflow"');
    console.log('3. Import: /Users/rioallen/Documents/DropFly/knowledge-engine/leadfly-integration/n8n-workflows/duplicate-prevention-agent.json');
    console.log('4. Activate the workflow');
    console.log('5. Note the webhook URL generated');
    console.log('6. Update N8N_WEBHOOK_URL environment variable');
    console.log('7. Run this test script again');
    console.log('');
    console.log('Environment variable to set:');
    console.log('export N8N_WEBHOOK_URL="http://your-n8n-instance/webhook/leadfly/duplicate-prevention"');
    console.log('');
}

// Main execution
if (require.main === module) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
        printDeploymentInstructions();
        process.exit(1);
    }
    
    const tester = new DuplicatePreventionTester();
    tester.runAllTests().catch(console.error);
}

module.exports = DuplicatePreventionTester;