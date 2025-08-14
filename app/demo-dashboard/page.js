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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid'
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

  // Sample lead data with enhanced properties
  const sampleLeads = [
    {
      id: 1,
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'sarah.chen@techcorp.com',
      company_name: 'TechCorp Inc',
      job_title: 'VP of Sales',
      industry: 'Software',
      lead_score: 92,
      company_size: '51-200',
      phone: '+1-555-0123',
      status: 'new',
      created_at: '2025-01-13T10:30:00Z',
      ai_insights: 'Decision maker with budget authority. Company actively hiring.',
      intent_signals: ['job_posting', 'tech_stack_change', 'funding_round'],
      conversion_probability: 92,
      predicted_close_date: '2025-01-20',
      next_best_action: 'Schedule discovery call',
      engagement_likelihood: 'Very High',
      deal_value: 45000
    },
    {
      id: 2,
      first_name: 'Marcus',
      last_name: 'Johnson',
      email: 'marcus@growthco.com',
      company_name: 'GrowthCo',
      job_title: 'CEO',
      industry: 'Marketing',
      lead_score: 88,
      company_size: '11-50',
      phone: '+1-555-0124',
      status: 'contacted',
      created_at: '2025-01-13T09:15:00Z',
      ai_insights: 'CEO looking for growth solutions. High budget allocation.',
      intent_signals: ['competitor_research', 'solution_search'],
      conversion_probability: 78,
      predicted_close_date: '2025-01-28',
      next_best_action: 'Send ROI case study',
      engagement_likelihood: 'High',
      deal_value: 28000
    },
    {
      id: 3,
      first_name: 'Lisa',
      last_name: 'Rodriguez',
      email: 'l.rodriguez@scaleinc.com',
      company_name: 'Scale Inc',
      job_title: 'Director of Marketing',
      industry: 'SaaS',
      lead_score: 85,
      company_size: '201-500',
      phone: '+1-555-0125',
      status: 'qualified',
      created_at: '2025-01-13T08:45:00Z',
      ai_insights: 'Marketing director with expanding team. Budget approved.',
      intent_signals: ['hiring_spree', 'competitor_analysis'],
      conversion_probability: 85,
      predicted_close_date: '2025-01-25',
      next_best_action: 'Send custom proposal',
      engagement_likelihood: 'Very High',
      deal_value: 38000
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
              <button className="btn-secondary text-sm group">
                <BeakerIcon className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Export Report
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
                  <th className="text-left py-4 px-6 font-semibold text-dark-800">Revenue Potential</th>
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
                      <div className="flex items-center space-x-4">
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
                        <div className="text-xs text-dark-500">{lead.company_size} entities</div>
                        {lead.intent_signals && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lead.intent_signals.slice(0, 2).map((signal, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-neon-500/20 text-neon-400 rounded-full">
                                {signal.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-2 rounded-xl text-sm font-bold backdrop-blur-sm ${getScoreColor(lead.lead_score)}`}>
                          {lead.lead_score}/100
                        </div>
                        <div className="w-16 h-2 bg-dark-200/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-electric-gradient transition-all duration-500"
                            style={{ width: `${lead.lead_score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-6 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            lead.conversion_probability >= 85 ? 'bg-neon-400 shadow-neon' :
                            lead.conversion_probability >= 70 ? 'bg-electric-400 shadow-glow' :
                            'bg-purple-400 shadow-purple-glow'
                          }`}></div>
                          <span className="text-xs font-semibold text-dark-700">
                            {lead.conversion_probability}% conversion
                          </span>
                        </div>
                        <div className="text-xs text-dark-600">
                          Close: {new Date(lead.predicted_close_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-electric-400 font-medium">
                          {lead.next_best_action}
                        </div>
                        {lead.deal_value && (
                          <div className="text-xs text-neon-400 font-semibold">
                            ${(lead.deal_value / 1000).toFixed(0)}K value
                          </div>
                        )}
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
                        <button className="p-2 rounded-lg bg-dark-100/30 text-electric-400 hover:bg-electric-500/20 hover:text-electric-300 transition-all interactive-hover" title="Send Email">
                          <EnvelopeIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg bg-dark-100/30 text-neon-400 hover:bg-neon-500/20 hover:text-neon-300 transition-all interactive-hover" title="Schedule Call">
                          <PhoneIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg bg-dark-100/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all interactive-hover" title="View Profile">
                          <CpuChipIcon className="w-5 h-5" />
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