import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Dynamic Landing Page Generator
export async function POST(request) {
  try {
    const { lead_id, template_type, personalization } = await request.json()

    console.log('🏗️ Generating landing page for lead:', lead_id)

    // Get lead data
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single()

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Generate page content based on template and personalization
    const pageContent = await generateDynamicContent(lead, template_type, personalization)
    
    // Create unique slug
    const slug = `${lead.user_id}-${lead.id}-${Date.now()}`
    const landingUrl = `https://leadflyai.com/l/${slug}`

    // Save landing page
    const { data: landingPage, error } = await supabase
      .from('landing_pages')
      .insert({
        lead_id: lead.id,
        user_id: lead.user_id,
        slug,
        url: landingUrl,
        template: template_type,
        content: pageContent,
        personalization,
        status: 'active',
        views: 0,
        conversions: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Landing page generated:', landingUrl)

    return NextResponse.json({
      success: true,
      landing_page: landingPage,
      url: landingUrl,
      content_preview: pageContent
    })

  } catch (error) {
    console.error('❌ Landing page generation failed:', error)
    return NextResponse.json(
      { 
        error: 'Landing page generation failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve landing page content
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter required' },
        { status: 400 }
      )
    }

    // Get landing page data
    const { data: landingPage } = await supabase
      .from('landing_pages')
      .select(`
        *,
        leads (
          first_name,
          last_name,
          company,
          title,
          email
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found or inactive' },
        { status: 404 }
      )
    }

    // Track page view
    await trackPageView(landingPage.id)

    return NextResponse.json({
      content: landingPage.content,
      personalization: landingPage.personalization,
      template: landingPage.template,
      lead_info: landingPage.leads
    })

  } catch (error) {
    console.error('❌ Landing page retrieval failed:', error)
    return NextResponse.json(
      { 
        error: 'Landing page retrieval failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Generate dynamic content based on lead data and template
async function generateDynamicContent(lead, templateType, personalization) {
  const templates = {
    starter: generateStarterTemplate,
    growth: generateGrowthTemplate,
    scale: generateScaleTemplate,
    enterprise: generateEnterpriseTemplate
  }

  const generator = templates[templateType] || templates.starter
  return generator(lead, personalization)
}

function generateStarterTemplate(lead, personalization) {
  return {
    template: 'starter',
    headline: `${lead.first_name}, Ready to 10x Your Lead Generation?`,
    subheadline: `Exclusive insights for ${lead.company} to scale your sales pipeline`,
    hero_image: '/images/lead-gen-hero.jpg',
    
    sections: [
      {
        type: 'hero',
        content: {
          headline: `Hi ${lead.first_name},`,
          subheadline: `We've been researching ${lead.company} and have some game-changing insights for your ${lead.industry} business.`,
          cta_text: 'Get My Custom Strategy',
          cta_color: 'electric'
        }
      },
      {
        type: 'benefits',
        title: `Why ${lead.title}s Choose LeadFly AI`,
        items: [
          {
            icon: '🎯',
            title: 'Targeted Lead Generation',
            description: `Find qualified prospects in ${lead.industry} who are ready to buy`
          },
          {
            icon: '🤖',
            title: 'AI-Powered Qualification',
            description: 'Our AI identifies the warmest leads before you even reach out'
          },
          {
            icon: '📈',
            title: 'Proven Results',
            description: 'Companies like yours see 300% increase in qualified leads'
          }
        ]
      },
      {
        type: 'social_proof',
        title: 'Join Companies Like Yours',
        testimonials: [
          {
            text: `LeadFly transformed our ${lead.industry} lead generation. We went from 10 to 100+ qualified leads per month.`,
            author: 'Similar Company CEO',
            company: `${lead.industry} Leader`
          }
        ]
      },
      {
        type: 'cta_section',
        headline: `Ready to Scale ${lead.company}?`,
        subheadline: 'Get your personalized lead generation strategy',
        form: {
          fields: ['phone', 'best_time_to_call', 'current_challenge'],
          submit_text: 'Yes, I Want More Leads',
          privacy_text: 'We respect your privacy. No spam, ever.'
        }
      }
    ],
    
    tracking: {
      page_view: true,
      form_interactions: true,
      scroll_depth: true,
      time_on_page: true
    }
  }
}

function generateGrowthTemplate(lead, personalization) {
  return {
    template: 'growth',
    headline: `${lead.first_name}, Scale ${lead.company} with AI-Powered Leads`,
    subheadline: `Advanced lead generation strategy for ${lead.industry} leaders`,
    
    sections: [
      {
        type: 'hero',
        content: {
          headline: `${lead.first_name}, your ${lead.industry} competitors are scaling faster.`,
          subheadline: `While you're manually prospecting, they're using AI to find 10x more qualified leads. Here's how ${lead.company} can catch up.`,
          video_thumbnail: '/images/demo-video-thumb.jpg',
          cta_text: 'Watch 2-Min Demo',
          secondary_cta: 'Get Custom Strategy'
        }
      },
      {
        type: 'problem_solution',
        title: `The ${lead.industry} Lead Generation Problem`,
        problems: [
          'Traditional prospecting is time-consuming and ineffective',
          'Most leads are cold and unqualified',
          'Sales teams waste time on bad prospects'
        ],
        solution: {
          title: 'The LeadFly AI Solution',
          description: 'AI-powered qualification that turns cold prospects into warm, ready-to-buy leads',
          features: [
            'Multi-channel nurturing sequences',
            'Behavioral scoring and qualification',
            'TCPA-compliant warm calling'
          ]
        }
      },
      {
        type: 'case_study',
        title: `How ${lead.industry} Companies Scale`,
        case_studies: [
          {
            company: `${lead.industry} Startup`,
            result: '500% increase in qualified leads',
            timeline: '3 months',
            details: 'Went from 20 to 100+ warm leads per month'
          }
        ]
      },
      {
        type: 'interactive_calculator',
        title: `Calculate ${lead.company}'s Lead Potential`,
        description: 'See how many qualified leads LeadFly AI could generate for your business',
        calculator_type: 'lead_potential'
      },
      {
        type: 'urgency_cta',
        headline: `${lead.first_name}, Your Competitors Won't Wait`,
        subheadline: 'Book a strategy call before they capture your market',
        countdown: '48_hours',
        form: {
          fields: ['phone', 'revenue_goal', 'current_lead_volume'],
          submit_text: 'Book My Strategy Call',
          urgency_text: 'Limited spots available this week'
        }
      }
    ]
  }
}

