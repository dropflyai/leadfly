#!/usr/bin/env node

/**
 * Mock Lead Generation System
 * For testing when API keys are limited
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fetch from 'node-fetch';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock lead data pool
const MOCK_LEADS = [
  {
    first_name: "Sarah",
    last_name: "Chen",
    email: "sarah.chen@techflow.com",
    phone: "+1-555-0123",
    linkedin_url: "https://linkedin.com/in/sarahchen",
    company_name: "TechFlow Solutions",
    company_website: "https://techflow.com",
    company_domain: "techflow.com",
    industry: "Software",
    company_size: "51-200",
    job_title: "VP of Marketing",
    seniority_level: "VP",
    department: "Marketing",
    location: "San Francisco, CA"
  },
  {
    first_name: "Marcus",
    last_name: "Williams",
    email: "marcus@growthscale.io",
    phone: "+1-555-0234",
    linkedin_url: "https://linkedin.com/in/marcuswilliams",
    company_name: "GrowthScale",
    company_website: "https://growthscale.io",
    company_domain: "growthscale.io",
    industry: "Marketing Technology",
    company_size: "11-50",
    job_title: "Chief Revenue Officer",
    seniority_level: "C-Level",
    department: "Sales",
    location: "Austin, TX"
  },
  {
    first_name: "Lisa",
    last_name: "Rodriguez",
    email: "lisa.rodriguez@revenuelabs.com",
    phone: "+1-555-0345",
    linkedin_url: "https://linkedin.com/in/lisarodriguez",
    company_name: "Revenue Labs",
    company_website: "https://revenuelabs.com",
    company_domain: "revenuelabs.com",
    industry: "Business Services",
    company_size: "201-500",
    job_title: "Head of Sales Operations",
    seniority_level: "Director",
    department: "Sales",
    location: "New York, NY"
  },
  {
    first_name: "David",
    last_name: "Kim",
    email: "david.kim@innovatecorp.com",
    phone: "+1-555-0456",
    linkedin_url: "https://linkedin.com/in/davidkim",
    company_name: "Innovate Corp",
    company_website: "https://innovatecorp.com",
    company_domain: "innovatecorp.com",
    industry: "Technology",
    company_size: "501-1000",
    job_title: "CEO",
    seniority_level: "C-Level",
    department: "Executive",
    location: "Seattle, WA"
  },
  {
    first_name: "Jennifer",
    last_name: "Thompson",
    email: "jennifer@scaletechsolutions.com",
    phone: "+1-555-0567",
    linkedin_url: "https://linkedin.com/in/jenniferthompson",
    company_name: "ScaleTech Solutions",
    company_website: "https://scaletechsolutions.com",
    company_domain: "scaletechsolutions.com",
    industry: "SaaS",
    company_size: "51-200",
    job_title: "VP Sales",
    seniority_level: "VP",
    department: "Sales",
    location: "Boston, MA"
  },
  {
    first_name: "Michael",
    last_name: "Chang",
    email: "michael.chang@digitaldynamics.io",
    phone: "+1-555-0678",
    linkedin_url: "https://linkedin.com/in/michaelchang",
    company_name: "Digital Dynamics",
    company_website: "https://digitaldynamics.io",
    company_domain: "digitaldynamics.io",
    industry: "Digital Marketing",
    company_size: "11-50",
    job_title: "Director of Business Development",
    seniority_level: "Director",
    department: "Business Development",
    location: "Los Angeles, CA"
  }
];

/**
 * Generate AI lead score using Deepseek
 */
async function calculateAIScore(leadData) {
  try {
    const prompt = `
Analyze this lead and give a score from 1-100 based on:
- Job title seniority (C-Level = 90+, VP = 80+, Director = 70+)
- Company size (larger = higher score)
- Industry relevance for B2B software/SaaS
- Contact completeness

Lead: ${leadData.first_name} ${leadData.last_name}
Title: ${leadData.job_title}
Company: ${leadData.company_name}
Industry: ${leadData.industry}
Size: ${leadData.company_size}

Respond with just a number between 1-100.
`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error('Deepseek API error:', response.status);
      return calculateFallbackScore(leadData);
    }

    const data = await response.json();
    const scoreText = data.choices?.[0]?.message?.content?.trim();
    const score = parseInt(scoreText) || calculateFallbackScore(leadData);

    return Math.min(Math.max(score, 1), 100);
    
  } catch (error) {
    console.error('AI scoring error:', error);
    return calculateFallbackScore(leadData);
  }
}

/**
 * Fallback scoring algorithm when AI is unavailable
 */
