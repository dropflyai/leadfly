'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CursorArrowRaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  BoltIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ArrowLeftIcon,
  ShareIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

// Sample lead data (same as demo dashboard)
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

export default function LeadDetailPage({ params }) {
  const router = useRouter()
  const [lead, setLead] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsLoaded(true)
    
    // Find lead by ID
    const leadId = parseInt(params.id)
    const foundLead = sampleLeads.find(l => l.id === leadId)
    setLead(foundLead)
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [params.id])

  const copyLeadData = () => {
    if (!lead) return
    
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-electric-400 bg-electric-500/20'
      case 'contacted': return 'text-yellow-400 bg-yellow-500/20'
      case 'qualified': return 'text-neon-400 bg-neon-500/20'
      case 'closed': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-dark-500 bg-dark-200/20'
    }
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-dark-50 text-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-800 mb-4">Lead Not Found</h1>
          <Link href="/demo-dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

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
              <Link href="/demo-dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeftIcon className="w-5 h-5 text-electric-400" />
                <span className="text-dark-600">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={copyLeadData}
                className="btn-secondary text-sm group"
              >
                <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                Copy Lead Data
              </button>
              <button className="btn-secondary text-sm group">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share Lead
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        {/* Lead Header */}
        <div className={`glass-card mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-electric-gradient flex items-center justify-center shadow-glow">
                  <span className="text-white font-bold text-2xl">
                    {lead.first_name[0]}{lead.last_name[0]}
                  </span>
                </div>
                <div className="absolute -top-2 -right-2">
                  <div className="status-dot status-online"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">
                  {lead.first_name} {lead.last_name}
                </h1>
                <p className="text-xl text-dark-700 mb-2">
                  {lead.job_title} at {lead.company_name}
                </p>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold capitalize backdrop-blur-sm ${getStatusColor(lead.status)}`}>
                    {lead.status === 'qualified' && <CheckCircleIcon className="w-4 h-4 mr-2" />}
                    {lead.status === 'new' && <ClockIcon className="w-4 h-4 mr-2" />}
                    {lead.status}
                  </span>
                  <span className="text-sm text-dark-600">
                    Score: <span className="font-bold electric-text">{lead.lead_score}/100</span>
                  </span>
                  <span className="text-sm text-dark-600">
                    Deal Value: <span className="font-bold neon-text">${(lead.deal_value / 1000).toFixed(0)}K</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold electric-text mb-1">
                {lead.conversion_probability}%
              </div>
              <div className="text-sm text-dark-600">Conversion Probability</div>
              <div className="text-sm text-dark-600 mt-2">
                Expected Close: <span className="font-semibold">{new Date(lead.predicted_close_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`glass-card mb-8 transition-all duration-1000 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-lg font-semibold mb-4 text-dark-800">Quick Actions</h3>
          <div className="flex space-x-4">
            <button className="btn-primary group">
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              Send Email
            </button>
            <button className="btn-secondary group">
              <PhoneIcon className="w-5 h-5 mr-2" />
              Schedule Call
            </button>
            <button className="btn-secondary group">
              <CpuChipIcon className="w-5 h-5 mr-2" />
              View Full Profile
            </button>
            <div className="flex-1 bg-electric-500/10 p-3 rounded-lg">
              <div className="text-sm font-semibold electric-text mb-1">Next Best Action</div>
              <div className="text-sm text-dark-700">{lead.next_best_action}</div>
            </div>
          </div>
        </div>

        {/* Premium Intelligence Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Contact Information */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 gradient-text flex items-center">
              <UserGroupIcon className="w-6 h-6 mr-2" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-600">Email:</span>
                <span className="font-semibold">{lead.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Phone:</span>
                <span className="font-semibold">{lead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Mobile:</span>
                <span className="font-semibold">{lead.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">LinkedIn:</span>
                <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:text-electric-300">
                  View Profile
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Timezone:</span>
                <span className="font-semibold">{lead.timezone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Lead Source:</span>
                <span className="font-semibold">{lead.lead_source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Last Contacted:</span>
                <span className="font-semibold">{new Date(lead.last_contacted).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 gradient-text flex items-center">
              <CpuChipIcon className="w-6 h-6 mr-2" />
              Company Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-600">Company:</span>
                <span className="font-semibold">{lead.company_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Website:</span>
                <a href={lead.company_website} target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:text-electric-300">
                  {lead.company_website}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Industry:</span>
                <span className="font-semibold">{lead.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Employees:</span>
                <span className="font-semibold">{lead.employee_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Revenue:</span>
                <span className="font-semibold">{lead.company_revenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Address:</span>
                <span className="font-semibold text-sm">{lead.company_address}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-dark-200/20">
                <p className="text-sm text-dark-600 mb-2">Technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {lead.technologies?.map((tech, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-neon-500/20 text-neon-400 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Intelligence */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 gradient-text flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2" />
              Financial Intelligence
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-600">Annual Revenue:</span>
                <span className="font-semibold">{lead.financialHealth?.revenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Growth Rate:</span>
                <span className="font-semibold text-neon-400">{lead.financialHealth?.growth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Profitability:</span>
                <span className="font-semibold">{lead.financialHealth?.profitability}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Funding Stage:</span>
                <span className="font-semibold">{lead.financialHealth?.fundingStage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Last Funding:</span>
                <span className="font-semibold">{lead.financialHealth?.lastFunding}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Credit Rating:</span>
                <span className="font-semibold electric-text">{lead.financialHealth?.creditRating}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-dark-200/20">
                <p className="text-sm text-dark-600 mb-2">Key Investors:</p>
                <div className="flex flex-wrap gap-2">
                  {lead.financialHealth?.investors?.map((investor, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-electric-500/20 text-electric-400 rounded-full">
                      {investor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Organizational Intelligence */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 gradient-text flex items-center">
              <UserGroupIcon className="w-6 h-6 mr-2" />
              Organizational Intelligence
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-600">Total Employees:</span>
                <span className="font-semibold">{lead.organizationalIntel?.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Recent Hires:</span>
                <span className="font-semibold text-neon-400">+{lead.organizationalIntel?.recentHires}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Reports To:</span>
                <span className="font-semibold">{lead.organizationalIntel?.reportingStructure?.reportsTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Direct Reports:</span>
                <span className="font-semibold">{lead.organizationalIntel?.reportingStructure?.directReports}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Team Size:</span>
                <span className="font-semibold">{lead.organizationalIntel?.reportingStructure?.teamSize}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-dark-200/20">
                <p className="text-sm text-dark-600 mb-2">Department Growth:</p>
                <div className="space-y-2">
                  {lead.organizationalIntel?.departments?.map((dept, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{dept.name}: {dept.size}</span>
                      <span className="text-neon-400">{dept.growth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Intent & Buying Signals */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 gradient-text flex items-center">
              <RocketLaunchIcon className="w-6 h-6 mr-2" />
              Intent & Buying Signals
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-2">Recent Activity:</p>
                <ul className="space-y-1">
                  {lead.intentSignals?.recentActivity?.map((activity, idx) => (
                    <li key={idx} className="text-sm text-dark-600 flex items-start">
                      <span className="w-2 h-2 bg-electric-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-2">Buying Signals:</p>
                <ul className="space-y-1">
                  {lead.intentSignals?.buyingSignals?.map((signal, idx) => (
                    <li key={idx} className="text-sm text-neon-400 flex items-start">
                      <CheckIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-dark-200/20">
                <div className="flex justify-between mb-2">
                  <span className="text-dark-600">Timeline:</span>
                  <span className="font-semibold text-purple-400">{lead.intentSignals?.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600">Budget:</span>
                  <span className="font-semibold electric-text">{lead.intentSignals?.budget}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Competitive Intelligence */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 gradient-text flex items-center">
              <BeakerIcon className="w-6 h-6 mr-2" />
              Competitive Intelligence
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-2">Current Tech Stack:</p>
                <div className="flex flex-wrap gap-2">
                  {lead.competitiveIntel?.currentTools?.map((tool, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-2">Pain Points:</p>
                <ul className="space-y-1">
                  {lead.competitiveIntel?.painPoints?.map((pain, idx) => (
                    <li key={idx} className="text-sm text-red-400 flex items-start">
                      <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-2">Evaluating:</p>
                <div className="flex flex-wrap gap-2">
                  {lead.competitiveIntel?.competitorEvaluations?.map((comp, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-2">Contract Renewals:</p>
                {lead.competitiveIntel?.contractRenewals?.map((contract, idx) => (
                  <div key={idx} className="text-sm text-dark-600">
                    {contract.vendor}: {contract.expires} ({contract.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social & News Intelligence */}
          <div className="glass-card lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 gradient-text flex items-center">
              <GlobeAltIcon className="w-6 h-6 mr-2" />
              Social & News Intelligence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Social Activity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-dark-600">LinkedIn Activity:</span>
                    <span className="font-semibold">{lead.socialIntel?.linkedinActivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600">Engagement:</span>
                    <span className="font-semibold text-neon-400">{lead.socialIntel?.contentEngagement}</span>
                  </div>
                  <div>
                    <p className="text-sm text-dark-600 mb-2">Recent Posts:</p>
                    <div className="space-y-2">
                      {lead.socialIntel?.recentPosts?.map((post, idx) => (
                        <div key={idx} className="text-sm italic text-dark-700 border-l-2 border-electric-500/20 pl-3">
                          "{post}"
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-dark-600 mb-2">Influencer Network:</p>
                    <div className="flex flex-wrap gap-2">
                      {lead.socialIntel?.influencerNetwork?.map((influencer, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-neon-500/20 text-neon-400 rounded-full">
                          {influencer}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">News & Events</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-dark-600 mb-2">Recent Company News:</p>
                    <ul className="space-y-1">
                      {lead.newsIntel?.recentNews?.map((news, idx) => (
                        <li key={idx} className="text-sm text-dark-700">
                          • {news}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600">Upcoming Events:</span>
                    <span className="font-semibold text-purple-400">{lead.newsIntel?.marketEvents}</span>
                  </div>
                  <div>
                    <p className="text-sm text-dark-600 mb-1">Industry Trends:</p>
                    <p className="text-sm text-dark-700">{lead.newsIntel?.industryTrends}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass-card lg:col-span-2 border-2 border-electric-500/30">
            <h3 className="text-xl font-bold mb-4 gradient-text flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-2" />
              AI-Powered Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-electric-500/10 p-4 rounded-lg">
                <h4 className="font-semibold electric-text mb-2">Next Best Action</h4>
                <p className="text-sm text-dark-700">{lead.next_best_action}</p>
                <p className="text-xs text-electric-400 mt-2">Optimal timing: Within 48 hours</p>
              </div>
              <div className="bg-neon-500/10 p-4 rounded-lg">
                <h4 className="font-semibold neon-text mb-2">Talking Points</h4>
                <ul className="text-sm text-dark-700 space-y-1">
                  <li>• Reference their recent funding round</li>
                  <li>• Discuss scaling challenges they're facing</li>
                  <li>• Mention competitive landscape insights</li>
                </ul>
              </div>
              <div className="bg-purple-500/10 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-400 mb-2">Risk Factors</h4>
                <ul className="text-sm text-dark-700 space-y-1">
                  <li>• Budget cycle timing considerations</li>
                  <li>• Multiple vendor evaluation process</li>
                  <li>• Decision committee involvement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notes & History */}
          <div className="glass-card lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 gradient-text">Notes & Interaction History</h3>
            <div className="space-y-4">
              <div className="bg-dark-100/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current Notes</h4>
                <p className="text-dark-700">{lead.notes}</p>
              </div>
              <div className="bg-dark-100/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">AI Insights</h4>
                <p className="text-dark-700">{lead.ai_insights}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Upsell Banner */}
        <div className={`mt-8 bg-gradient-to-r from-electric-500/10 to-purple-500/10 p-6 rounded-lg border border-electric-500/20 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg gradient-text">🚀 Premium Intelligence Active</h4>
              <p className="text-dark-600 mt-1">
                This comprehensive research report would typically cost $200+ per lead from other providers.
                LeadFly AI Premium subscribers get unlimited access to enterprise-grade intelligence.
              </p>
            </div>
            <button className="btn-primary ml-6 whitespace-nowrap">
              Upgrade Team Access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}