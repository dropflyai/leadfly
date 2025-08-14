// DropFly LeadFly - Lead Generation API
// Main API for generating and managing leads with feature gates

import { createClient } from '@supabase/supabase-js'
import FeatureToggle, { FEATURES, requireFeature, requireLeadCapacity, updateLeadUsage, trackUsage } from './feature-toggle-api.js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// =============================================
// LEAD GENERATION PIPELINE
// =============================================

/**
 * Main lead generation function with feature gates
 * @param {string} userId - User UUID
 * @param {Object} criteria - Lead generation criteria
 * @param {number} count - Number of leads to generate
 * @returns {Object} - Generated leads and metadata
 */
export async function generateLeads(userId, criteria, count = 25) {
  try {
    // Check if user can generate leads
    const capacity = await FeatureToggle.canGenerateLeads(userId, count)
    if (!capacity.canGenerate) {
      throw new Error(`Lead limit exceeded. Used: ${capacity.used}/${capacity.limit}`)
    }

    // Check if user has basic lead table access
    const hasBasicAccess = await FeatureToggle.hasFeature(userId, FEATURES.BASIC_LEAD_TABLE)
    if (!hasBasicAccess) {
      throw new Error('Basic lead table access required')
    }

    // Get user's feature access for data enrichment
    const userFeatures = await FeatureToggle.hasFeatures(userId, [
      FEATURES.PRIORITY_QUALITY,
      FEATURES.CUSTOM_CRITERIA,
      FEATURES.PRIORITY_PROCESSING
    ])

    // Generate leads through multi-source pipeline
    const leads = await runLeadGenerationPipeline(userId, criteria, count, userFeatures)

    // Update usage tracking
    await updateLeadUsage(userId, leads.length)
    await trackUsage(userId, 'leads_generated', leads.length)

    return {
      success: true,
      leads,
      count: leads.length,
      remaining_leads: capacity.remaining - leads.length,
      features_used: userFeatures
    }

  } catch (error) {
    console.error('Lead generation error:', error)
    return {
      success: false,
      error: error.message,
      leads: [],
      count: 0
    }
  }
}

/**
 * Multi-source lead generation pipeline
 * @param {string} userId - User UUID
 * @param {Object} criteria - Search criteria
 * @param {number} count - Leads to generate
 * @param {Object} features - User's feature access
 * @returns {Array} - Generated leads
 */
async function runLeadGenerationPipeline(userId, criteria, count, features) {
  const leads = []
  const sources = getDataSources(features)

  // Generate leads from multiple sources
  for (const source of sources) {
    if (leads.length >= count) break

    const remaining = count - leads.length
    const sourceLeads = await generateFromSource(source, criteria, remaining, features)
    
    // Process and score leads
    const processedLeads = await processLeads(sourceLeads, userId, features)
    leads.push(...processedLeads)
  }

  // Final deduplication and ranking
  const uniqueLeads = deduplicateLeads(leads)
  const rankedLeads = rankLeadsByScore(uniqueLeads)

  return rankedLeads.slice(0, count)
}

/**
 * Get available data sources based on user features
 * @param {Object} features - User feature access
 * @returns {Array} - Available data sources
 */
function getDataSources(features) {
  const sources = [
    { id: 'apollo', name: 'Apollo.io', cost: 0.35, priority: 1 },
    { id: 'clay', name: 'Clay.com', cost: 0.14, priority: 2 },
    { id: 'clearbit', name: 'Clearbit', cost: 0.36, priority: 3 },
    { id: 'hunter', name: 'Hunter.io', cost: 0.10, priority: 4 },
    { id: 'audience_labs', name: 'Audience Labs', cost: 0.20, priority: 5 }
  ]

  // Priority customers get access to premium sources first
  if (features[FEATURES.PRIORITY_QUALITY]) {
    return sources.sort((a, b) => a.priority - b.priority)
  }

  // Standard customers use cost-effective sources
  return sources.sort((a, b) => a.cost - b.cost)
}

/**
 * Generate leads from specific source
 * @param {Object} source - Data source configuration
 * @param {Object} criteria - Search criteria
 * @param {number} count - Leads needed
 * @param {Object} features - User features
 * @returns {Array} - Raw leads from source
 */
async function generateFromSource(source, criteria, count, features) {
  try {
    switch (source.id) {
      case 'apollo':
        return await apolloSearch(criteria, count, features)
      case 'clay':
        return await clayEnrichment(criteria, count, features)
      case 'clearbit':
        return await clearbitSearch(criteria, count, features)
      case 'hunter':
        return await hunterSearch(criteria, count, features)
      case 'audience_labs':
        return await audienceLabsSearch(criteria, count, features)
      default:
        return []
    }
  } catch (error) {
    console.error(`Error generating from ${source.id}:`, error)
    return []
  }
}

