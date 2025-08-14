/**
 * Enhanced Apollo.io Integration
 * Handles both free tier limitations and paid tier capabilities
 */
import { LocalStorage } from './local-storage-system.js';

/**
 * Apollo.io Lead Generation with Smart Fallback
 * - Uses real Apollo API for paid accounts
 * - Falls back to enhanced mock data for free accounts
 * - Includes lead enrichment capabilities
 */
export async function generateApolloLeads(userId, criteria, count = 25) {
  // Check user subscription first
  const subscriptions = LocalStorage.getSubscriptions(userId);
  const userSub = subscriptions.find(sub => sub.status === 'active');
  
  if (!userSub) {
    return {
      success: false,
      error: 'No active subscription found',
      leads: [],
      count: 0
    };
  }

  const remaining = userSub.monthly_leads - userSub.leads_used_this_period;
  if (count > remaining) {
    return {
      success: false,
      error: `Lead limit exceeded. Requested: ${count}, Remaining: ${remaining}`,
      leads: [],
      count: 0
    };
  }

  const apolloApiKey = process.env.APOLLO_API_KEY;
  
  if (!apolloApiKey) {
    console.log('⚠️ No Apollo API key, using enhanced mock data');
    return generateEnhancedMockLeads(userId, criteria, count);
  }

  try {
    console.log('🚀 Attempting Apollo.io API call...');
    
    // Try Apollo.io API first
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apolloApiKey
      },
      body: JSON.stringify({
        q_job_titles: criteria.job_titles || ['CEO', 'VP Sales'],
        q_organization_industries: criteria.industries || ['Software', 'SaaS'],
        q_organization_num_employees_ranges: criteria.company_sizes || ['11,50', '51,200'],
        page: 1,
        per_page: Math.min(count, 25)
      })
    });

    const data = await response.json();

    if (response.ok && data.people && data.people.length > 0) {
      console.log(`✅ Apollo.io returned ${data.people.length} leads`);
      
      // Convert Apollo format to our format
      const formattedLeads = data.people.map((person, index) => ({
        id: `apollo_${Date.now()}_${index + 1}`,
        user_id: userId,
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        phone: person.phone_numbers?.[0]?.sanitized_number || null,
        company_name: person.organization?.name,
        job_title: person.title,
        industry: person.organization?.industry,
        company_size: person.organization?.estimated_num_employees_range,
        lead_score: calculateLeadScore(person),
        source: 'apollo_api',
        created_at: new Date().toISOString(),
        linkedin_url: person.linkedin_url,
        company_website: person.organization?.website_url,
        location: `${person.city || ''} ${person.state || ''}`.trim(),
        seniority: person.seniority
      }));

      // Store leads in local system
      const storedLeads = LocalStorage.addLeads(formattedLeads);
      
      // Update subscription usage
      LocalStorage.updateSubscription(userId, {
        leads_used_this_period: userSub.leads_used_this_period + storedLeads.length
      });

      const highValueLeads = storedLeads.filter(lead => lead.lead_score >= 80);

      return {
        success: true,
        leads: storedLeads,
        count: storedLeads.length,
        high_value_count: highValueLeads.length,
        remaining_leads: remaining - storedLeads.length,
        source: 'apollo_api',
        storage: 'local'
      };
    } else if (data.error_code === 'API_INACCESSIBLE') {
      console.log('⚠️ Apollo free plan limitation, using enhanced mock data');
      return generateEnhancedMockLeads(userId, criteria, count, true);
    } else {
      throw new Error(data.error || 'Apollo API error');
    }

  } catch (error) {
    console.log(`⚠️ Apollo API failed: ${error.message}, using enhanced mock data`);
    return generateEnhancedMockLeads(userId, criteria, count, true);
  }
}

/**
 * Generate enhanced mock leads that closely resemble real Apollo data
 */
