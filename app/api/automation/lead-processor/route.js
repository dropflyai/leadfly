import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Lead Processing Automation Engine
export async function POST(request) {
  try {
    const { user_id, lead_data, campaign_id, action } = await request.json()

    // Handle different automation actions
    if (action === 'duplicate_check') {
      return await handleDuplicateCheck(user_id, lead_data)
    }

    if (action === 'save_clean_lead') {
      return await handleCleanLeadSave(user_id, lead_data)
    }

    console.log('🚀 Starting lead qualification automation for user:', user_id)

    // Step 1: Validate user subscription and limits
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_tiers (
          name,
          monthly_leads,
          features
        )
      `)
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 403 }
      )
    }

    // Step 2: Check lead limits
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: leadCount } = await supabase
      .from('leads')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id)
      .gte('created_at', `${currentMonth}-01`)

    if (leadCount?.length >= subscription.subscription_tiers.monthly_leads) {
      return NextResponse.json(
        { 
          error: 'Monthly lead limit reached',
          limit: subscription.subscription_tiers.monthly_leads,
          used: leadCount.length
        },
        { status: 429 }
      )
    }

    // Step 3: Process and enrich lead data
    const enrichedLead = await enrichLeadData(lead_data)

    // Step 4: Create lead record
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        user_id,
        campaign_id,
        first_name: enrichedLead.firstName,
        last_name: enrichedLead.lastName,
        email: enrichedLead.email,
        phone: enrichedLead.phone,
        company: enrichedLead.company,
        title: enrichedLead.title,
        linkedin_url: enrichedLead.linkedinUrl,
        industry: enrichedLead.industry,
        company_size: enrichedLead.companySize,
        location: enrichedLead.location,
        status: 'cold',
        score: 0,
        source: 'apollo',
        raw_data: enrichedLead.rawData
      })
      .select()
      .single()

    if (leadError) {
      throw leadError
    }

    // Step 5: Generate personalized landing page
    const landingPage = await generateLandingPage(lead, subscription)

    // Step 6: Start email nurturing sequence
    const emailSequence = await startEmailSequence(lead, landingPage, subscription)

    // Step 7: Schedule follow-up tasks
    await scheduleFollowUpTasks(lead, subscription)

    console.log('✅ Lead qualification automation started:', lead.id)

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      landing_page: landingPage,
      email_sequence: emailSequence,
      next_steps: [
        'Landing page created and activated',
        'Email nurturing sequence started',
        'Lead scoring monitoring active',
        'Warm lead detection enabled'
      ]
    })

  } catch (error) {
    console.error('❌ Lead processing automation error:', error)
    return NextResponse.json(
      { 
        error: 'Lead processing failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Lead Data Enrichment Function
async function enrichLeadData(leadData) {
  try {
    console.log('🔍 Enriching lead data...')

    // Basic data cleaning and standardization
    const enriched = {
      firstName: leadData.first_name?.trim() || '',
      lastName: leadData.last_name?.trim() || '',
      email: leadData.email?.toLowerCase().trim() || '',
      phone: cleanPhoneNumber(leadData.phone),
      company: leadData.company?.trim() || '',
      title: leadData.title?.trim() || '',
      linkedinUrl: leadData.linkedin_url || '',
      industry: leadData.industry || '',
      companySize: leadData.company_size || '',
      location: leadData.location || '',
      rawData: leadData
    }

    // Email validation
    if (!isValidEmail(enriched.email)) {
      throw new Error('Invalid email address')
    }

    // Company domain extraction
    enriched.companyDomain = extractDomainFromEmail(enriched.email)

    // Industry classification (basic)
    enriched.industryCategory = classifyIndustry(enriched.industry)

    // Lead scoring factors
    enriched.qualityScore = calculateLeadQuality(enriched)

    console.log('✅ Lead data enriched:', enriched.email)
    return enriched

  } catch (error) {
    console.error('❌ Lead enrichment failed:', error)
    throw error
  }
}

// Landing Page Generation Function
async function generateLandingPage(lead, subscription) {
  try {
    console.log('🏗️ Generating landing page for:', lead.email)

    const pageSlug = `${lead.user_id}-${lead.id}-${Date.now()}`
    const landingPageUrl = `https://leadfly.ai/l/${pageSlug}`

    // Create landing page record
    const { data: landingPage, error } = await supabase
      .from('landing_pages')
      .insert({
        lead_id: lead.id,
        user_id: lead.user_id,
        slug: pageSlug,
        url: landingPageUrl,
        template: subscription.subscription_tiers.name.toLowerCase(),
        personalization: {
          firstName: lead.first_name,
          company: lead.company,
          title: lead.title,
          industry: lead.industry
        },
        content: generatePageContent(lead, subscription),
        status: 'active',
        views: 0,
        conversions: 0
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Landing page created:', landingPageUrl)
    return landingPage

  } catch (error) {
    console.error('❌ Landing page generation failed:', error)
    throw error
  }
}

// Email Sequence Automation
async function startEmailSequence(lead, landingPage, subscription) {
  try {
    console.log('📧 Starting email sequence for:', lead.email)

    const tierFeatures = subscription.subscription_tiers.features || {}
    const sequenceType = getSequenceType(subscription.subscription_tiers.name)

    // Create email sequence record
    const { data: sequence, error } = await supabase
      .from('email_sequences')
      .insert({
        lead_id: lead.id,
        user_id: lead.user_id,
        sequence_type: sequenceType,
        status: 'active',
        current_step: 1,
        total_steps: getSequenceLength(sequenceType),
        landing_page_url: landingPage.url,
        personalization: {
          firstName: lead.first_name,
          company: lead.company,
          landingPageUrl: landingPage.url
        }
      })
      .select()
      .single()

    if (error) throw error

    // Schedule first email
    await scheduleEmail(sequence, 1, 'immediate')

    console.log('✅ Email sequence started:', sequence.id)
    return sequence

  } catch (error) {
    console.error('❌ Email sequence start failed:', error)
    throw error
  }
}

// Follow-up Task Scheduling
async function scheduleFollowUpTasks(lead, subscription) {
  try {
    console.log('⏰ Scheduling follow-up tasks for:', lead.email)

    const tasks = [
      {
        lead_id: lead.id,
        user_id: lead.user_id,
        task_type: 'score_update',
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'pending'
      },
      {
        lead_id: lead.id,
        user_id: lead.user_id,
        task_type: 'engagement_check',
        scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        status: 'pending'
      },
      {
        lead_id: lead.id,
        user_id: lead.user_id,
        task_type: 'qualification_review',
        scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending'
      }
    ]

    const { error } = await supabase
      .from('scheduled_tasks')
      .insert(tasks)

    if (error) throw error

    console.log('✅ Follow-up tasks scheduled')

  } catch (error) {
    console.error('❌ Task scheduling failed:', error)
    throw error
  }
}

// Utility Functions
function cleanPhoneNumber(phone) {
  if (!phone) return null
  return phone.replace(/[^\d+]/g, '')
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function extractDomainFromEmail(email) {
  return email.split('@')[1] || ''
}

function classifyIndustry(industry) {
  const categories = {
    'technology': ['software', 'tech', 'it', 'saas', 'ai'],
    'finance': ['finance', 'banking', 'fintech', 'investment'],
    'healthcare': ['health', 'medical', 'pharma', 'biotech'],
    'manufacturing': ['manufacturing', 'industrial', 'automotive'],
    'services': ['consulting', 'marketing', 'agency', 'services']
  }

  const industryLower = (industry || '').toLowerCase()
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => industryLower.includes(keyword))) {
      return category
    }
  }
  
  return 'other'
}

