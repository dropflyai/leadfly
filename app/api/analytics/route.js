import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const userId = searchParams.get('userId')
    const metric = searchParams.get('metric') || 'overview'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching analytics data for user:', userId, 'range:', timeRange)

    const endDate = new Date()
    const startDate = new Date()
    
    switch(timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Comprehensive analytics data fetching
    const analytics = await fetchComprehensiveAnalytics(userId, startDate, endDate, metric)

    console.log('✅ Analytics data fetched successfully')

    return NextResponse.json({
      success: true,
      data: analytics,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        range: timeRange
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Analytics API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

async function fetchComprehensiveAnalytics(userId, startDate, endDate, metric) {
  try {
    switch(metric) {
      case 'overview':
        return await fetchOverviewAnalytics(userId, startDate, endDate)
      case 'conversion':
        return await fetchConversionAnalytics(userId, startDate, endDate)
      case 'email':
        return await fetchEmailAnalytics(userId, startDate, endDate)
      case 'sources':
        return await fetchSourceAnalytics(userId, startDate, endDate)
      case 'revenue':
        return await fetchRevenueAnalytics(userId, startDate, endDate)
      case 'realtime':
        return await fetchRealtimeAnalytics(userId)
      default:
        return await fetchOverviewAnalytics(userId, startDate, endDate)
    }
  } catch (error) {
    console.error('Analytics fetch error:', error)
    throw error
  }
}

async function fetchOverviewAnalytics(userId, startDate, endDate) {
  // Get basic lead metrics
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get previous period for comparison
  const prevStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
  const { data: previousLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', prevStartDate.toISOString())
    .lte('created_at', startDate.toISOString())

  // Get subscription info for tier-specific insights
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_tiers(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  // Lead status breakdown
  const statusBreakdown = {
    cold: leads?.filter(l => l.status === 'cold').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    qualified: leads?.filter(l => l.status === 'qualified').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0
  }

  // Quality distribution
  const qualityBreakdown = {
    high: leads?.filter(l => (l.score || 0) >= 80).length || 0,
    medium: leads?.filter(l => (l.score || 0) >= 60 && (l.score || 0) < 80).length || 0,
    low: leads?.filter(l => (l.score || 0) < 60).length || 0
  }

  // Top sources
  const sourceStats = getSourceStatistics(leads)
  
  // Industry breakdown
  const industryStats = getIndustryStatistics(leads)

  // Time series data for charts
  const timeSeriesData = generateTimeSeriesData(leads, startDate, endDate)

  // Performance calculations
  const totalLeads = leads?.length || 0
  const previousTotal = previousLeads?.length || 0
  const growthRate = previousTotal > 0 ? ((totalLeads - previousTotal) / previousTotal * 100) : 0
  
  const conversionRate = totalLeads > 0 ? (statusBreakdown.converted / totalLeads * 100) : 0
  const averageScore = totalLeads > 0 ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / totalLeads : 0

  // Advanced metrics
  const leadVelocity = calculateLeadVelocity(leads)
  const predictedPerformance = predictNextPeriodPerformance(timeSeriesData, subscription)
  
  return {
    overview: {
      totalLeads,
      growthRate,
      conversionRate,
      averageScore,
      leadVelocity
    },
    breakdown: {
      status: statusBreakdown,
      quality: qualityBreakdown,
      sources: sourceStats,
      industries: industryStats
    },
    trends: {
      timeSeries: timeSeriesData,
      predicted: predictedPerformance
    },
    comparison: {
      previousPeriod: {
        totalLeads: previousTotal,
        growthRate: 0 // Could calculate further back
      }
    },
    subscription: {
      tier: subscription?.subscription_tiers?.name || 'starter',
      limitsUsed: {
        leads: totalLeads,
        maxLeads: subscription?.subscription_tiers?.monthly_leads || 50
      }
    }
  }
}

async function fetchConversionAnalytics(userId, startDate, endDate) {
  // Get conversion funnel data
  const { data: leads } = await supabase
    .from('leads')
    .select('*, landing_pages(*), email_sequences(*)')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get landing page performance
  const { data: landingPages } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const conversionFunnel = buildConversionFunnel(leads)
  const pagePerformance = analyzeLandingPagePerformance(landingPages)
  const conversionPaths = analyzeConversionPaths(leads)
  const timeToConvert = calculateTimeToConvert(leads.filter(l => l.status === 'converted'))

  return {
    funnel: conversionFunnel,
    landingPages: pagePerformance,
    paths: conversionPaths,
    timing: {
      averageTimeToConvert: timeToConvert,
      fastestConversion: Math.min(...timeToConvert) || 0,
      slowestConversion: Math.max(...timeToConvert) || 0
    },
    optimization: generateOptimizationSuggestions(conversionFunnel, pagePerformance)
  }
}

async function fetchEmailAnalytics(userId, startDate, endDate) {
  // Get email sequence data
  const { data: sequences } = await supabase
    .from('email_sequences')
    .select('*, email_opens(*), email_clicks(*)')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const emailMetrics = calculateEmailMetrics(sequences)
  const sequencePerformance = analyzeSequencePerformance(sequences)
  const engagement = calculateEngagementMetrics(sequences)
  const timing = analyzeSendTiming(sequences)

  return {
    overview: emailMetrics,
    sequences: sequencePerformance,
    engagement: engagement,
    timing: timing,
    recommendations: generateEmailRecommendations(emailMetrics, sequencePerformance)
  }
}

async function fetchSourceAnalytics(userId, startDate, endDate) {
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const sourcePerformance = analyzeSourcePerformance(leads)
  const costAnalysis = calculateSourceCosts(sourcePerformance)
  const roi = calculateSourceROI(sourcePerformance, costAnalysis)

  return {
    performance: sourcePerformance,
    costs: costAnalysis,
    roi: roi,
    recommendations: generateSourceRecommendations(sourcePerformance, roi)
  }
}

async function fetchRevenueAnalytics(userId, startDate, endDate) {
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_tiers(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  const { data: conversions } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'converted')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const revenueMetrics = calculateRevenueMetrics(conversions, subscription)
  const projections = generateRevenueProjections(revenueMetrics)
  const ltv = calculateCustomerLifetimeValue(conversions, subscription)

  return {
    current: revenueMetrics,
    projections: projections,
    ltv: ltv,
    growth: calculateRevenueGrowth(revenueMetrics)
  }
}

async function fetchRealtimeAnalytics(userId) {
  // Get last 24 hours of activity
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', last24h.toISOString())
    .order('created_at', { ascending: false })

  const { data: recentActivity } = await supabase
    .from('landing_pages')
    .select('views, conversions, created_at')
    .eq('user_id', userId)
    .gte('updated_at', last24h.toISOString())

  return {
    lastHour: recentLeads?.filter(l => 
      new Date(l.created_at) > new Date(Date.now() - 60 * 60 * 1000)
    ).length || 0,
    last24Hours: recentLeads?.length || 0,
    activePages: recentActivity?.length || 0,
    currentVelocity: calculateCurrentVelocity(recentLeads),
    alerts: generateRealTimeAlerts(recentLeads, recentActivity)
  }
}

// Helper Functions

function getSourceStatistics(leads) {
  const sources = {}
  leads?.forEach(lead => {
    if (!sources[lead.source]) {
      sources[lead.source] = {
        count: 0,
        conversions: 0,
        totalScore: 0
      }
    }
    sources[lead.source].count++
    sources[lead.source].totalScore += lead.score || 0
    if (lead.status === 'converted') {
      sources[lead.source].conversions++
    }
  })

  return Object.entries(sources).map(([source, stats]) => ({
    source,
    leads: stats.count,
    conversions: stats.conversions,
    conversionRate: stats.count > 0 ? (stats.conversions / stats.count * 100) : 0,
    averageScore: stats.count > 0 ? (stats.totalScore / stats.count) : 0
  })).sort((a, b) => b.leads - a.leads)
}

function getIndustryStatistics(leads) {
  const industries = {}
  leads?.forEach(lead => {
    const industry = lead.industry || 'Unknown'
    if (!industries[industry]) {
      industries[industry] = {
        count: 0,
        conversions: 0,
        totalScore: 0
      }
    }
    industries[industry].count++
    industries[industry].totalScore += lead.score || 0
    if (lead.status === 'converted') {
      industries[industry].conversions++
    }
  })

  return Object.entries(industries).map(([industry, stats]) => ({
    industry,
    leads: stats.count,
    conversions: stats.conversions,
    conversionRate: stats.count > 0 ? (stats.conversions / stats.count * 100) : 0,
    averageScore: stats.count > 0 ? (stats.totalScore / stats.count) : 0
  })).sort((a, b) => b.leads - a.leads)
}

function generateTimeSeriesData(leads, startDate, endDate) {
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  const series = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dayLeads = leads?.filter(lead => {
      const leadDate = new Date(lead.created_at)
      return leadDate.toDateString() === date.toDateString()
    }) || []
    
    series.push({
      date: date.toISOString().split('T')[0],
      leads: dayLeads.length,
      conversions: dayLeads.filter(l => l.status === 'converted').length,
      averageScore: dayLeads.length > 0 
        ? dayLeads.reduce((sum, l) => sum + (l.score || 0), 0) / dayLeads.length 
        : 0
    })
  }
  
  return series
}

function calculateLeadVelocity(leads) {
  if (!leads?.length) return 0
  
  const sortedLeads = leads.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const firstLead = new Date(sortedLeads[0].created_at)
  const lastLead = new Date(sortedLeads[sortedLeads.length - 1].created_at)
  const daysSpan = (lastLead - firstLead) / (1000 * 60 * 60 * 24)
  
  return daysSpan > 0 ? leads.length / daysSpan : 0
}

function predictNextPeriodPerformance(timeSeriesData, subscription) {
  if (!timeSeriesData?.length) return { leads: 0, confidence: 0 }
  
  const recentData = timeSeriesData.slice(-7) // Last 7 days
  const avgDaily = recentData.reduce((sum, day) => sum + day.leads, 0) / recentData.length
  
  // Simple trend calculation
  const trend = recentData.length > 1 
    ? (recentData[recentData.length - 1].leads - recentData[0].leads) / recentData.length
    : 0
  
  const predictedDaily = avgDaily + trend
  const predictedMonthly = predictedDaily * 30
  
  // Confidence based on data consistency
  const variance = recentData.reduce((sum, day) => 
    sum + Math.pow(day.leads - avgDaily, 2), 0
  ) / recentData.length
  const confidence = Math.max(0, Math.min(100, 100 - variance * 10))
  
  return {
    daily: Math.max(0, predictedDaily),
    monthly: Math.max(0, predictedMonthly),
    confidence: confidence,
    tier: subscription?.subscription_tiers?.name || 'starter'
  }
}

function buildConversionFunnel(leads) {
  const funnel = {
    total: leads?.length || 0,
    cold: leads?.filter(l => l.status === 'cold').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    qualified: leads?.filter(l => l.status === 'qualified').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0
  }
  
  const total = funnel.total
  return {
    ...funnel,
    rates: {
      contactRate: total > 0 ? (funnel.contacted / total * 100) : 0,
      qualificationRate: funnel.contacted > 0 ? (funnel.qualified / funnel.contacted * 100) : 0,
      conversionRate: funnel.qualified > 0 ? (funnel.converted / funnel.qualified * 100) : 0,
      overallConversionRate: total > 0 ? (funnel.converted / total * 100) : 0
    }
  }
}

function analyzeLandingPagePerformance(pages) {
  if (!pages?.length) return []
  
  return pages.map(page => ({
    id: page.id,
    slug: page.slug,
    template: page.template,
    views: page.views || 0,
    conversions: page.conversions || 0,
    conversionRate: page.views > 0 ? (page.conversions / page.views * 100) : 0,
    createdAt: page.created_at
  })).sort((a, b) => b.conversionRate - a.conversionRate)
}

function analyzeConversionPaths(leads) {
  const paths = {}
  
  leads?.forEach(lead => {
    if (lead.status === 'converted') {
      const path = `${lead.source} → ${lead.industry || 'Unknown'}`
      paths[path] = (paths[path] || 0) + 1
    }
  })
  
  return Object.entries(paths)
    .map(([path, count]) => ({ path, conversions: count }))
    .sort((a, b) => b.conversions - a.conversions)
}

function calculateTimeToConvert(convertedLeads) {
  return convertedLeads?.map(lead => {
    const created = new Date(lead.created_at)
    const updated = new Date(lead.updated_at)
    return (updated - created) / (1000 * 60 * 60 * 24) // days
  }) || []
}

function generateOptimizationSuggestions(funnel, pagePerformance) {
  const suggestions = []
  
  if (funnel.rates.contactRate < 50) {
    suggestions.push({
      type: 'contact_rate',
      message: 'Low contact rate detected. Consider improving lead qualification criteria.',
      impact: 'high'
    })
  }
  
  if (funnel.rates.conversionRate < 20) {
    suggestions.push({
      type: 'conversion_rate',
      message: 'Conversion rate could be improved. A/B test your email sequences.',
      impact: 'medium'
    })
  }
  
  const lowPerformingPages = pagePerformance.filter(p => p.conversionRate < 5)
  if (lowPerformingPages.length > 0) {
    suggestions.push({
      type: 'landing_pages',
      message: `${lowPerformingPages.length} landing pages have low conversion rates. Review content and CTAs.`,
      impact: 'medium'
    })
  }
  
  return suggestions
}

function calculateEmailMetrics(sequences) {
  if (!sequences?.length) return { openRate: 0, clickRate: 0, unsubscribeRate: 0 }
  
  let totalOpens = 0
  let totalClicks = 0
  let totalSent = 0
  let totalUnsubscribes = 0
  
  sequences.forEach(seq => {
    totalSent += seq.total_steps || 0
    totalOpens += seq.email_opens?.length || 0
    totalClicks += seq.email_clicks?.length || 0
    // Unsubscribes would be tracked similarly
  })
  
  return {
    openRate: totalSent > 0 ? (totalOpens / totalSent * 100) : 0,
    clickRate: totalOpens > 0 ? (totalClicks / totalOpens * 100) : 0,
    unsubscribeRate: 0.5, // Mock data
    totalSequences: sequences.length,
    totalEmailsSent: totalSent
  }
}

function analyzeSequencePerformance(sequences) {
  const performance = {}
  
  sequences?.forEach(seq => {
    const type = seq.sequence_type || 'unknown'
    if (!performance[type]) {
      performance[type] = {
        count: 0,
        totalOpens: 0,
        totalClicks: 0,
        totalSteps: 0
      }
    }
    
    performance[type].count++
    performance[type].totalSteps += seq.total_steps || 0
    performance[type].totalOpens += seq.email_opens?.length || 0
    performance[type].totalClicks += seq.email_clicks?.length || 0
  })
  
  return Object.entries(performance).map(([type, stats]) => ({
    sequenceType: type,
    sequences: stats.count,
    openRate: stats.totalSteps > 0 ? (stats.totalOpens / stats.totalSteps * 100) : 0,
    clickRate: stats.totalOpens > 0 ? (stats.totalClicks / stats.totalOpens * 100) : 0
  }))
}

function calculateEngagementMetrics(sequences) {
  // Mock engagement calculation
  return {
    highEngagement: sequences?.filter(s => (s.email_opens?.length || 0) > 3).length || 0,
    mediumEngagement: sequences?.filter(s => {
      const opens = s.email_opens?.length || 0
      return opens >= 1 && opens <= 3
    }).length || 0,
    lowEngagement: sequences?.filter(s => (s.email_opens?.length || 0) === 0).length || 0
  }
}

function analyzeSendTiming(sequences) {
  // Mock timing analysis
  return {
    bestDayOfWeek: 'Tuesday',
    bestTimeOfDay: '10:00 AM',
    performanceByDay: {
      Monday: 45,
      Tuesday: 62,
      Wednesday: 58,
      Thursday: 51,
      Friday: 38,
      Saturday: 22,
      Sunday: 25
    }
  }
}

function generateEmailRecommendations(metrics, performance) {
  const recommendations = []
  
  if (metrics.openRate < 25) {
    recommendations.push({
      type: 'subject_lines',
      message: 'Low open rate. Test different subject line strategies.',
      impact: 'high'
    })
  }
  
  if (metrics.clickRate < 5) {
    recommendations.push({
      type: 'content',
      message: 'Low click rate. Improve email content and CTAs.',
      impact: 'medium'
    })
  }
  
  return recommendations
}

function analyzeSourcePerformance(leads) {
  const sources = getSourceStatistics(leads)
  
  return sources.map(source => ({
    ...source,
    quality: source.averageScore >= 80 ? 'high' : source.averageScore >= 60 ? 'medium' : 'low',
    efficiency: source.conversionRate * (source.averageScore / 100)
  }))
}

function calculateSourceCosts(sourcePerformance) {
  // Mock cost calculation - in reality would come from actual spend data
  const mockCosts = {
    apollo: 0.50,
    linkedin: 1.20,
    website: 0.10,
    referral: 0.00
  }
  
  return sourcePerformance.map(source => ({
    source: source.source,
    costPerLead: mockCosts[source.source.toLowerCase()] || 0.75,
    totalCost: (mockCosts[source.source.toLowerCase()] || 0.75) * source.leads
  }))
}

function calculateSourceROI(sourcePerformance, costAnalysis) {
  const revenuePerConversion = 500 // Mock value
  
  return sourcePerformance.map(source => {
    const cost = costAnalysis.find(c => c.source === source.source)
    const revenue = source.conversions * revenuePerConversion
    const totalCost = cost?.totalCost || 0
    
    return {
      source: source.source,
      revenue,
      cost: totalCost,
      roi: totalCost > 0 ? ((revenue - totalCost) / totalCost * 100) : 0,
      profit: revenue - totalCost
    }
  })
}

function generateSourceRecommendations(performance, roi) {
  const recommendations = []
  
  const bestROI = roi.sort((a, b) => b.roi - a.roi)[0]
  if (bestROI) {
    recommendations.push({
      type: 'increase_spend',
      message: `Increase investment in ${bestROI.source} - highest ROI at ${bestROI.roi.toFixed(1)}%`,
      impact: 'high'
    })
  }
  
  const lowPerformers = performance.filter(p => p.conversionRate < 5)
  if (lowPerformers.length > 0) {
    recommendations.push({
      type: 'optimize_sources',
      message: `Optimize or reduce spend on ${lowPerformers.map(p => p.source).join(', ')}`,
      impact: 'medium'
    })
  }
  
  return recommendations
}

function calculateRevenueMetrics(conversions, subscription) {
  const tierRevenue = {
    starter: 50,
    growth: 150,
    scale: 300,
    enterprise: 500
  }
  
  const revenuePerLead = tierRevenue[subscription?.subscription_tiers?.name?.toLowerCase()] || 50
  const totalRevenue = (conversions?.length || 0) * revenuePerLead
  
  return {
    totalRevenue,
    revenuePerLead,
    conversions: conversions?.length || 0,
    averageDealSize: revenuePerLead,
    monthlyRecurring: totalRevenue * 0.3 // Mock MRR calculation
  }
}

function generateRevenueProjections(metrics) {
  const growthRate = 0.15 // 15% monthly growth assumption
  
  return {
    nextMonth: metrics.totalRevenue * (1 + growthRate),
    nextQuarter: metrics.totalRevenue * Math.pow(1 + growthRate, 3),
    nextYear: metrics.totalRevenue * Math.pow(1 + growthRate, 12),
    growthRate: growthRate * 100
  }
}

function calculateCustomerLifetimeValue(conversions, subscription) {
  const avgMonthlyValue = 500
  const avgRetentionMonths = 18
  
  return {
    averageLTV: avgMonthlyValue * avgRetentionMonths,
    monthlyValue: avgMonthlyValue,
    retentionMonths: avgRetentionMonths,
    churnRate: 5.6 // Mock churn rate
  }
}

function calculateRevenueGrowth(metrics) {
  return {
    monthOverMonth: 15.3,
    quarterOverQuarter: 42.1,
    yearOverYear: 156.7
  }
}

function calculateCurrentVelocity(recentLeads) {
  if (!recentLeads?.length) return 0
  
  const last24h = recentLeads.length
  const last1h = recentLeads.filter(l => 
    new Date(l.created_at) > new Date(Date.now() - 60 * 60 * 1000)
  ).length
  
  return {
    leadsPerHour: last1h,
    leadsPerDay: last24h,
    projectedDaily: last1h * 24
  }
}

function generateRealTimeAlerts(recentLeads, recentActivity) {
  const alerts = []
  
  if (recentLeads?.length > 10) {
    alerts.push({
      type: 'high_volume',
      message: 'High lead volume detected in last 24h',
      severity: 'info'
    })
  }
  
  const highQualityLeads = recentLeads?.filter(l => (l.score || 0) > 85).length || 0
  if (highQualityLeads > 2) {
    alerts.push({
      type: 'quality_leads',
      message: `${highQualityLeads} high-quality leads received`,
      severity: 'success'
    })
  }
  
  return alerts
}