export function generateEnhancedMockLeads(userId, criteria, count = 25, isApiFallback = false) {
  console.log(`🎭 Generating ${count} enhanced mock leads${isApiFallback ? ' (Apollo API fallback)' : ''}...`);

  const leads = [];
  
  // More realistic data pools
  const firstNames = [
    "Sarah", "Michael", "Lisa", "David", "Jennifer", "Robert", "Amanda", "Christopher", 
    "Jessica", "Matthew", "Ashley", "Daniel", "Emily", "Andrew", "Melissa", "Joshua",
    "Michelle", "Mark", "Kimberly", "Steven", "Amy", "Kevin", "Angela", "Brian", "Helen",
    "Jason", "Nicole", "Ryan", "Rebecca", "Jacob", "Laura", "Nicholas", "Stephanie",
    "Anthony", "Samantha", "William", "Rachel", "Jonathan", "Catherine", "Justin"
  ];

  const lastNames = [
    "Johnson", "Chen", "Rodriguez", "Williams", "Davis", "Miller", "Wilson", "Moore",
    "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson",
    "Garcia", "Martinez", "Robinson", "Clark", "Lewis", "Lee", "Walker", "Hall", "Allen",
    "Young", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker",
    "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips"
  ];

  // Industry-specific companies
  const companiesByIndustry = {
    "Software": [
      "TechCorp Solutions", "CodeCraft Inc", "Digital Dynamics", "SoftwareFirst", "DevStream",
      "CloudBridge Tech", "InnovateCode", "TechFlow Solutions", "ByteForce", "PixelPerfect"
    ],
    "SaaS": [
      "CloudFirst", "SaaS Innovations", "StreamlineHQ", "ScaleTech", "AutomateNow",
      "DataDriven SaaS", "WorkflowPro", "CloudStream", "SaaS Masters", "FlowTech"
    ],
    "Marketing Agency": [
      "MarketBoost", "GrowthHackers", "BrandBuilders", "MarketingMagic", "LeadGen Pro",
      "Digital Growth", "Campaign Masters", "Marketing Dynamics", "Growth Catalyst", "BrandForge"
    ],
    "Consulting": [
      "Strategic Advisors", "Growth Consultants", "Business Builders", "Excellence Partners",
      "Strategic Solutions", "Advisory Group", "Growth Partners", "Strategic Dynamics"
    ],
    "Technology": [
      "Tech Innovators", "Future Systems", "Digital Solutions", "TechAdvance", "Innovation Labs",
      "TechFlow", "Digital Future", "SystemCraft", "TechVision", "Innovation Hub"
    ]
  };

  const jobTitles = criteria.job_titles || [
    "CEO", "VP Sales", "VP Marketing", "Director of Sales", "Chief Marketing Officer",
    "Head of Growth", "Chief Revenue Officer", "Sales Director", "Marketing Director",
    "Business Development Director", "VP of Business Development", "Chief Growth Officer"
  ];

  const industries = criteria.industries || ["Software", "SaaS", "Marketing Agency", "Technology", "Consulting"];
  const companySizes = criteria.company_sizes || ["11-50", "51-200", "201-500"];
  
  // Generate realistic phone numbers by area
  const areaCodes = ["415", "650", "408", "510", "925", "949", "714", "562", "818", "323"];

  for (let i = 0; i < Math.min(count, 50); i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const companies = companiesByIndustry[industry] || companiesByIndustry["Technology"];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const companySize = companySizes[Math.floor(Math.random() * companySizes.length)];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    
    // Generate realistic email domains
    const emailDomain = company.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '') + '.com';
    
    // Calculate realistic lead score based on job title and company size
    let baseScore = 70;
    if (jobTitle.includes('CEO') || jobTitle.includes('Chief')) baseScore += 15;
    if (jobTitle.includes('VP') || jobTitle.includes('Vice President')) baseScore += 10;
    if (jobTitle.includes('Director')) baseScore += 8;
    if (jobTitle.includes('Head')) baseScore += 6;
    
    // Company size influence
    if (companySize === "201-500") baseScore += 5;
    if (companySize === "51-200") baseScore += 3;
    
    const leadScore = Math.min(100, baseScore + Math.floor(Math.random() * 10));

    leads.push({
      id: `enhanced_${Date.now()}_${i + 1}`,
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
      phone: `+1-${areaCode}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      company_name: company,
      job_title: jobTitle,
      industry: industry,
      company_size: companySize,
      lead_score: leadScore,
      source: isApiFallback ? 'enhanced_mock_apollo_fallback' : 'enhanced_mock',
      created_at: new Date().toISOString(),
      linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      company_website: `https://${emailDomain}`,
      location: getRandomLocation(),
      seniority: getSeniorityFromTitle(jobTitle),
      // Add Apollo-like additional fields
      person_id: `enhanced_person_${Date.now()}_${i}`,
      organization_id: `enhanced_org_${Date.now()}_${i}`,
      contact_stage_id: Math.floor(Math.random() * 5) + 1
    });
  }

  // Store leads in local system
  const storedLeads = LocalStorage.addLeads(leads);
  
  // Update subscription usage
  const subscriptions = LocalStorage.getSubscriptions(userId);
  const userSub = subscriptions.find(sub => sub.status === 'active');
  if (userSub) {
    LocalStorage.updateSubscription(userId, {
      leads_used_this_period: userSub.leads_used_this_period + storedLeads.length
    });
  }

  const highValueLeads = storedLeads.filter(lead => lead.lead_score >= 80);

  return {
    success: true,
    leads: storedLeads,
    count: storedLeads.length,
    high_value_count: highValueLeads.length,
    remaining_leads: userSub ? (userSub.monthly_leads - userSub.leads_used_this_period - storedLeads.length) : 0,
    source: isApiFallback ? 'enhanced_mock_apollo_fallback' : 'enhanced_mock',
    storage: 'local'
  };
}