function calculateLeadQuality(lead) {
  let score = 50 // Base score

  // Email quality
  if (lead.companyDomain && !lead.companyDomain.includes('gmail') && !lead.companyDomain.includes('yahoo')) {
    score += 20
  }

  // Complete profile
  if (lead.title) score += 10
  if (lead.company) score += 10
  if (lead.linkedinUrl) score += 5
  if (lead.phone) score += 5

  // Industry relevance (can be customized)
  if (['technology', 'finance', 'services'].includes(lead.industryCategory)) {
    score += 10
  }

  return Math.min(100, score)
}

function generatePageContent(lead, subscription) {
  return {
    headline: `Hi ${lead.first_name}, we have something special for ${lead.company}`,
    subheadline: `Exclusive lead generation insights for ${lead.industry} companies`,
    cta: 'Get Your Custom Strategy',
    benefits: [
      `Tailored for ${lead.title} professionals`,
      'Industry-specific lead generation tactics',
      'Proven results in your market'
    ]
  }
}

function getSequenceType(tierName) {
  const sequences = {
    'starter': 'basic_nurture',
    'growth': 'advanced_nurture',
    'scale': 'premium_nurture',
    'enterprise': 'custom_nurture'
  }
  return sequences[tierName.toLowerCase()] || 'basic_nurture'
}

