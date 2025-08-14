#!/usr/bin/env node

/**
 * LeadFly AI - Automation Testing Script
 * Tests all automation endpoints and n8n workflows
 */

import axios from 'axios';

class AutomationTester {
  constructor(config) {
    this.leadflyUrl = config.leadflyUrl;
    this.n8nUrl = config.n8nUrl;
    this.apiKey = config.apiKey;
    
    this.leadflyClient = axios.create({
      baseURL: this.leadflyUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  async runTests() {
    console.log('🧪 Starting LeadFly Automation Tests');
    console.log('=====================================');
    
    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    try {
      // Test API endpoints
      await this.testApiEndpoints(results);
      
      // Test n8n webhooks
      await this.testN8nWebhooks(results);
      
      // Test automation flow
      await this.testAutomationFlow(results);
      
      this.printResults(results);
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async testApiEndpoints(results) {
    console.log('\n🔌 Testing API Endpoints');
    console.log('========================');

    const endpoints = [
      {
        name: 'Lead Processor Health Check',
        method: 'GET',
        path: '/api/automation/lead-processor',
        expectedStatus: 200
      },
      {
        name: 'Email Sequences Health Check',
        method: 'GET', 
        path: '/api/automation/email-sequences',
        expectedStatus: 200
      },
      {
        name: 'Lead Scoring Health Check',
        method: 'GET',
        path: '/api/automation/lead-scoring',
        expectedStatus: 200
      },
      {
        name: 'Call Scheduler Health Check',
        method: 'GET',
        path: '/api/automation/call-scheduler',
        expectedStatus: 200
      },
      {
        name: 'Task Processor Health Check',
        method: 'GET',
        path: '/api/automation/task-processor?action=health_check',
        expectedStatus: 200
      },
      {
        name: 'Email Engagement Webhook Health Check',
        method: 'GET',
        path: '/api/webhooks/email-engagement?action=health_check',
        expectedStatus: 200
      }
    ];

    for (const endpoint of endpoints) {
      await this.runTest(
        endpoint.name,
        () => this.testEndpoint(endpoint),
        results
      );
    }
  }

  async testN8nWebhooks(results) {
    console.log('\n🔗 Testing n8n Webhooks');
    console.log('=======================');

    if (!this.n8nUrl) {
      console.log('⏭️  Skipping n8n tests (N8N_URL not configured)');
      return;
    }

    const webhooks = [
      {
        name: 'New Lead Webhook',
        url: `${this.n8nUrl}/webhook/leadfly/webhook/new-lead`,
        data: {
          user_id: 'test_user_123',
          first_name: 'Test',
          last_name: 'Lead',
          email: 'test@example.com',
          company: 'Test Company',
          title: 'VP Sales',
          industry: 'technology',
          source: 'automation-test'
        }
      },
      {
        name: 'Email Engagement Webhook',
        url: `${this.n8nUrl}/webhook/leadfly/webhook/email-engagement`,
        data: {
          event_type: 'opened',
          email: 'test@example.com',
          timestamp: new Date().toISOString(),
          message_id: 'test-message-123',
          provider: 'test'
        }
      }
    ];

    for (const webhook of webhooks) {
      await this.runTest(
        webhook.name,
        () => this.testWebhook(webhook),
        results
      );
    }
  }

  async testAutomationFlow(results) {
    console.log('\n🔄 Testing Automation Flow');
    console.log('==========================');

    const testLead = {
      user_id: 'test_automation_user',
      first_name: 'John',
      last_name: 'Automation',
      email: 'john.automation@testcompany.com',
      company: 'Test Automation Corp',
      title: 'CEO',
      phone: '+1234567890',
      industry: 'technology',
      source: 'automation-test',
      campaign_id: 'test_campaign_123'
    };

    // Test complete lead qualification flow
    await this.runTest(
      'Complete Lead Qualification Flow',
      () => this.testLeadQualificationFlow(testLead),
      results
    );

    // Test email engagement processing
    await this.runTest(
      'Email Engagement Processing',
      () => this.testEmailEngagementFlow('john.automation@testcompany.com'),
      results
    );

    // Test lead scoring
    await this.runTest(
      'Lead Scoring System',
      () => this.testLeadScoringFlow('john.automation@testcompany.com'),
      results
    );
  }

  async testEndpoint(endpoint) {
    const response = await this.leadflyClient.request({
      method: endpoint.method,
      url: endpoint.path
    });

    if (response.status !== endpoint.expectedStatus) {
      throw new Error(`Expected status ${endpoint.expectedStatus}, got ${response.status}`);
    }

    return {
      status: response.status,
      data: response.data
    };
  }

  async testWebhook(webhook) {
    const response = await axios.post(webhook.url, webhook.data, {
      timeout: 10000
    });

    if (response.status !== 200) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    return {
      status: response.status,
      data: response.data
    };
  }

  async testLeadQualificationFlow(testLead) {
    // Step 1: Process lead
    const processResponse = await this.leadflyClient.post('/api/automation/lead-processor', {
      user_id: testLead.user_id,
      lead_data: testLead,
      campaign_id: testLead.campaign_id
    });

    if (!processResponse.data.success) {
      throw new Error(`Lead processing failed: ${processResponse.data.error}`);
    }

    const leadId = processResponse.data.lead_id;
    if (!leadId) {
      throw new Error('No lead_id returned from lead processor');
    }

    // Step 2: Verify landing page was created
    const landingPage = processResponse.data.landing_page;
    if (!landingPage || !landingPage.url) {
      throw new Error('Landing page was not created');
    }

    // Step 3: Verify email sequence was started
    const emailSequence = processResponse.data.email_sequence;
    if (!emailSequence || !emailSequence.id) {
      throw new Error('Email sequence was not started');
    }

    return {
      lead_id: leadId,
      landing_page_url: landingPage.url,
      email_sequence_id: emailSequence.id,
      next_steps: processResponse.data.next_steps
    };
  }

  async testEmailEngagementFlow(email) {
    // Test different engagement events
    const events = ['opened', 'clicked', 'replied'];
    const results = [];

    for (const eventType of events) {
      const response = await this.leadflyClient.post('/api/webhooks/email-engagement', {
        event_type: eventType,
        email: email,
        timestamp: new Date().toISOString(),
        message_id: `test-${eventType}-${Date.now()}`,
        url: eventType === 'clicked' ? 'https://example.com/test-link' : undefined
      }, {
        headers: {
          'x-email-provider': 'test'
        }
      });

      if (!response.data.success) {
        throw new Error(`Email engagement processing failed for ${eventType}`);
      }

      results.push({
        event_type: eventType,
        processed: response.data.event_processed
      });
    }

    return results;
  }

  async testLeadScoringFlow(email) {
    // Test lead scoring by email
    const response = await this.leadflyClient.post('/api/automation/lead-scoring', {
      action: 'score_lead_by_email',
      email: email
    });

    if (!response.data.success) {
      throw new Error(`Lead scoring failed: ${response.data.error}`);
    }

    const score = response.data.score;
    if (typeof score !== 'number' || score < 0 || score > 100) {
      throw new Error(`Invalid lead score: ${score}`);
    }

    return {
      score: score,
      qualification_level: response.data.qualification_level,
      breakdown: response.data.breakdown
    };
  }

  async runTest(testName, testFunction, results) {
    process.stdout.write(`🧪 ${testName}... `);
    
    try {
      const result = await testFunction();
      results.passed++;
      results.tests.push({
        name: testName,
        status: 'PASSED',
        result: result
      });
      console.log('✅ PASSED');
      
    } catch (error) {
      results.failed++;
      results.tests.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      console.log(`❌ FAILED - ${error.message}`);
    }
  }

  printResults(results) {
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total: ${results.passed + results.failed}`);
    console.log(`🎯 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }

    console.log('\n🎉 Testing Complete!');
    
    if (results.failed === 0) {
      console.log('🚀 All automation systems are working correctly!');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
      process.exit(1);
    }
  }
}

// Configuration
const config = {
  leadflyUrl: process.env.LEADFLY_API_URL || process.argv[2] || 'http://localhost:3000',
  n8nUrl: process.env.N8N_URL || process.argv[3],
  apiKey: process.env.LEADFLY_API_KEY || process.argv[4] || 'test-api-key'
};

// Validate configuration
if (!config.leadflyUrl) {
  console.error('❌ LEADFLY_API_URL is required');
  console.log('Usage: node test-automation.js [leadfly-url] [n8n-url] [api-key]');
  console.log('Or set environment variables: LEADFLY_API_URL, N8N_URL, LEADFLY_API_KEY');
  process.exit(1);
}

// Run tests
const tester = new AutomationTester(config);
tester.runTests().catch(console.error);