/**
 * Calculate lead score based on Apollo data
 */
function calculateLeadScore(person) {
  let score = 60;
  
  // Job title scoring
  const title = person.title?.toLowerCase() || '';
  if (title.includes('ceo') || title.includes('chief')) score += 20;
  else if (title.includes('vp') || title.includes('vice president')) score += 15;
  else if (title.includes('director')) score += 12;
  else if (title.includes('head') || title.includes('lead')) score += 10;
  else if (title.includes('manager')) score += 8;
  
  // Company size
  const employees = person.organization?.estimated_num_employees;
  if (employees > 200) score += 10;
  else if (employees > 50) score += 8;
  else if (employees > 10) score += 5;
  
  // Contact info completeness
  if (person.email) score += 5;
  if (person.phone_numbers?.length > 0) score += 5;
  if (person.linkedin_url) score += 3;
  
  return Math.min(100, Math.max(50, score));
}

/**
 * Generate random locations
 */
function getRandomLocation() {
  const locations = [
    "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA",
    "Los Angeles, CA", "Chicago, IL", "Denver, CO", "Atlanta, GA", "Miami, FL",
    "Portland, OR", "Nashville, TN", "Raleigh, NC", "San Diego, CA", "Phoenix, AZ"
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

/**
 * Determine seniority from job title
 */
function getSeniorityFromTitle(title) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('ceo') || titleLower.includes('chief') || titleLower.includes('president')) {
    return 'c_suite';
  } else if (titleLower.includes('vp') || titleLower.includes('vice')) {
    return 'vp';
  } else if (titleLower.includes('director')) {
    return 'director';
  } else if (titleLower.includes('head') || titleLower.includes('lead')) {
    return 'head';
  } else if (titleLower.includes('manager')) {
    return 'manager';
  } else {
    return 'individual_contributor';
  }
}

export default {
  generateApolloLeads,
  generateEnhancedMockLeads,
  calculateLeadScore
};