// =============================================
// DATA SOURCE INTEGRATIONS
// =============================================

/**
 * Apollo.io API integration
 */
async function apolloSearch(criteria, count, features) {
  // Apollo API implementation
  const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': process.env.APOLLO_API_KEY
    },
    body: JSON.stringify({
      ...criteria,
      page_size: Math.min(count, 25),
      person_titles: criteria.job_titles,
      organization_locations: criteria.locations,
      organization_num_employees_ranges: criteria.company_sizes
    })
  })

  const data = await response.json()
  return data.people?.map(person => ({
    source: 'apollo',
    cost: 0.35,
    first_name: person.first_name,
    last_name: person.last_name,
    email: person.email,
    phone: person.phone_numbers?.[0]?.sanitized_number,
    linkedin_url: person.linkedin_url,
    company_name: person.organization?.name,
    company_website: person.organization?.website_url,
    industry: person.organization?.industry,
    job_title: person.title,
    seniority_level: person.seniority,
    raw_data: person
  })) || []
}

/**
 * Clay.com API integration
 */
async function clayEnrichment(criteria, count, features) {
  // Clay API implementation
  const response = await fetch('https://api.clay.com/v1/enrich', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CLAY_API_KEY}`
    },
    body: JSON.stringify({
      input: criteria,
      sources: ['apollo', 'clearbit', 'hunter', 'proxycurl', 'linkedin'],
      fallback_strategy: 'waterfall',
      quality_threshold: features[FEATURES.PRIORITY_QUALITY] ? 90 : 75,
      limit: count
    })
  })

  const data = await response.json()
  return data.results?.map(result => ({
    source: 'clay',
    cost: 0.14,
    ...result.enriched_data,
    raw_data: result
  })) || []
}

/**
 * Audience Labs integration
 */
async function audienceLabsSearch(criteria, count, features) {
  // Audience Labs API implementation
  // Note: This is a placeholder - actual API structure may vary
  const response = await fetch('https://api.audiencelabs.com/v1/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AUDIENCE_LABS_API_KEY}`
    },
    body: JSON.stringify({
      targeting_criteria: criteria,
      limit: count,
      include_behavioral_data: true,
      profile_depth: features[FEATURES.PRIORITY_QUALITY] ? 'deep' : 'standard'
    })
  })

  const data = await response.json()
  return data.profiles?.map(profile => ({
    source: 'audience_labs',
    cost: 0.20,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    company_name: profile.company,
    job_title: profile.title,
    behavioral_data: profile.behaviors,
    raw_data: profile
  })) || []
}

/**
 * Clearbit API integration
 */
async function clearbitSearch(criteria, count, features) {
  // Placeholder for Clearbit integration
  return []
}

/**
 * Hunter.io API integration
 */
async function hunterSearch(criteria, count, features) {
  // Placeholder for Hunter integration
  return []
}

// =============================================
// LEAD PROCESSING
// =============================================

/**
 * Process and enrich leads with AI scoring
 * @param {Array} rawLeads - Raw leads from sources
 * @param {string} userId - User UUID
 * @param {Object} features - User features
 * @returns {Array} - Processed leads
 */
async function processLeads(rawLeads, userId, features) {
  const processedLeads = []

  for (const rawLead of rawLeads) {
    try {
      // Basic processing
      const lead = {
        user_id: userId,
        source_id: rawLead.source,
        cost: rawLead.cost,
        first_name: rawLead.first_name,
        last_name: rawLead.last_name,
        email: rawLead.email,
        phone: rawLead.phone,
        linkedin_url: rawLead.linkedin_url,
        company_name: rawLead.company_name,
        company_website: rawLead.company_website,
        company_domain: extractDomain(rawLead.company_website),
        industry: rawLead.industry,
        job_title: rawLead.job_title,
        seniority_level: rawLead.seniority_level,
        lead_score: await calculateLeadScore(rawLead, features),
        status: 'new'
      }

      // Add behavioral data if available (Audience Labs)
      if (rawLead.behavioral_data) {
        lead.behavioral_data = rawLead.behavioral_data
      }

      processedLeads.push(lead)
    } catch (error) {
      console.error('Error processing lead:', error)
    }
  }

  return processedLeads
}

