#!/usr/bin/env node

/**
 * Test Apollo.io API integration
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config({ path: '.env.local' });

const APOLLO_API_KEY = process.env.APOLLO_API_KEY || 'zX2Fv6Tnnaued23HQngLew';

async function testApolloAPI() {
  console.log('🚀 Testing Apollo.io API Integration');
  console.log('===================================');
  
  try {
    console.log('🔑 Using API Key:', APOLLO_API_KEY.substring(0, 8) + '...');
    
    // Test Apollo API with real request
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify({
        q_person_titles: ['CEO', 'CTO', 'VP Sales'],
        q_organization_locations: ['United States'],
        q_organization_num_employees_ranges: ['11-50', '51-200'],
        page_size: 5,
        person_locations: ['United States'],
        q_organization_keywords: ['SaaS', 'Software', 'Technology']
      })
    });

    console.log('📡 API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apollo API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Apollo API Working!');
    console.log(`📊 Found ${data.people?.length || 0} leads`);
    console.log(`💰 Credits Remaining: ${data.pagination?.total_entries || 'Unknown'}`);
    
    if (data.people && data.people.length > 0) {
      const lead = data.people[0];
      console.log('\n📋 Sample Lead:');
      console.log(`  Name: ${lead.first_name} ${lead.last_name}`);
      console.log(`  Email: ${lead.email || 'N/A'}`);
      console.log(`  Company: ${lead.organization?.name || 'N/A'}`);
      console.log(`  Title: ${lead.title || 'N/A'}`);
      console.log(`  LinkedIn: ${lead.linkedin_url || 'N/A'}`);
    }
    
    return {
      success: true,
      leads: data.people?.length || 0,
      data: data.people
    };
    
  } catch (error) {
    console.error('❌ Apollo API Test Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test
testApolloAPI().then(result => {
  if (result.success) {
    console.log('\n🎉 Apollo API Integration: WORKING ✅');
  } else {
    console.log('\n💥 Apollo API Integration: FAILED ❌');
    process.exit(1);
  }
}).catch(console.error);