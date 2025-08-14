#!/usr/bin/env node

/**
 * Test script for Duplicate Prevention Webhook
 * Tests the duplicate prevention agent workflow functionality
 */

import axios from 'axios';

const WEBHOOK_URL = 'http://localhost:5678/webhook/leadfly/duplicate-prevention';

// Test cases for duplicate prevention
const testCases = [
  {
    name: 'Valid Lead - No Duplicates',
    data: {
      user_id: 'test_user_001',
      source_id: 'form_submission',
      lead_data: {
        email: 'john.smith@acmecorp.com',
        phone: '+1-555-123-4567',
        first_name: 'John',
        last_name: 'Smith',
        company: 'Acme Corporation'
      }
    },
    expectedAction: 'allow_processing'
  },
  {
    name: 'Potential Email Duplicate',
    data: {
      user_id: 'test_user_002',
      source_id: 'form_submission',
      lead_data: {
        email: 'john.smith@acmecorp.com', // Same email as previous
        phone: '+1-555-987-6543',
        first_name: 'Johnny',
        company: 'Different Corp'
      }
    },
    expectedAction: 'flag_for_review'
  },
  {
    name: 'Phone Duplicate Check',
    data: {
      user_id: 'test_user_003',
      source_id: 'form_submission',
      lead_data: {
        email: 'different@email.com',
        phone: '+1-555-123-4567', // Same phone as first test
        first_name: 'Jane',
        company: 'Another Company'
      }
    },
    expectedAction: 'flag_for_review'
  },
  {
    name: 'Company + Name Fuzzy Match',
    data: {
      user_id: 'test_user_004',
      source_id: 'form_submission',
      lead_data: {
        email: 'ceo@newcorp.com',
        phone: '+1-555-999-8888',
        first_name: 'John',
        company: 'Acme Corp' // Similar to "Acme Corporation"
      }
    },
    expectedAction: 'allow_processing' // Low probability, should allow
  },
  {
    name: 'Invalid Input - Missing Required Fields',
    data: {
      user_id: 'test_user_005',
      source_id: 'form_submission',
      lead_data: {
        first_name: 'Test',
        company: 'Test Company'
        // Missing email and phone
      }
    },
    expectError: true
  }
];

async function testDuplicatePrevention() {
  console.log('🔍 Testing Duplicate Prevention Webhook');
  console.log('=' .repeat(50));
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Test: ${testCase.name}`);
    console.log('Input:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await axios.post(WEBHOOK_URL, testCase.data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('✅ Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      
      if (testCase.expectedAction && response.data.action_taken) {
        const actionMatch = response.data.action_taken === testCase.expectedAction;
        console.log(`${actionMatch ? '✅' : '❌'} Expected action: ${testCase.expectedAction}, Got: ${response.data.action_taken}`);
      }
      
      // Validate response structure
      const requiredFields = ['success', 'duplicate_check_complete', 'action_taken', 'duplicate_found'];
      const missingFields = requiredFields.filter(field => !(field in response.data));
      
      if (missingFields.length === 0) {
        console.log('✅ Response structure is valid');
      } else {
        console.log('❌ Missing fields:', missingFields);
      }
      
    } catch (error) {
      if (testCase.expectError) {
        console.log('✅ Expected error occurred:', error.response?.data?.message || error.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
          console.log('💡 Hint: The webhook might not be active. Please activate it in the n8n web interface.');
        }
      }
    }
    
    // Wait between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Test Summary');
  console.log('=' .repeat(30));
  console.log('If all tests passed, the duplicate prevention agent is working correctly!');
  console.log('If you got 404 errors, activate the workflow in the n8n web interface at:');
  console.log('http://localhost:5678');
  console.log('Username: admin');
  console.log('Password: (check .env file)');
}

// Performance test
async function performanceTest() {
  console.log('\n⚡ Performance Test');
  console.log('=' .repeat(30));
  
  const testData = {
    user_id: 'perf_test',
    source_id: 'performance_test',
    lead_data: {
      email: 'performance@test.com',
      phone: '+1-555-PERF-001',
      first_name: 'Performance',
      company: 'Test Corp'
    }
  };
  
  const startTime = Date.now();
  const concurrentRequests = 5;
  
  try {
    const promises = Array(concurrentRequests).fill().map(() => 
      axios.post(WEBHOOK_URL, testData, { timeout: 10000 })
    );
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`✅ ${concurrentRequests} concurrent requests completed`);
    console.log(`⏱️  Total time: ${endTime - startTime}ms`);
    console.log(`📊 Average response time: ${(endTime - startTime) / concurrentRequests}ms`);
    
    // Check if all responses are consistent
    const actions = responses.map(r => r.data.action_taken);
    const allSame = actions.every(action => action === actions[0]);
    console.log(`🔄 Consistent responses: ${allSame ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.log('❌ Performance test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  try {
    await testDuplicatePrevention();
    await performanceTest();
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

// Export for use as module or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testDuplicatePrevention, performanceTest };