function generateScaleTemplate(lead, personalization) {
  return {
    template: 'scale',
    headline: `${lead.company} Enterprise Lead Generation Platform`,
    subheadline: `Custom AI solution for ${lead.industry} market leaders`,
    
    sections: [
      {
        type: 'executive_hero',
        content: {
          headline: `${lead.first_name}, Transform ${lead.company} into a Lead Generation Machine`,
          subheadline: `Enterprise-grade AI platform trusted by ${lead.industry} leaders to generate 10,000+ qualified leads monthly`,
          executive_image: '/images/executive-dashboard.png',
          stats: [
            { value: '10,000+', label: 'Leads/Month' },
            { value: '95%', label: 'Qualification Accuracy' },
            { value: '300%', label: 'ROI Increase' }
          ]
        }
      },
      {
        type: 'platform_demo',
        title: 'See the Platform in Action',
        interactive_demo: true,
        features: [
          'Custom domain landing pages',
          'Advanced behavioral tracking',
          'Predictive lead scoring',
          'Team collaboration tools',
          'Enterprise integrations'
        ]
      },
      {
        type: 'enterprise_benefits',
        title: `Why ${lead.industry} Enterprises Choose LeadFly`,
        benefits: [
          {
            category: 'Scale',
            items: ['Handle 1000+ leads simultaneously', 'Multi-team collaboration', 'Custom workflows']
          },
          {
            category: 'Security',
            items: ['SOC2 compliance', 'GDPR ready', 'Enterprise SSO']
          },
          {
            category: 'Integration',
            items: ['Salesforce integration', 'HubSpot sync', 'Custom APIs']
          }
        ]
      },
      {
        type: 'roi_calculator',
        title: `Calculate ${lead.company}'s ROI`,
        inputs: ['current_sales_team_size', 'average_deal_size', 'close_rate'],
        outputs: ['projected_leads', 'additional_revenue', 'roi_percentage']
      },
      {
        type: 'executive_cta',
        headline: `Ready to Transform ${lead.company}?`,
        subheadline: 'Schedule an executive briefing with our team',
        meeting_scheduler: true,
        form: {
          fields: ['phone', 'company_size', 'decision_timeline'],
          submit_text: 'Schedule Executive Briefing',
          calendar_integration: true
        }
      }
    ]
  }
}

function generateEnterpriseTemplate(lead, personalization) {
  return {
    template: 'enterprise',
    headline: `${lead.company} White-Label Lead Generation Platform`,
    subheadline: `Turn lead generation into a revenue stream for ${lead.company}`,
    
    sections: [
      {
        type: 'white_label_hero',
        content: {
          headline: `${lead.first_name}, Create a New Revenue Stream for ${lead.company}`,
          subheadline: `White-label LeadFly AI and offer enterprise lead generation services to your clients`,
          revenue_projection: '$500K+ ARR potential',
          partnership_tiers: ['Reseller', 'White-Label', 'Revenue Share']
        }
      },
      {
        type: 'revenue_opportunity',
        title: `The ${lead.industry} Opportunity`,
        market_size: '$50B lead generation market',
        your_opportunity: 'Capture 0.001% = $500K ARR',
        pricing_model: {
          'Starter Plans': '$97/month → Sell for $297/month',
          'Enterprise Deals': '$1,497/month → Sell for $4,997/month',
          'Your Margin': '60-70% profit on all sales'
        }
      },
      {
        type: 'partner_success',
        title: 'Partner Success Stories',
        case_studies: [
          {
            partner: `${lead.industry} Agency`,
            result: '$2M ARR in 18 months',
            model: 'White-label reseller',
            growth: '300% year-over-year'
          }
        ]
      },
      {
        type: 'platform_customization',
        title: 'Your Branded Platform',
        features: [
          'Complete white-label branding',
          'Custom domain and SSL',
          'Your pricing and packages',
          'Client management dashboard',
          'Revenue sharing program',
          'Dedicated support team'
        ]
      },
      {
        type: 'partnership_cta',
        headline: `Join the LeadFly Partner Program`,
        subheadline: 'Limited partnerships available in your market',
        partnership_form: {
          fields: ['company_revenue', 'client_base_size', 'partnership_interest'],
          submit_text: 'Apply for Partnership',
          qualification_call: true
        }
      }
    ]
  }
}

// Track page view and engagement
async function trackPageView(landingPageId) {
  try {
    // Update view count
    await supabase
      .from('landing_pages')
      .update({ 
        views: supabase.raw('views + 1'),
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', landingPageId)

    // Log detailed analytics
    await supabase
      .from('page_analytics')
      .insert({
        landing_page_id: landingPageId,
        event_type: 'page_view',
        timestamp: new Date().toISOString(),
        user_agent: 'API_CALL', // In real implementation, get from headers
        ip_address: 'MASKED' // For privacy
      })

    console.log('📊 Page view tracked for landing page:', landingPageId)

  } catch (error) {
    console.error('❌ Page view tracking failed:', error)
  }
}