'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CursorArrowRaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  FunnelIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  BoltIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  LightBulbIcon,
  XCircleIcon as XCircleIconOutline
} from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export default function DemoDashboard() {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({
    totalLeads: 347,
    highQualityLeads: 89,
    conversionRate: 23.5,
    remainingCredits: 153
  })
  
  // Predictive Intelligence Data
  const [predictions, setPredictions] = useState({
    revenueForcast: {
      amount: 127000,
      confidence: 87,
      trend: '+12.3%',
      timeframe: 'this month'
    },
    pipelineVelocity: {
      avgDays: 23,
      improvement: -3,
      trend: 'faster than last month'
    },
    hotLeads: {
      count: 12,
      conversionLikelihood: 'this week',
      totalValue: 89000
    },
    riskAlerts: {
      highValueDeals: 3,
      totalAtRisk: 245000,
      actionNeeded: true
    }
  })
  const [filters, setFilters] = useState({
    minScore: 0,
    industry: '',
    company_size: ''
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    setIsLoaded(true)
    setLeads(sampleLeads)
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const copyLeadData = (lead) => {
    const leadText = `
Name: ${lead.first_name} ${lead.last_name}
Title: ${lead.job_title}
Company: ${lead.company_name}
Email: ${lead.email}
Phone: ${lead.phone}
Mobile: ${lead.mobile || 'N/A'}
LinkedIn: ${lead.linkedin}
Industry: ${lead.industry}
Company Size: ${lead.employee_count} employees
Revenue: ${lead.company_revenue}
Website: ${lead.company_website}
Address: ${lead.company_address}
Lead Score: ${lead.lead_score}/100
Conversion Probability: ${lead.conversion_probability}%
Deal Value: $${lead.deal_value?.toLocaleString()}
Predicted Close: ${new Date(lead.predicted_close_date).toLocaleDateString()}
Next Action: ${lead.next_best_action}
Source: ${lead.lead_source}
Timezone: ${lead.timezone}
Technologies: ${lead.technologies?.join(', ')}
Notes: ${lead.notes}
Insights: ${lead.ai_insights}
    `.trim()
    
    navigator.clipboard.writeText(leadText).then(() => {
      alert('Lead data copied to clipboard!')
    })
  }


  const exportLeads = () => {
    const csvContent = [
      // CSV Headers
      'First Name,Last Name,Email,Phone,Mobile,LinkedIn,Company,Website,Job Title,Industry,Employee Count,Revenue,Lead Score,Conversion Probability,Deal Value,Predicted Close Date,Next Action,Source,Timezone,Technologies,Notes,Insights',
      // CSV Data
      ...leads.map(lead => [
        lead.first_name,
        lead.last_name,
        lead.email,
        lead.phone,
        lead.mobile || '',
        lead.linkedin,
        lead.company_name,
        lead.company_website,
        lead.job_title,
        lead.industry,
        lead.employee_count,
        lead.company_revenue,
        lead.lead_score,
        lead.conversion_probability,
        lead.deal_value,
        lead.predicted_close_date,
        lead.next_best_action,
        lead.lead_source,
        lead.timezone,
        lead.technologies?.join('; ') || '',
        lead.notes || '',
        lead.ai_insights
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Sample lead data with enhanced properties
  const sampleLeads = [
    {
      id: 1,
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'sarah.chen@techcorp.com',
      phone: '+1 (555) 123-4567',
      mobile: '+1 (555) 123-4568',
      linkedin: 'https://linkedin.com/in/sarahchen-vp',
      company_name: 'TechCorp Inc',
      company_website: 'https://techcorp.com',
      company_address: '123 Tech Street, San Francisco, CA 94105',
      company_revenue: '$50M-100M',
      job_title: 'VP of Sales',
      department: 'Sales',
      seniority: 'VP',
      industry: 'Software',
      lead_score: 92,
      company_size: '51-200',
      employee_count: 150,
      status: 'new',
      lead_source: 'LinkedIn Outreach',
      created_at: '2025-01-13T10:30:00Z',
      last_contacted: '2025-01-13T10:30:00Z',
      timezone: 'PST',
      technologies: ['Salesforce', 'HubSpot', 'Slack'],
      ai_insights: 'Decision maker with budget authority. Company actively hiring.',
      intent_signals: ['job_posting', 'tech_stack_change', 'funding_round'],
      conversion_probability: 92,
      predicted_close_date: '2025-01-20',
      next_best_action: 'Schedule discovery call',
      engagement_likelihood: 'Very High',
      deal_value: 45000,
      notes: 'Interested in scaling sales operations. Mentioned budget approval process.',
      // Premium Intelligence Data
      financialHealth: {
        revenue: '$89M',
        growth: '+23%',
        profitability: 'Profitable',
        fundingStage: 'Series C',
        lastFunding: '$45M (Oct 2024)',
        investors: ['Sequoia Capital', 'Andreessen Horowitz'],
        creditRating: 'A-'
      },
      organizationalIntel: {
        totalEmployees: 150,
        recentHires: 12,
        keyHires: ['VP Engineering (Nov 2024)', 'Head of Product (Dec 2024)'],
        departments: [
          { name: 'Engineering', size: 45, growth: '+15%' },
          { name: 'Sales', size: 25, growth: '+25%' },
          { name: 'Marketing', size: 18, growth: '+20%' }
        ],
        reportingStructure: {
          reportsTo: 'CEO - Michael Chen',
          directReports: 4,
          teamSize: 25
        }
      },
      intentSignals: {
        recentActivity: [
          'Downloaded sales automation whitepaper (3 days ago)',
          'Attended "Scaling Sales Operations" webinar (1 week ago)',
          'Visited competitor pricing pages (5 times last month)'
        ],
        buyingSignals: [
          'Posted job for Sales Operations Manager',
          'Increased marketing spend by 40%',
          'Mentioned Q1 budget allocation in LinkedIn post'
        ],
        timeline: 'Likely to purchase within 30-60 days',
        budget: '$50K-100K annual budget allocated'
      },
      competitiveIntel: {
        currentTools: ['Salesforce (CRM)', 'Outreach (Engagement)', 'ZoomInfo (Data)'],
        painPoints: [
          'Manual lead qualification process',
          'Low conversion rates on cold outreach',
          'Difficulty scaling personalization'
        ],
        competitorEvaluations: ['HubSpot', 'Pardot', 'Apollo'],
        contractRenewals: [{ vendor: 'ZoomInfo', expires: '2025-06-30', value: '$36K' }]
      },
      socialIntel: {
        linkedinActivity: 'Very Active (posts 2-3x/week)',
        contentEngagement: 'High engagement on sales content',
        influencerNetwork: ['Jill Rowley', 'Mark Roberge', 'Aaron Ross'],
        recentPosts: [
          'Excited about our Q4 growth numbers! Time to scale the team.',
          'What are your favorite tools for sales automation?'
        ]
      },
      newsIntel: {
        recentNews: [
          'TechCorp raises $45M Series C to expand sales team',
          'Company announces new enterprise product line',
          'CEO featured in Forbes "Rising Stars" list'
        ],
        marketEvents: 'Attending SaaStr Annual next month',
        industryTrends: 'AI-powered sales tools adoption increasing 300% in sector'
      }
    },
    {
      id: 2,
      first_name: 'Marcus',
      last_name: 'Johnson',
      email: 'marcus@growthco.com',
      phone: '+1 (555) 234-5678',
      mobile: '+1 (555) 234-5679',
      linkedin: 'https://linkedin.com/in/marcusjohnson-ceo',
      company_name: 'GrowthCo',
      company_website: 'https://growthco.io',
      company_address: '456 Growth Ave, Austin, TX 78701',
      company_revenue: '$10M-50M',
      job_title: 'CEO',
      department: 'Executive',
      seniority: 'C-Level',
      industry: 'Marketing',
      lead_score: 88,
      company_size: '11-50',
      employee_count: 35,
      status: 'contacted',
      lead_source: 'Cold Email',
      created_at: '2025-01-13T09:15:00Z',
      last_contacted: '2025-01-13T14:30:00Z',
      timezone: 'CST',
      technologies: ['Marketo', 'Salesforce', 'Google Analytics'],
      ai_insights: 'CEO looking for growth solutions. High budget allocation.',
      intent_signals: ['competitor_research', 'solution_search'],
      conversion_probability: 78,
      predicted_close_date: '2025-01-28',
      next_best_action: 'Send ROI case study',
      engagement_likelihood: 'High',
      deal_value: 28000,
      notes: 'Responded to initial outreach. Wants to see competitive analysis.',
      // Premium Intelligence Data
      financialHealth: {
        revenue: '$28M',
        growth: '+45%',
        profitability: 'Break-even',
        fundingStage: 'Series B',
        lastFunding: '$15M (Feb 2024)',
        investors: ['First Round Capital', 'Bessemer Venture Partners'],
        creditRating: 'B+'
      },
      organizationalIntel: {
        totalEmployees: 35,
        recentHires: 8,
        keyHires: ['Head of Growth (Jan 2025)', 'Senior Developer (Dec 2024)'],
        departments: [
          { name: 'Product', size: 12, growth: '+50%' },
          { name: 'Marketing', size: 8, growth: '+100%' },
          { name: 'Sales', size: 6, growth: '+20%' }
        ],
        reportingStructure: {
          reportsTo: 'Board of Directors',
          directReports: 6,
          teamSize: 35
        }
      },
      intentSignals: {
        recentActivity: [
          'Researched "lead generation ROI" extensively',
          'Downloaded multiple competitive analyses',
          'Attended 3 sales tech demos last month'
        ],
        buyingSignals: [
          'Approved marketing budget increase for Q1',
          'Posted job for Growth Marketing Manager',
          'CEO mentioned "scaling challenges" in recent interview'
        ],
        timeline: 'Evaluating solutions now, decision by month-end',
        budget: '$25K-50K initial budget with expansion potential'
      },
      competitiveIntel: {
        currentTools: ['Marketo (Marketing)', 'Pipedrive (CRM)', 'Apollo (Data)'],
        painPoints: [
          'Limited lead qualification capabilities',
          'Manual outreach processes',
          'Poor lead-to-customer conversion'
        ],
        competitorEvaluations: ['HubSpot', 'Salesforce', 'Pardot'],
        contractRenewals: [{ vendor: 'Apollo', expires: '2025-03-15', value: '$12K' }]
      },
      socialIntel: {
        linkedinActivity: 'Active (posts weekly)',
        contentEngagement: 'High engagement on growth content',
        influencerNetwork: ['Brian Balfour', 'Sean Ellis', 'Andrew Chen'],
        recentPosts: [
          'Looking for the right tools to scale our growth engine',
          'Hiring amazing people is the key to sustainable growth'
        ]
      },
      newsIntel: {
        recentNews: [
          'GrowthCo featured in TechCrunch as "Startup to Watch"',
          'Company launches new product vertical',
          'Named to Inc. 5000 fastest growing companies'
        ],
        marketEvents: 'Speaking at Growth Summit Austin',
        industryTrends: 'Marketing automation adoption up 200% in mid-market'
      }
    },
    {
      id: 3,
      first_name: 'Lisa',
      last_name: 'Rodriguez',
      email: 'l.rodriguez@scaleinc.com',
      phone: '+1 (555) 345-6789',
      mobile: '+1 (555) 345-6790',
      linkedin: 'https://linkedin.com/in/lisarodriguez-marketing',
      company_name: 'Scale Inc',
      company_website: 'https://scaleinc.com',
      company_address: '789 Scale Blvd, New York, NY 10001',
      company_revenue: '$100M+',
      job_title: 'Director of Marketing',
      department: 'Marketing',
      seniority: 'Director',
      industry: 'SaaS',
      lead_score: 85,
      company_size: '201-500',
      employee_count: 320,
      status: 'qualified',
      lead_source: 'Referral',
      created_at: '2025-01-13T08:45:00Z',
      last_contacted: '2025-01-14T11:15:00Z',
      timezone: 'EST',
      technologies: ['HubSpot', 'Pardot', 'Tableau'],
      ai_insights: 'Marketing director with expanding team. Budget approved.',
      intent_signals: ['hiring_spree', 'competitor_analysis'],
      conversion_probability: 85,
      predicted_close_date: '2025-01-25',
      next_best_action: 'Send custom proposal',
      engagement_likelihood: 'Very High',
      deal_value: 38000,
      notes: 'Team of 12 marketers. Q1 budget allocated for lead gen tools.',
      // Premium Intelligence Data
      financialHealth: {
        revenue: '$245M',
        growth: '+18%',
        profitability: 'Highly Profitable',
        fundingStage: 'Public (IPO 2022)',
        lastFunding: '$150M IPO',
        investors: ['Public Markets', 'Fidelity', 'T. Rowe Price'],
        creditRating: 'AA-'
      },
      organizationalIntel: {
        totalEmployees: 320,
        recentHires: 25,
        keyHires: ['CMO (Dec 2024)', 'VP Sales (Nov 2024)', 'Head of Demand Gen (Jan 2025)'],
        departments: [
          { name: 'Marketing', size: 45, growth: '+30%' },
          { name: 'Sales', size: 85, growth: '+25%' },
          { name: 'Customer Success', size: 40, growth: '+35%' }
        ],
        reportingStructure: {
          reportsTo: 'CMO - Jennifer Walsh',
          directReports: 12,
          teamSize: 45
        }
      },
      intentSignals: {
        recentActivity: [
          'Evaluated 6 lead generation platforms last quarter',
          'Attended multiple sales tech conferences',
          'Downloaded enterprise sales playbooks'
        ],
        buyingSignals: [
          'Q1 budget approved for marketing technology upgrade',
          'Posted multiple marketing operations roles',
          'Mentioned "scaling personalization" in earnings call'
        ],
        timeline: 'Ready to purchase, implementation planned for Q2',
        budget: '$100K+ annual budget approved'
      },
      competitiveIntel: {
        currentTools: ['HubSpot (Marketing)', 'Salesforce (CRM)', 'Pardot (Automation)', 'Tableau (Analytics)'],
        painPoints: [
          'Need better lead scoring accuracy',
          'Struggling with attribution modeling',
          'Manual account-based marketing processes'
        ],
        competitorEvaluations: ['Marketo', '6sense', 'Demandbase'],
        contractRenewals: [{ vendor: 'HubSpot', expires: '2025-08-15', value: '$85K' }]
      },
      socialIntel: {
        linkedinActivity: 'Thought Leader (posts daily)',
        contentEngagement: 'High engagement, 15K+ followers',
        influencerNetwork: ['David Cancel', 'Sangram Vajre', 'Jon Miller'],
        recentPosts: [
          'The future of B2B marketing is AI-powered personalization',
          'Excited to lead our team through our next growth phase'
        ]
      },
      newsIntel: {
        recentNews: [
          'Scale Inc reports record Q4 earnings, beats estimates',
          'Company acquires AI startup for $25M',
          'Scale Inc named "Best Places to Work" by Glassdoor'
        ],
        marketEvents: 'Keynoting at MarTech Conference',
        industryTrends: 'Enterprise SaaS companies increasing marketing spend by 40%'
      }
    }
  ]

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-neon-400 bg-neon-500/20'
    if (score >= 80) return 'text-electric-400 bg-electric-500/20'
    if (score >= 70) return 'text-purple-400 bg-purple-500/20'
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-electric-400 bg-electric-500/20'
      case 'contacted': return 'text-yellow-400 bg-yellow-500/20'
      case 'qualified': return 'text-neon-400 bg-neon-500/20'
      case 'closed': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-dark-500 bg-dark-200/20'
    }
  }

  const statsData = [
    {
      icon: UserGroupIcon,
      label: 'Neural Leads',
      value: stats.totalLeads,
      change: '+12.5%',
      gradient: 'electric'
    },
    {
      icon: CpuChipIcon,
      label: 'Quantum Quality',
      value: stats.highQualityLeads,
      change: '+8.3%',
      gradient: 'neon'
    },
    {
      icon: RocketLaunchIcon,
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: '+2.1%',
      gradient: 'purple'
    },
    {
      icon: BoltIcon,
      label: 'Credits Remaining',
      value: stats.remainingCredits,
      change: '347/500',
      gradient: 'electric'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-50 text-dark-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-streak-vertical"></div>
        <div 
          className="absolute w-96 h-96 rounded-full bg-electric-500/10 blur-3xl animate-float"
          style={{
            left: mousePosition.x - 192 + 'px',
            top: mousePosition.y - 192 + 'px',
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-80 h-80 rounded-full bg-neon-500/10 blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 nav-blur border-b border-dark-200/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative">
                  <SparklesIcon className="w-8 h-8 text-electric-400 animate-glow-pulse" />
                  <div className="absolute inset-0 bg-electric-400/20 blur-xl rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">LeadFly AI</h1>
                  <span className="text-sm text-dark-600">Demo Dashboard</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="status-dot status-online"></div>
                <span className="text-sm text-dark-600">Demo Mode</span>
              </div>
              <button className="btn-secondary group">
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                Neural Config
              </button>
              <button className="btn-primary group">
                <PlusIcon className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                Generate Leads
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        {/* Predictive Intelligence Center */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Predictive Intelligence</span>
              <span className="text-dark-800"> Center</span>
            </h2>
            <p className="text-lg text-dark-600">AI-powered forecasting and predictive analytics</p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Revenue Forecast */}
            <div className="electric-card group interactive-hover relative overflow-hidden">
              <div className="gradient-streak"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-electric-500/20 shadow-glow">
                    <ChartBarIcon className="w-6 h-6 text-electric-400" />
                  </div>
                  <div className="text-xs bg-electric-500/20 text-electric-400 px-2 py-1 rounded-full">
                    {predictions.revenueForcast.confidence}% confidence
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-dark-800">Revenue Forecast</h3>
                <div className="text-3xl font-bold electric-text mb-1">
                  ${(predictions.revenueForcast.amount / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-dark-600 mb-2">{predictions.revenueForcast.timeframe}</div>
                <div className="text-sm text-neon-400 font-semibold">
                  {predictions.revenueForcast.trend} vs last month
                </div>
              </div>
            </div>

            {/* Pipeline Velocity */}
            <div className="glass-card group interactive-hover relative overflow-hidden">
              <div className="gradient-streak"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-neon-500/20 shadow-neon">
                    <RocketLaunchIcon className="w-6 h-6 text-neon-400" />
                  </div>
                  <div className="text-xs bg-neon-500/20 text-neon-400 px-2 py-1 rounded-full">
                    AI Optimized
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-dark-800">Pipeline Velocity</h3>
                <div className="text-3xl font-bold neon-text mb-1">
                  {predictions.pipelineVelocity.avgDays} days
                </div>
                <div className="text-sm text-dark-600 mb-2">average close time</div>
                <div className="text-sm text-electric-400 font-semibold">
                  {Math.abs(predictions.pipelineVelocity.improvement)} days {predictions.pipelineVelocity.trend}
                </div>
              </div>
            </div>

            {/* Hot Lead Predictor */}
            <div className="glass-card group interactive-hover relative overflow-hidden">
              <div className="gradient-streak"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 shadow-purple-glow">
                    <BoltIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                    High Probability
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-dark-800">Hot Lead Predictor</h3>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-1">
                  {predictions.hotLeads.count} leads
                </div>
                <div className="text-sm text-dark-600 mb-2">likely to convert {predictions.hotLeads.conversionLikelihood}</div>
                <div className="text-sm text-neon-400 font-semibold">
                  ${(predictions.hotLeads.totalValue / 1000).toFixed(0)}K potential value
                </div>
              </div>
            </div>

            {/* Risk Alert Center */}
            <div className="glass-card group interactive-hover relative overflow-hidden border-l-4 border-l-red-500/50">
              <div className="gradient-streak"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-red-500/20 shadow-red-glow">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full animate-pulse">
                    Action Needed
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-dark-800">Risk Alerts</h3>
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {predictions.riskAlerts.highValueDeals} deals
                </div>
                <div className="text-sm text-dark-600 mb-2">at risk of stalling</div>
                <div className="text-sm text-red-400 font-semibold">
                  ${(predictions.riskAlerts.totalAtRisk / 1000).toFixed(0)}K pipeline at risk
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {statsData.map((stat, index) => (
            <div
              key={index}
              className={`glass-card group interactive-hover transition-all duration-500 delay-${index * 100}`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${
                  stat.gradient === 'electric' ? 'bg-electric-500/20 shadow-glow' :
                  stat.gradient === 'neon' ? 'bg-neon-500/20 shadow-neon' :
                  'bg-purple-500/20 shadow-purple-glow'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.gradient === 'electric' ? 'text-electric-400' :
                    stat.gradient === 'neon' ? 'text-neon-400' :
                    'text-purple-400'
                  }`} />
                </div>
                <div className="relative overflow-hidden">
                  <div className="gradient-streak"></div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-dark-600 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${
                  stat.gradient === 'electric' ? 'electric-text' :
                  stat.gradient === 'neon' ? 'neon-text' :
                  'bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent'
                }`}>
                  {stat.value}
                </p>
                <p className="text-sm text-neon-400 mt-1">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lead Filters */}
        <div className={`glass-card mb-8 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative overflow-hidden">
            <div className="gradient-streak"></div>
            
            <div className="flex flex-wrap gap-6 items-center relative z-10">
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-electric-400" />
                <input
                  type="text"
                  placeholder="Search leads and companies..."
                  className="input-glass"
                />
              </div>
              
              <select 
                className="input-glass"
                value={filters.industry}
                onChange={(e) => setFilters({...filters, industry: e.target.value})}
              >
                <option value="">All Industries</option>
                <option value="Software">Software</option>
                <option value="SaaS">SaaS</option>
                <option value="Marketing">Marketing</option>
                <option value="Healthcare">Healthcare</option>
              </select>
              
              <select 
                className="input-glass"
                value={filters.company_size}
                onChange={(e) => setFilters({...filters, company_size: e.target.value})}
              >
                <option value="">All Company Sizes</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-dark-600">Lead Score:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => setFilters({...filters, minScore: e.target.value})}
                  className="w-24 accent-electric-500"
                />
                <span className="text-sm font-bold electric-text">{filters.minScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Neural Leads Table */}
        <div className={`glass-card transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Lead Performance</h2>
              <p className="text-dark-600">Conversion tracking and revenue attribution</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={exportLeads}
                className="btn-secondary text-sm group"
              >
                <BeakerIcon className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Export CSV
              </button>
              <button className="btn-secondary text-sm group">
                <CpuChipIcon className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
                Bulk Actions
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200/20">
                  <th className="text-left py-4 px-6 font-semibold text-dark-800">Lead Contact</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-800">Company</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-800">Score</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-800">Deal Value</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-800">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr 
                    key={lead.id} 
                    className={`border-b border-dark-100/10 hover:bg-dark-100/20 transition-all duration-300 group ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <td className="py-6 px-6">
                      <Link 
                        href={`/demo-dashboard/lead/${lead.id}`}
                        className="flex items-center space-x-4 cursor-pointer hover:bg-dark-100/10 rounded-lg p-2 -m-2 transition-all block"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-electric-gradient flex items-center justify-center shadow-glow">
                            <span className="text-white font-bold text-sm">
                              {lead.first_name[0]}{lead.last_name[0]}
                            </span>
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <div className="status-dot status-online"></div>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-dark-900 group-hover:gradient-text transition-all">
                            {lead.first_name} {lead.last_name}
                            <span className="text-xs ml-2 px-2 py-1 bg-electric-500/20 text-electric-400 rounded-full">
                              Premium Intel
                            </span>
                          </div>
                          <div className="text-sm text-dark-600">{lead.job_title}</div>
                          <div className="text-xs text-dark-500">{lead.email}</div>
                          {lead.ai_insights && (
                            <div className="text-xs text-electric-400 mt-1">
                              🧠 {lead.ai_insights}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-6 px-6">
                      <div>
                        <div className="font-semibold text-dark-900">{lead.company_name}</div>
                        <div className="text-sm text-dark-600">{lead.industry}</div>
                        <div className="text-xs text-dark-500">{lead.employee_count} employees</div>
                      </div>
                    </td>
                    
                    <td className="py-6 px-6">
                      <div className={`px-3 py-2 rounded-xl text-sm font-bold backdrop-blur-sm ${getScoreColor(lead.lead_score)}`}>
                        {lead.lead_score}/100
                      </div>
                    </td>
                    
                    <td className="py-6 px-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold neon-text mb-1">
                          ${(lead.deal_value / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-dark-600">
                          {lead.conversion_probability}% likely
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-6 px-6">
                      <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold capitalize backdrop-blur-sm ${getStatusColor(lead.status)}`}>
                        {lead.status === 'qualified' && <CheckCircleIcon className="w-4 h-4 mr-2" />}
                        {lead.status === 'new' && <ClockIcon className="w-4 h-4 mr-2" />}
                        {lead.status}
                      </span>
                    </td>
                    
                    <td className="py-6 px-6">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => copyLeadData(lead)}
                          className="p-2 rounded-lg bg-dark-100/30 text-electric-400 hover:bg-electric-500/20 hover:text-electric-300 transition-all interactive-hover" 
                          title="Copy Lead Data"
                        >
                          <BeakerIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg bg-dark-100/30 text-neon-400 hover:bg-neon-500/20 hover:text-neon-300 transition-all interactive-hover" title="Send Email">
                          <EnvelopeIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg bg-dark-100/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all interactive-hover" title="Schedule Call">
                          <PhoneIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Neural Pagination */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-dark-200/20">
            <div className="text-sm text-dark-600">
              Displaying <span className="electric-text font-semibold">1-3</span> of{' '}
              <span className="gradient-text font-semibold">{leads.length} leads</span>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm">← Previous Page</button>
              <button className="btn-secondary text-sm">Next Page →</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}