/**
 * Calculate AI-powered lead score
 * @param {Object} rawLead - Raw lead data
 * @param {Object} features - User features
 * @returns {number} - Lead score 1-100
 */
async function calculateLeadScore(rawLead, features) {
  try {
    // Base scoring factors
    let score = 50 // Base score

    // Email quality
    if (rawLead.email && isValidEmail(rawLead.email)) {
      score += 15
    }

    // Contact completeness
    if (rawLead.phone) score += 10
    if (rawLead.linkedin_url) score += 10
    if (rawLead.company_website) score += 5

    // Seniority level scoring
    const seniorityBonus = {
      'c_level': 25,
      'vp': 20,
      'director': 15,
      'manager': 10,
      'senior': 5
    }
    
    const seniority = rawLead.seniority_level?.toLowerCase() || ''
    for (const [level, bonus] of Object.entries(seniorityBonus)) {
      if (seniority.includes(level)) {
        score += bonus
        break
      }
    }

    // Company size factors (if available)
    if (rawLead.company_size) {
      if (rawLead.company_size.includes('1000+')) score += 15
      else if (rawLead.company_size.includes('500-999')) score += 10
      else if (rawLead.company_size.includes('100-499')) score += 5
    }

    // Behavioral data bonus (Audience Labs)
    if (rawLead.behavioral_data && features[FEATURES.PRIORITY_QUALITY]) {
      score += 10
    }

    // Ensure score is within bounds
    return Math.min(Math.max(score, 1), 100)
  } catch (error) {
    console.error('Error calculating lead score:', error)
    return 50 // Default score
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Deduplicate leads by email
 * @param {Array} leads - Lead array
 * @returns {Array} - Deduplicated leads
 */
function deduplicateLeads(leads) {
  const seen = new Set()
  return leads.filter(lead => {
    if (seen.has(lead.email)) {
      return false
    }
    seen.add(lead.email)
    return true
  })
}

/**
 * Rank leads by score (highest first)
 * @param {Array} leads - Lead array
 * @returns {Array} - Ranked leads
 */
function rankLeadsByScore(leads) {
  return leads.sort((a, b) => b.lead_score - a.lead_score)
}

/**
 * Extract domain from URL
 * @param {string} url - Website URL
 * @returns {string} - Domain
 */
function extractDomain(url) {
  if (!url) return null
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return domain.replace('www.', '')
  } catch {
    return null
  }
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - Is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// =============================================
// LEAD STORAGE
// =============================================

/**
 * Store generated leads in database
 * @param {Array} leads - Processed leads
 * @returns {Object} - Storage result
 */
export async function storeLeads(leads) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert(leads)
      .select()

    if (error) {
      throw error
    }

    return {
      success: true,
      stored_count: data.length,
      leads: data
    }
  } catch (error) {
    console.error('Error storing leads:', error)
    return {
      success: false,
      error: error.message,
      stored_count: 0
    }
  }
}

// =============================================
// API ENDPOINTS
// =============================================

/**
 * Next.js API endpoint for lead generation
 * POST /api/leads/generate
 */
export async function handleGenerateLeads(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, criteria, count = 25 } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'User ID required' })
    }

    // Feature gates
    await requireFeature(FEATURES.BASIC_LEAD_TABLE)(req, res)
    await requireLeadCapacity(count)(req, res)

    // Generate leads
    const result = await generateLeads(user_id, criteria, count)

    if (!result.success) {
      return res.status(400).json(result)
    }

    // Store leads in database
    const storageResult = await storeLeads(result.leads)

    if (!storageResult.success) {
      return res.status(500).json({
        error: 'Failed to store leads',
        details: storageResult.error
      })
    }

    return res.status(200).json({
      success: true,
      leads: storageResult.leads,
      count: storageResult.stored_count,
      remaining_leads: result.remaining_leads,
      features_used: result.features_used
    })

  } catch (error) {
    console.error('Lead generation API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

/**
 * Get user's leads with pagination
 * GET /api/leads?page=1&limit=50
 */
export async function handleGetLeads(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, page = 1, limit = 50, status, min_score } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'User ID required' })
    }

    // Check basic access
    const hasAccess = await FeatureToggle.hasFeature(user_id, FEATURES.BASIC_LEAD_TABLE)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Basic lead table access required' })
    }

    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (min_score) {
      query = query.gte('lead_score', min_score)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      leads: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    })

  } catch (error) {
    console.error('Get leads API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

// Export main functions
export default {
  generateLeads,
  storeLeads,
  handleGenerateLeads,
  handleGetLeads
}