function calculateFallbackScore(leadData) {
  let score = 50; // Base score
  
  // Seniority bonus
  if (leadData.seniority_level === 'C-Level') score += 40;
  else if (leadData.seniority_level === 'VP') score += 30;
  else if (leadData.seniority_level === 'Director') score += 20;
  
  // Company size bonus
  if (leadData.company_size === '501-1000') score += 15;
  else if (leadData.company_size === '201-500') score += 10;
  else if (leadData.company_size === '51-200') score += 5;
  
  // Industry relevance
  const techIndustries = ['Software', 'SaaS', 'Technology', 'Marketing Technology'];
  if (techIndustries.includes(leadData.industry)) score += 10;
  
  // Contact completeness
  if (leadData.email && leadData.phone && leadData.linkedin_url) score += 5;
  
  return Math.min(Math.max(score, 1), 100);
}

/**
 * Generate mock leads based on criteria
 */
export async function generateMockLeads(userId, criteria, count = 25) {
  try {
    console.log(`🎭 Generating ${count} mock leads for user ${userId}...`);
    
    // Check user permissions
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        leads_used_this_period,
        subscription_tiers (monthly_leads)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const limit = subscription?.subscription_tiers?.monthly_leads || 25;
    const used = subscription?.leads_used_this_period || 0;
    const remaining = limit - used;

    if (count > remaining) {
      throw new Error(`Lead limit exceeded. Requested: ${count}, Remaining: ${remaining}`);
    }

    // Generate leads with some randomization
    const selectedLeads = [];
    const shuffled = [...MOCK_LEADS].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const baseLead = shuffled[i % shuffled.length];
      
      // Add some variation to avoid exact duplicates
      const lead = {
        ...baseLead,
        user_id: userId,
        source: 'mock_generator',
        cost: 0.01, // Mock cost
        lead_score: await calculateAIScore(baseLead),
        created_at: new Date().toISOString(),
        // Add slight variations for multiple leads
        email: i > 0 ? baseLead.email.replace('@', `+${i}@`) : baseLead.email,
        raw_data: { mock: true, variation: i }
      };
      
      selectedLeads.push(lead);
    }

    // Store in Supabase
    const { data: storedLeads, error } = await supabase
      .from('leads')
      .insert(selectedLeads)
      .select();

    if (error) throw error;

    // Update usage tracking
    await supabase
      .from('user_subscriptions')
      .update({
        leads_used_this_period: used + storedLeads.length
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    const highValueLeads = storedLeads.filter(lead => lead.lead_score >= 80);

    return {
      success: true,
      leads: storedLeads,
      count: storedLeads.length,
      high_value_count: highValueLeads.length,
      remaining_leads: remaining - storedLeads.length,
      cost_breakdown: {
        mock_cost: storedLeads.length * 0.01,
        ai_processing_cost: storedLeads.length * 0.05,
        total_cost: storedLeads.length * 0.06
      }
    };

  } catch (error) {
    console.error('Mock lead generation error:', error);
    return {
      success: false,
      error: error.message,
      leads: [],
      count: 0
    };
  }
}

/**
 * Test mock lead generation system
 */
export async function testMockSystem() {
  console.log('🎭 Testing Mock Lead Generation System');
  console.log('====================================');
  
  const testUserId = '00000000-0000-0000-0000-000000000000';
  const testCriteria = {
    job_titles: ['CEO', 'VP Sales', 'CTO'],
    industries: ['Software', 'SaaS', 'Technology'],
    company_sizes: ['11-50', '51-200']
  };
  
  try {
    const result = await generateMockLeads(testUserId, testCriteria, 5);
    
    if (result.success) {
      console.log('✅ Mock lead generation successful!');
      console.log(`📊 Generated ${result.count} leads`);
      console.log(`🔥 High-value leads: ${result.high_value_count}`);
      console.log(`💰 Total cost: $${result.cost_breakdown.total_cost.toFixed(4)}`);
      
      // Show sample lead
      if (result.leads.length > 0) {
        const lead = result.leads[0];
        console.log('\n📋 Sample Lead:');
        console.log(`  Name: ${lead.first_name} ${lead.last_name}`);
        console.log(`  Score: ${lead.lead_score}/100`);
        console.log(`  Company: ${lead.company_name}`);
        console.log(`  Title: ${lead.job_title}`);
      }
      
      return true;
    } else {
      console.log('❌ Mock lead generation failed:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Export for use in main API
export default {
  generateMockLeads,
  testMockSystem,
  calculateAIScore,
  MOCK_LEADS
};