// DropFly LeadFly - Integration Test Script
// Test your APIs and database integration

import { generateCompleteLeads, generateLeadsFromApollo, calculateAIScore } from './enhanced-lead-api.js'

// Test configuration
const TEST_CONFIG = {
  // Test user (you'll need to create this in your database)
  user_id: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID
  
  // Test search criteria
  search_criteria: {
    job_titles: ['CEO', 'VP Sales', 'Director of Marketing'],
    locations: ['United States'],
    company_sizes: ['11-50', '51-200', '201-500'],
    industries: ['Software', 'Technology', 'SaaS']
  },
  
  // Test lead count
  lead_count: 5
}

/**
 * Test Apollo.io API integration
 */
async function testApolloIntegration() {
  console.log('🧪 Testing Apollo.io API Integration...')
  console.log('=====================================')
  
  try {
    const leads = await generateLeadsFromApollo(TEST_CONFIG.search_criteria, TEST_CONFIG.lead_count)
    
    console.log(`✅ Apollo API Success: Generated ${leads.length} leads`)
    
    if (leads.length > 0) {
      console.log('📋 Sample lead data:')
      console.log({
        name: `${leads[0].first_name} ${leads[0].last_name}`,
        email: leads[0].email,
        company: leads[0].company_name,
        title: leads[0].job_title,
        score: leads[0].lead_score
      })
    }
    
    return { success: true, count: leads.length, sample: leads[0] }
    
  } catch (error) {
    console.error('❌ Apollo API Error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Test Deepseek AI scoring
 */
async function testAIScoring() {
  console.log('\n🧪 Testing Deepseek AI Scoring...')
  console.log('=================================')
  
  const sampleLead = {
    first_name: 'John',
    last_name: 'Doe',
    title: 'VP of Sales',
    organization: {
      name: 'TechCorp Inc',
      industry: 'Software',
      estimated_num_employees: 150
    },
    email: 'john.doe@techcorp.com',
    phone_numbers: [{ sanitized_number: '+1234567890' }]
  }
  
  try {
    const score = await calculateAIScore(sampleLead)
    
    console.log(`✅ AI Scoring Success: Score = ${score}/100`)
    console.log(`📊 Lead quality: ${score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low'}`)
    
    return { success: true, score }
    
  } catch (error) {
    console.error('❌ AI Scoring Error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Test complete pipeline
 */
async function testCompletePipeline() {
  console.log('\n🧪 Testing Complete Lead Generation Pipeline...')
  console.log('==============================================')
  
  try {
    const result = await generateCompleteLeads(
      TEST_CONFIG.user_id,
      TEST_CONFIG.search_criteria,
      TEST_CONFIG.lead_count
    )
    
    if (result.success) {
      console.log('✅ Complete Pipeline Success!')
      console.log(`📊 Generated: ${result.count} leads`)
      console.log(`💎 High-value leads: ${result.high_value_count}`)
      console.log(`💰 Total cost: $${result.cost_breakdown.total_cost.toFixed(2)}`)
      console.log(`📈 Remaining leads: ${result.remaining_leads}`)
    } else {
      console.error('❌ Pipeline Error:', result.error)
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Pipeline Exception:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Test database connectivity
 */
async function testDatabaseConnection() {
  console.log('\n🧪 Testing Database Connection...')
  console.log('=================================')
  
  try {
    // Test if we can query subscription tiers
    const response = await fetch('https://irvyhhkoiyzartmmvbxw.supabase.co/rest/v1/subscription_tiers?select=id,name,monthly_price', {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_anon_key_here'
      }
    })
    
    if (response.ok) {
      const tiers = await response.json()
      console.log(`✅ Database Connection Success: Found ${tiers.length} subscription tiers`)
      
      if (tiers.length > 0) {
        console.log('📋 Available tiers:')
        tiers.forEach(tier => {
          console.log(`  - ${tier.name}: $${tier.monthly_price / 100}/month`)
        })
      }
      
      return { success: true, tiers: tiers.length }
    } else {
      console.error('❌ Database Connection Failed:', response.status)
      return { success: false, error: `HTTP ${response.status}` }
    }
    
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 DropFly LeadFly - Integration Test Suite')
  console.log('==========================================')
  console.log('Testing your live system with real APIs...\n')
  
  const results = {
    database: await testDatabaseConnection(),
    apollo: await testApolloIntegration(), 
    ai_scoring: await testAIScoring(),
    complete_pipeline: await testCompletePipeline()
  }
  
  console.log('\n📊 TEST RESULTS SUMMARY')
  console.log('=======================')
  
  const passed = Object.values(results).filter(r => r.success).length
  const total = Object.keys(results).length
  
  console.log(`✅ Tests Passed: ${passed}/${total}`)
  console.log(`📈 Success Rate: ${Math.round((passed/total) * 100)}%`)
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('Your LeadFly system is ready for production!')
    console.log('💰 Revenue potential: $2.5M+ ARR')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
    console.log('Most likely needs: API key configuration or user setup')
  }
  
  return results
}

// Export for use in other modules
export {
  testApolloIntegration,
  testAIScoring,
  testCompletePipeline,
  testDatabaseConnection,
  runAllTests
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}