function getSequenceLength(sequenceType) {
  const lengths = {
    'basic_nurture': 3,
    'advanced_nurture': 5,
    'premium_nurture': 7,
    'custom_nurture': 10
  }
  return lengths[sequenceType] || 3
}

async function scheduleEmail(sequence, step, timing) {
  // This would integrate with your email service (SendGrid, etc.)
  console.log(`📧 Scheduling email ${step} for sequence ${sequence.id}`)
  
  // For now, we'll just log. In production, this would:
  // 1. Queue email with your email service
  // 2. Set up webhook for delivery tracking
  // 3. Schedule next email in sequence
  
  return { scheduled: true, step, timing }
}

// Duplicate Detection Handler
async function handleDuplicateCheck(userId, leadData) {
  try {
    console.log('🔍 Performing duplicate check for:', leadData.email)

    // Multi-algorithm duplicate detection
    const duplicateChecks = []

    // 1. Exact email match
    if (leadData.email) {
      const { data: emailDupes } = await supabase
        .from('leads')
        .select('id, email, created_at, status')
        .eq('user_id', userId)
        .eq('email', leadData.email.toLowerCase().trim())

      if (emailDupes?.length > 0) {
        duplicateChecks.push({
          type: 'exact_email',
          matches: emailDupes.length,
          confidence: 1.0,
          details: emailDupes
        })
      }
    }

    // 2. Phone number match
    if (leadData.phone) {
      const normalizedPhone = cleanPhoneNumber(leadData.phone)
      const { data: phoneDupes } = await supabase
        .from('leads')
        .select('id, phone, email, created_at')
        .eq('user_id', userId)
        .eq('phone', normalizedPhone)

      if (phoneDupes?.length > 0) {
        duplicateChecks.push({
          type: 'exact_phone',
          matches: phoneDupes.length,
          confidence: 0.95,
          details: phoneDupes
        })
      }
    }

    // 3. Company + Name fuzzy match
    if (leadData.company && (leadData.first_name || leadData.name)) {
      const { data: companyNameMatches } = await supabase
        .from('leads')
        .select('id, company, first_name, last_name, email, created_at')
        .eq('user_id', userId)
        .ilike('company', `%${leadData.company}%`)

      const fuzzyMatches = companyNameMatches?.filter(lead => {
        const firstName = leadData.first_name || leadData.name || ''
        return lead.first_name?.toLowerCase().includes(firstName.toLowerCase()) ||
               firstName.toLowerCase().includes(lead.first_name?.toLowerCase() || '')
      }) || []

      if (fuzzyMatches.length > 0) {
        duplicateChecks.push({
          type: 'company_name_fuzzy',
          matches: fuzzyMatches.length,
          confidence: 0.75,
          details: fuzzyMatches
        })
      }
    }

    // 4. Domain clustering (same company domain)
    if (leadData.email) {
      const domain = leadData.email.split('@')[1]
      if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
        const { data: domainMatches } = await supabase
          .from('leads')
          .select('id, email, company, created_at')
          .eq('user_id', userId)
          .ilike('email', `%@${domain}`)

        if (domainMatches?.length > 0) {
          duplicateChecks.push({
            type: 'domain_clustering',
            matches: domainMatches.length,
            confidence: 0.6,
            details: domainMatches
          })
        }
      }
    }

    // Calculate overall duplicate probability
    const maxConfidence = Math.max(...duplicateChecks.map(check => check.confidence), 0)
    const totalMatches = duplicateChecks.reduce((sum, check) => sum + check.matches, 0)

    // Risk assessment
    const riskFactors = {
      disposable_email: leadData.email?.includes('tempmail') || 
                       leadData.email?.includes('guerrillamail') || false,
      personal_email: leadData.email?.includes('@gmail.') || 
                     leadData.email?.includes('@yahoo.') || false,
      incomplete_data: !leadData.company || !leadData.first_name,
      suspicious_domain: false // Could add domain reputation check
    }

    const riskScore = Object.values(riskFactors).filter(Boolean).length * 25

    // Decision logic
    let action = 'allow_processing'
    let reasoning = 'No significant duplicates detected'

    if (maxConfidence >= 0.9 && totalMatches > 0) {
      action = 'reject_duplicate'
      reasoning = 'High confidence duplicate detected'
    } else if (maxConfidence >= 0.7 || riskScore > 50) {
      action = 'flag_for_review'
      reasoning = 'Potential duplicate or suspicious activity'
    }

    console.log('✅ Duplicate check completed:', action)

    return NextResponse.json({
      success: true,
      action,
      reasoning,
      duplicate_probability: maxConfidence,
      total_matches: totalMatches,
      risk_score: riskScore,
      checks_performed: duplicateChecks.map(check => ({
        type: check.type,
        matches: check.matches,
        confidence: check.confidence
      })),
      risk_factors: riskFactors,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Duplicate check failed:', error)
    return NextResponse.json(
      { error: 'Duplicate check failed', message: error.message },
      { status: 500 }
    )
  }
}

// Clean Lead Save Handler
async function handleCleanLeadSave(userId, leadData) {
  try {
    console.log('💾 Saving validated lead:', leadData.email)

    // First check if lead already exists (additional safety)
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('user_id', userId)
      .eq('email', leadData.email?.toLowerCase().trim())
      .single()

    if (existingLead) {
      return NextResponse.json({
        success: false,
        error: 'Lead already exists',
        lead_id: existingLead.id
      })
    }

    // Create fingerprint for future duplicate detection
    const fingerprint = generateLeadFingerprint(leadData)

    // Save clean lead with fingerprint
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        user_id: userId,
        first_name: leadData.first_name?.trim(),
        last_name: leadData.last_name?.trim(),
        email: leadData.email?.toLowerCase().trim(),
        phone: cleanPhoneNumber(leadData.phone),
        company: leadData.company?.trim(),
        title: leadData.title?.trim(),
        linkedin_url: leadData.linkedin_url,
        industry: leadData.industry,
        location: leadData.location,
        status: 'validated',
        score: 0,
        source: leadData.source || 'api',
        fingerprint: fingerprint,
        duplicate_checked: true,
        raw_data: leadData
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Clean lead saved:', lead.id)

    return NextResponse.json({
      success: true,
      lead_saved: true,
      lead_id: lead.id,
      fingerprint: fingerprint,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Clean lead save failed:', error)
    return NextResponse.json(
      { error: 'Lead save failed', message: error.message },
      { status: 500 }
    )
  }
}

// Generate Lead Fingerprint
function generateLeadFingerprint(leadData) {
  const components = [
    leadData.email?.toLowerCase().trim(),
    cleanPhoneNumber(leadData.phone),
    `${leadData.company?.toLowerCase().trim()}_${leadData.first_name?.toLowerCase().trim()}`
  ].filter(Boolean)

  // Create a simple hash-like fingerprint
  return components.map(comp => 
    comp.split('').reduce((hash, char) => 
      ((hash << 5) - hash) + char.charCodeAt(0), 0
    ).toString(36)
  ).join('-')
}