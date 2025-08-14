'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Line, Bar, Doughnut, Area } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import MetricsCards from '@/components/analytics/MetricsCards'
import ConversionFunnel from '@/components/analytics/ConversionFunnel'
import AIInsights from '@/components/competitive/AIInsights'
import RealTimeActivity from '@/components/competitive/RealTimeActivity'
import SmartAlerts from '@/components/competitive/SmartAlerts'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [compareMode, setCompareMode] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Call our analytics API
      const response = await fetch(`/api/analytics?userId=${user.id}&timeRange=${timeRange}&metric=overview`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        console.error('Analytics API error:', result.error)
      }
      
    } catch (error) {
      console.error('Analytics fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeadsAnalytics = async (userId, startDate, endDate) => {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const { data: previousLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())).toISOString())
      .lte('created_at', startDate.toISOString())

    return {
      total: leads?.length || 0,
      previousPeriod: previousLeads?.length || 0,
      qualified: leads?.filter(l => l.status === 'qualified').length || 0,
      contacted: leads?.filter(l => l.status === 'contacted').length || 0,
      converted: leads?.filter(l => l.status === 'converted').length || 0,
      averageScore: leads?.reduce((sum, l) => sum + (l.score || 0), 0) / (leads?.length || 1),
      topSources: getTopSources(leads),
      qualityDistribution: getQualityDistribution(leads)
    }
  }

  const fetchConversionsAnalytics = async (userId, startDate, endDate) => {
    const { data: conversions } = await supabase
      .from('leads')
      .select('*, landing_pages(*), email_sequences(*)')
      .eq('user_id', userId)
      .eq('status', 'converted')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    return {
      total: conversions?.length || 0,
      conversionRate: 0, // Will calculate with total leads
      averageTimeToConvert: calculateAverageTimeToConvert(conversions),
      conversionsBySource: getConversionsBySource(conversions),
      conversionFunnel: await getConversionFunnel(userId, startDate, endDate),
      topConvertingPages: getTopConvertingPages(conversions)
    }
  }

  const fetchEmailMetrics = async (userId, startDate, endDate) => {
    const { data: sequences } = await supabase
      .from('email_sequences')
      .select('*, email_opens(*), email_clicks(*)')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    return {
      sequencesStarted: sequences?.length || 0,
      totalEmails: sequences?.reduce((sum, s) => sum + (s.total_steps || 0), 0) || 0,
      openRate: calculateOpenRate(sequences),
      clickRate: calculateClickRate(sequences),
      unsubscribeRate: calculateUnsubscribeRate(sequences),
      sequencePerformance: getSequencePerformance(sequences),
      bestSendTimes: getBestSendTimes(sequences)
    }
  }

  const fetchLandingPageStats = async (userId, startDate, endDate) => {
    const { data: pages } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    return {
      totalPages: pages?.length || 0,
      totalViews: pages?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
      totalConversions: pages?.reduce((sum, p) => sum + (p.conversions || 0), 0) || 0,
      averageConversionRate: calculateAverageConversionRate(pages),
      topPerformingPages: getTopPerformingPages(pages),
      pagesByTemplate: getPagesByTemplate(pages)
    }
  }

  const fetchRevenueData = async (userId, startDate, endDate) => {
    // Mock revenue calculation based on conversions and tier
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_tiers(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    const revenuePerLead = {
      'starter': 50,
      'growth': 150, 
      'scale': 300,
      'enterprise': 500
    }

    const tierName = subscription?.subscription_tiers?.name?.toLowerCase() || 'starter'
    const leadValue = revenuePerLead[tierName] || 50

    return {
      estimatedRevenue: (data?.conversions?.total || 0) * leadValue,
      revenuePerLead: leadValue,
      projectedMonthly: 0, // Will calculate based on trends
      roi: 0 // Return on investment calculation
    }
  }

  const fetchIndustryBreakdown = async (userId, startDate, endDate) => {
    const { data: leads } = await supabase
      .from('leads')
      .select('industry, status')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    return getIndustryBreakdown(leads)
  }

  const fetchSourcePerformance = async (userId, startDate, endDate) => {
    const { data: leads } = await supabase
      .from('leads')
      .select('source, status, score')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    return getSourcePerformance(leads)
  }

  const fetchTimeSeriesData = async (userId, startDate, endDate) => {
    const { data: leads } = await supabase
      .from('leads')
      .select('created_at, status')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    return generateTimeSeriesData(leads, startDate, endDate)
  }

  // Helper functions
  const getTopSources = (leads) => {
    const sources = {}
    leads?.forEach(lead => {
      sources[lead.source] = (sources[lead.source] || 0) + 1
    })
    return Object.entries(sources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }))
  }

  const getQualityDistribution = (leads) => {
    const distribution = { high: 0, medium: 0, low: 0 }
    leads?.forEach(lead => {
      const score = lead.score || 0
      if (score >= 80) distribution.high++
      else if (score >= 60) distribution.medium++
      else distribution.low++
    })
    return distribution
  }

  const calculateAverageTimeToConvert = (conversions) => {
    if (!conversions?.length) return 0
    
    const times = conversions.map(c => {
      const created = new Date(c.created_at)
      const updated = new Date(c.updated_at)
      return (updated - created) / (1000 * 60 * 60 * 24) // days
    })
    
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  const getConversionsBySource = (conversions) => {
    const sources = {}
    conversions?.forEach(conv => {
      sources[conv.source] = (sources[conv.source] || 0) + 1
    })
    return sources
  }

  const getConversionFunnel = async (userId, startDate, endDate) => {
    const { data: leads } = await supabase
      .from('leads')
      .select('status')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const funnel = {
      cold: 0,
      contacted: 0,
      qualified: 0,
      converted: 0
    }

    leads?.forEach(lead => {
      funnel[lead.status] = (funnel[lead.status] || 0) + 1
    })

    return funnel
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const growthRate = data?.overview?.growthRate || 0
  const conversionRate = data?.overview?.conversionRate || 0

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">Track your lead generation performance and ROI</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              compareMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Compare Periods
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <MetricsCards data={data} loading={loading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Generation Trend */}
        <ChartCard title="Lead Generation Trend">
          <Line 
            data={getLeadTrendData(data?.timeSeries)}
            options={chartOptions}
          />
        </ChartCard>

        {/* Conversion Funnel */}
        <ConversionFunnel data={data} loading={loading} />

        {/* Lead Sources */}
        <ChartCard title="Lead Sources">
          <Doughnut 
            data={getSourcesData(data?.leads?.topSources)}
            options={doughnutOptions}
          />
        </ChartCard>

        {/* Email Performance */}
        <ChartCard title="Email Performance">
          <Area
            data={getEmailPerformanceData(data?.email)}
            options={areaOptions}
          />
        </ChartCard>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Pages */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Top Landing Pages</h3>
          <div className="space-y-4">
            {data?.landingPages?.topPerformingPages?.slice(0, 5).map((page, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{page.template}</p>
                  <p className="text-gray-400 text-sm">{page.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{page.conversionRate}%</p>
                  <p className="text-gray-400 text-sm">{page.conversions} conversions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Industry Performance</h3>
          <div className="space-y-4">
            {data?.industry?.map((industry, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium capitalize">{industry.name}</p>
                  <p className="text-gray-400 text-sm">{industry.leads} leads</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">{industry.conversionRate}%</p>
                  <p className="text-gray-400 text-sm">Avg score: {industry.avgScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitive Advantage Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insights */}
        <AIInsights data={data} timeRange={timeRange} />
        
        {/* Smart Alerts */}
        <SmartAlerts data={data} />
      </div>

      {/* Real-Time Activity */}
      <RealTimeActivity />
    </div>
  )
}

// Helper Components
function MetricCard({ title, value, change, icon }) {
  const isPositive = change >= 0
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className={`text-sm flex items-center ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositive ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{title}</div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>
      <div className="h-64">
        {children}
      </div>
    </div>
  )
}

// Chart data generators and options would be defined here
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: 'white' }
    }
  },
  scales: {
    x: { ticks: { color: 'white' } },
    y: { ticks: { color: 'white' } }
  }
}

const funnelOptions = { ...chartOptions }
const doughnutOptions = { ...chartOptions }
const areaOptions = { ...chartOptions }

// Mock data generators
const getLeadTrendData = () => ({
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [{
    label: 'Leads Generated',
    data: [12, 19, 15, 25],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    fill: true
  }]
})

const getFunnelData = () => ({
  labels: ['Cold Leads', 'Contacted', 'Qualified', 'Converted'],
  datasets: [{
    label: 'Leads',
    data: [100, 75, 45, 12],
    backgroundColor: ['#374151', '#6B7280', '#9CA3AF', '#10B981']
  }]
})

const getSourcesData = () => ({
  labels: ['Apollo', 'LinkedIn', 'Website', 'Referral'],
  datasets: [{
    data: [45, 30, 15, 10],
    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
  }]
})

const getEmailPerformanceData = () => ({
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [{
    label: 'Open Rate',
    data: [45, 52, 48, 61],
    borderColor: 'rgb(16, 185, 129)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    fill: true
  }]
})