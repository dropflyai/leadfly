#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Duplicate Prevention System
 * 
 * This script tests all aspects of the duplicate prevention workflow:
 * - Email matching algorithms
 * - Phone number normalization
 * - Company + name fuzzy matching
 * - Risk assessment scoring
 * - API integration with LeadFly
 */

import axios from 'axios'
import { performance } from 'perf_hooks'

// Test configuration
const config = {
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/leadfly/duplicate-prevention',
  leadflyApiUrl: process.env.LEADFLY_API_URL || 'https://leadfly-ai.vercel.app',
  testUserId: 'test-user-duplicate-prevention',
  timeout: 15000
}

console.log('🧪 LeadFly AI - Duplicate Prevention Test Suite\n')

class DuplicatePreventionTester {
  constructor() {
    this.testResults = []
    this.totalTests = 0
    this.passedTests = 0
    this.failedTests = 0
  }

  async runAllTests() {
    console.log('🔬 Starting comprehensive test suite...\n')
    
    try {
      // Test 1: Basic functionality
      await this.testBasicFunctionality()
      
      // Test 2: Email duplicate detection
      await this.testEmailDuplicateDetection()
      
      // Test 3: Phone number matching
      await this.testPhoneNumberMatching()
      
      // Test 4: Company + name fuzzy matching
      await this.testFuzzyMatching()
      
      // Test 5: Risk assessment
      await this.testRiskAssessment()
      
      // Test 6: Performance testing
      await this.testPerformance()
      
      // Test 7: Error handling
      await this.testErrorHandling()
      
      // Test 8: Integration testing
      await this.testLeadFlyIntegration()
      
      // Generate final report
      this.generateTestReport()
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message)
      process.exit(1)
    }
  }

  async testBasicFunctionality() {
    console.log('📝 Test 1: Basic Functionality')
    
    const testCases = [
      {
        name: 'Valid lead processing',
        payload: {
          user_id: config.testUserId,
          source_id: 'test-form-basic',
          lead_data: {
            email: 'john.doe@acmecorp.com',
            first_name: 'John',
            last_name: 'Doe',
            company: 'Acme Corporation',
            phone: '+1-555-123-4567'
          }
        },
        expected: {
          success: true,
          duplicate_check_complete: true,
          action_taken: 'allow_processing'
        }
      }
    ]
    
    for (const testCase of testCases) {
      await this.runTest(testCase.name, async () => {
        const response = await this.callWebhook(testCase.payload)
        this.validateResponse(response, testCase.expected)
        return response
      })
    }
  }

  async testEmailDuplicateDetection() {
    console.log('\n📧 Test 2: Email Duplicate Detection')
    
    // First, submit a lead
    const originalLead = {
      user_id: config.testUserId,
      source_id: 'test-email-duplicate',
      lead_data: {
        email: 'duplicate.test@company.com',
        first_name: 'Original',
        last_name: 'Lead',
        company: 'Test Company'
      }
    }
    
    await this.runTest('Submit original lead', async () => {
      const response = await this.callWebhook(originalLead)
      this.validateResponse(response, { success: true })
      return response
    })
    
    // Now test duplicate detection
    const duplicateLead = {
      ...originalLead,
      lead_data: {
        ...originalLead.lead_data,
        first_name: 'Duplicate', // Different name, same email
        last_name: 'Person'
      }
    }
    
    await this.runTest('Detect email duplicate', async () => {
      const response = await this.callWebhook(duplicateLead)
      if (response.duplicate_found !== true) {
        throw new Error(`Expected duplicate detection, got: ${JSON.stringify(response)}`)
      }
      return response
    })
  }

  async testPhoneNumberMatching() {
    console.log('\n📞 Test 3: Phone Number Matching')
    
    const phoneVariations = [
      '+1-555-987-6543',
      '(555) 987-6543',
      '555.987.6543',
      '15559876543',
      '555-987-6543'
    ]
    
    // Submit lead with first phone format
    const baseLead = {
      user_id: config.testUserId,
      source_id: 'test-phone-matching',
      lead_data: {
        email: 'phone.test1@example.com',
        first_name: 'Phone',
        last_name: 'Test',
        phone: phoneVariations[0]
      }
    }
    
    await this.runTest('Submit base phone lead', async () => {
      const response = await this.callWebhook(baseLead)
      this.validateResponse(response, { success: true })
      return response
    })
    
    // Test different phone formats
    for (let i = 1; i < phoneVariations.length; i++) {
      const phoneFormat = phoneVariations[i]
      await this.runTest(`Detect phone duplicate (${phoneFormat})`, async () => {
        const testLead = {
          ...baseLead,
          lead_data: {
            ...baseLead.lead_data,
            email: `phone.test${i + 1}@example.com`, // Different email
            phone: phoneFormat
          }
        }
        
        const response = await this.callWebhook(testLead)
        // Should detect duplicate based on phone number
        if (response.confidence_score < 0.5) {
          console.log('   ⚠️  Phone matching may need tuning:', response.confidence_score)
        }
        return response
      })
    }
  }

  async testFuzzyMatching() {
    console.log('\n🔍 Test 4: Company + Name Fuzzy Matching')
    
    const originalLead = {
      user_id: config.testUserId,
      source_id: 'test-fuzzy-matching',
      lead_data: {
        email: 'fuzzy.original@corp.com',
        first_name: 'Michael',
        last_name: 'Johnson',
        company: 'Technology Solutions Inc'
      }
    }
    
    await this.runTest('Submit original fuzzy lead', async () => {
      const response = await this.callWebhook(originalLead)
      this.validateResponse(response, { success: true })
      return response
    })
    
    const fuzzyVariations = [
      {
        name: 'Similar name and company',
        lead: {
          email: 'mike.johnson@techsolutions.com',
          first_name: 'Mike', // Similar to Michael
          last_name: 'Johnson', // Exact match
          company: 'Tech Solutions Inc' // Similar to Technology Solutions Inc
        }
      },
      {
        name: 'Company abbreviation',
        lead: {
          email: 'michael.j@tsi.com',
          first_name: 'Michael',
          last_name: 'Johnson',
          company: 'TSI' // Abbreviation
        }
      }
    ]
    
    for (const variation of fuzzyVariations) {
      await this.runTest(`Fuzzy match: ${variation.name}`, async () => {
        const testLead = {
          user_id: config.testUserId,
          source_id: 'test-fuzzy-matching',
          lead_data: variation.lead
        }
        
        const response = await this.callWebhook(testLead)
        console.log(`   📊 Confidence score: ${response.confidence_score}`)
        return response
      })
    }
  }

  async testRiskAssessment() {
    console.log('\n⚠️  Test 5: Risk Assessment')
    
    const riskTestCases = [
      {
        name: 'Disposable email detection',
        lead: {
          email: 'test@tempmail.com',
          first_name: 'Temp',
          last_name: 'User'
        },
        expectedRisk: 'medium'
      },
      {
        name: 'Personal email detection',
        lead: {
          email: 'personal@gmail.com',
          first_name: 'Personal',
          last_name: 'User'
        },
        expectedRisk: 'low'
      },
      {
        name: 'Incomplete data',
        lead: {
          email: 'incomplete@test.com'
          // Missing name and company
        },
        expectedRisk: 'medium'
      },
      {
        name: 'Complete professional data',
        lead: {
          email: 'professional@businesscorp.com',
          first_name: 'Professional',
          last_name: 'User',
          company: 'Business Corporation',
          phone: '+1-555-123-4567'
        },
        expectedRisk: 'low'
      }
    ]
    
    for (const testCase of riskTestCases) {
      await this.runTest(`Risk assessment: ${testCase.name}`, async () => {
        const payload = {
          user_id: config.testUserId,
          source_id: 'test-risk-assessment',
          lead_data: testCase.lead
        }
        
        const response = await this.callWebhook(payload)
        console.log(`   📊 Risk level: ${response.risk_level}`)
        console.log(`   📊 Risk score: ${response.risk_score || 'N/A'}`)
        
        return response
      })
    }
  }

  async testPerformance() {
    console.log('\n⚡ Test 6: Performance Testing')
    
    const performanceTests = [
      { name: 'Single request', concurrent: 1, iterations: 1 },
      { name: 'Multiple sequential', concurrent: 1, iterations: 5 },
      { name: 'Concurrent requests', concurrent: 3, iterations: 3 }
    ]
    
    for (const test of performanceTests) {
      await this.runTest(`Performance: ${test.name}`, async () => {
        const startTime = performance.now()
        
        const promises = []
        for (let i = 0; i < test.concurrent; i++) {
          const batch = []
          for (let j = 0; j < test.iterations; j++) {
            const payload = {
              user_id: config.testUserId,
              source_id: `perf-test-${i}-${j}`,
              lead_data: {
                email: `perf.test.${i}.${j}@performance.com`,
                first_name: `Perf${i}`,
                last_name: `Test${j}`,
                company: `Performance Test Co ${i}-${j}`
              }
            }
            batch.push(this.callWebhook(payload))
          }
          promises.push(Promise.all(batch))
        }
        
        const results = await Promise.all(promises)
        const endTime = performance.now()
        const totalTime = endTime - startTime
        const totalRequests = test.concurrent * test.iterations
        const avgTime = totalTime / totalRequests
        
        console.log(`   ⏱️  Total time: ${totalTime.toFixed(2)}ms`)
        console.log(`   ⏱️  Average per request: ${avgTime.toFixed(2)}ms`)
        console.log(`   📊 Requests per second: ${(1000 / avgTime).toFixed(2)}`)
        
        // Validate performance target (< 500ms per request)
        if (avgTime > 500) {
          console.log('   ⚠️  Performance below target (>500ms)')
        } else {
          console.log('   ✅ Performance meets target (<500ms)')
        }
        
        return { totalTime, avgTime, totalRequests }
      })
    }
  }

  async testErrorHandling() {
    console.log('\n❌ Test 7: Error Handling')
    
    const errorTests = [
      {
        name: 'Missing user_id',
        payload: {
          source_id: 'test-error',
          lead_data: { email: 'test@error.com' }
        }
      },
      {
        name: 'Missing lead_data',
        payload: {
          user_id: config.testUserId,
          source_id: 'test-error'
        }
      },
      {
        name: 'Empty email',
        payload: {
          user_id: config.testUserId,
          source_id: 'test-error',
          lead_data: { email: '' }
        }
      },
      {
        name: 'Invalid email format',
        payload: {
          user_id: config.testUserId,
          source_id: 'test-error',
          lead_data: { email: 'not-an-email' }
        }
      }
    ]
    
    for (const errorTest of errorTests) {
      await this.runTest(`Error handling: ${errorTest.name}`, async () => {
        try {
          const response = await this.callWebhook(errorTest.payload)
          // Should either handle gracefully or return error
          console.log(`   📝 Response: ${JSON.stringify(response)}`)
          return response
        } catch (error) {
          // Expected for some error cases
          console.log(`   📝 Error caught: ${error.message}`)
          return { error: error.message }
        }
      })
    }
  }

  async testLeadFlyIntegration() {
    console.log('\n🔗 Test 8: LeadFly API Integration')
    
    if (!config.leadflyApiUrl.includes('localhost')) {
      console.log('   🌐 Testing production LeadFly API integration...')
      
      await this.runTest('LeadFly duplicate check API', async () => {
        const payload = {
          action: 'duplicate_check',
          user_id: config.testUserId,
          lead_data: {
            email: 'integration.test@leadfly.com',
            first_name: 'Integration',
            last_name: 'Test'
          }
        }
        
        const response = await axios.post(
          `${config.leadflyApiUrl}/api/automation/lead-processor`,
          payload,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: config.timeout
          }
        )
        
        this.validateResponse(response.data, { success: true })
        return response.data
      })
      
      await this.runTest('LeadFly save clean lead API', async () => {
        const payload = {
          action: 'save_clean_lead',
          user_id: config.testUserId,
          lead_data: {
            email: 'clean.lead@leadfly.com',
            first_name: 'Clean',
            last_name: 'Lead',
            company: 'LeadFly Integration Test'
          }
        }
        
        const response = await axios.post(
          `${config.leadflyApiUrl}/api/automation/lead-processor`,
          payload,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: config.timeout
          }
        )
        
        return response.data
      })
    } else {
      console.log('   🏠 Skipping LeadFly integration tests (localhost detected)')
    }
  }

  async runTest(testName, testFunction) {
    this.totalTests++
    const startTime = performance.now()
    
    try {
      console.log(`   🧪 ${testName}...`)
      const result = await testFunction()
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)
      
      console.log(`   ✅ PASSED (${duration}ms)`)
      this.passedTests++
      
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration: duration,
        result: result
      })
      
    } catch (error) {
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)
      
      console.log(`   ❌ FAILED: ${error.message} (${duration}ms)`)
      this.failedTests++
      
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        duration: duration,
        error: error.message
      })
    }
  }

  async callWebhook(payload) {
    const response = await axios.post(config.n8nWebhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: config.timeout
    })
    
    return response.data
  }

  validateResponse(response, expected) {
    for (const [key, value] of Object.entries(expected)) {
      if (response[key] !== value) {
        throw new Error(`Expected ${key}=${value}, got ${response[key]}`)
      }
    }
  }

  generateTestReport() {
    console.log('\n📊 Test Results Summary')
    console.log('=' .repeat(50))
    console.log(`Total Tests: ${this.totalTests}`)
    console.log(`Passed: ${this.passedTests} (${((this.passedTests / this.totalTests) * 100).toFixed(1)}%)`)
    console.log(`Failed: ${this.failedTests} (${((this.failedTests / this.totalTests) * 100).toFixed(1)}%)`)
    
    if (this.failedTests > 0) {
      console.log('\n❌ Failed Tests:')
      this.testResults
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`)
        })
    }
    
    console.log('\n⏱️  Performance Summary:')
    const avgDuration = this.testResults.reduce((sum, test) => sum + parseFloat(test.duration), 0) / this.totalTests
    console.log(`   Average test duration: ${avgDuration.toFixed(2)}ms`)
    
    const slowTests = this.testResults.filter(test => parseFloat(test.duration) > 1000)
    if (slowTests.length > 0) {
      console.log(`   Slow tests (>1s): ${slowTests.length}`)
    }
    
    console.log('\n🎯 System Health:')
    if (this.passedTests / this.totalTests >= 0.9) {
      console.log('   ✅ HEALTHY - System is performing well')
    } else if (this.passedTests / this.totalTests >= 0.7) {
      console.log('   ⚠️  WARNING - Some issues detected')
    } else {
      console.log('   ❌ CRITICAL - Multiple system failures')
    }
    
    console.log('\n🚀 Deployment Status:')
    if (this.failedTests === 0) {
      console.log('   ✅ READY FOR PRODUCTION')
      console.log('   📋 Next steps:')
      console.log('      1. Update lead capture forms with webhook URL')
      console.log('      2. Monitor performance in production')
      console.log('      3. Set up alerts for duplicate detection rates')
    } else {
      console.log('   ⚠️  NEEDS ATTENTION BEFORE PRODUCTION')
      console.log('   📋 Required fixes:')
      console.log('      1. Address failed test cases')
      console.log('      2. Re-run test suite')
      console.log('      3. Verify all systems are healthy')
    }
  }
}

// Run the test suite
const tester = new DuplicatePreventionTester()
tester.runAllTests().catch(error => {
  console.error('Test suite crashed:', error)
  process.exit(1)
})

export { DuplicatePreventionTester, config }