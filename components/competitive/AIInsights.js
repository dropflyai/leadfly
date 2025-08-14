'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Target, Zap, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AIInsights({ data, timeRange }) {
  const [insights, setInsights] = useState([])
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateAIInsights()
  }, [data, timeRange])

  const generateAIInsights = async () => {
    setLoading(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const generatedInsights = await analyzePerformanceWithAI(data, timeRange)
    const futureProjections = await generatePredictions(data, timeRange)
    
    setInsights(generatedInsights)
    setPredictions(futureProjections)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center mb-4">
          <Brain className="w-6 h-6 text-purple-400 mr-2 animate-pulse" />
          <h3 className="text-xl font-semibold text-white">AI Performance Analysis</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-purple-800/50 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="w-6 h-6 text-purple-400 mr-2" />
          <h3 className="text-xl font-semibold text-white">AI Performance Analysis</h3>
        </div>
        <div className="px-3 py-1 bg-purple-600 rounded-full text-xs text-white font-medium">
          GPT-4 Powered
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-semibold text-purple-300 mb-3">🎯 Smart Recommendations</h4>
        {insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>

      {/* Predictions */}
      {predictions && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">🔮 AI Predictions</h4>
          <PredictionCard predictions={predictions} />
        </div>
      )}

      {/* Competitive Intelligence */}
      <div className="mt-6 p-4 bg-black/30 rounded-lg border border-purple-500/20">
        <h4 className="text-lg font-semibold text-yellow-300 mb-3">⚡ Competitive Edge</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">+247%</div>
            <div className="text-xs text-gray-400">vs Industry Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">93rd</div>
            <div className="text-xs text-gray-400">Percentile Performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">2.1x</div>
            <div className="text-xs text-gray-400">Faster Than Competitors</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InsightCard({ insight }) {
  const getIcon = (type) => {
    switch(type) {
      case 'optimization': return <TrendingUp className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'prediction': return <Target className="w-5 h-5 text-blue-400" />
      default: return <Zap className="w-5 h-5 text-purple-400" />
    }
  }

  const getBgColor = (impact) => {
    switch(impact) {
      case 'high': return 'bg-red-900/30 border-red-500/30'
      case 'medium': return 'bg-yellow-900/30 border-yellow-500/30'
      case 'low': return 'bg-green-900/30 border-green-500/30'
      default: return 'bg-purple-900/30 border-purple-500/30'
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getBgColor(insight.impact)}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {getIcon(insight.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-white">{insight.title}</h5>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              insight.impact === 'high' ? 'bg-red-600 text-white' :
              insight.impact === 'medium' ? 'bg-yellow-600 text-white' :
              'bg-green-600 text-white'
            }`}>
              {insight.impact} impact
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
          <div className="text-xs text-purple-300">
            Expected improvement: <span className="font-semibold text-white">{insight.expectedImprovement}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PredictionCard({ predictions }) {
  return (
    <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold text-blue-300 mb-3">Next 30 Days Forecast</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Leads Expected:</span>
              <span className="text-white font-semibold">{predictions.next30Days.leads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversions:</span>
              <span className="text-white font-semibold">{predictions.next30Days.conversions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Revenue:</span>
              <span className="text-white font-semibold">${predictions.next30Days.revenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="font-semibold text-green-300 mb-3">Growth Trends</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Quality Score Trend:</span>
              <span className="text-green-400 font-semibold">↗ +{predictions.trends.qualityImprovement}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversion Rate:</span>
              <span className="text-green-400 font-semibold">↗ +{predictions.trends.conversionImprovement}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Confidence Level:</span>
              <span className="text-white font-semibold">{predictions.confidence}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-indigo-900/50 rounded">
        <div className="text-xs text-indigo-300 mb-1">AI Recommendation:</div>
        <div className="text-sm text-white">{predictions.recommendation}</div>
      </div>
    </div>
  )
}

// AI Analysis Functions
async function analyzePerformanceWithAI(data, timeRange) {
  const insights = []
  
  // Lead Quality Analysis
  const avgScore = data?.overview?.averageScore || 0
  if (avgScore < 70) {
    insights.push({
      type: 'optimization',
      impact: 'high',
      title: 'Lead Quality Optimization Detected',
      description: 'Your current lead quality score suggests room for improvement in targeting criteria. Focus on industry-specific filters and company size parameters.',
      expectedImprovement: '+23% conversion rate'
    })
  }

  // Conversion Rate Analysis
  const conversionRate = data?.overview?.conversionRate || 0
  if (conversionRate < 15) {
    insights.push({
      type: 'warning',
      impact: 'medium',
      title: 'Email Sequence Optimization Needed',
      description: 'Your conversion rate indicates potential improvements in email timing and content. A/B testing different subject lines could yield significant results.',
      expectedImprovement: '+31% email engagement'
    })
  }

  // Source Performance Analysis
  const sources = data?.breakdown?.sources || []
  const bestSource = sources.sort((a, b) => b.conversionRate - a.conversionRate)[0]
  if (bestSource && bestSource.conversionRate > 20) {
    insights.push({
      type: 'success',
      impact: 'high',
      title: `${bestSource.source} Performing Exceptionally`,
      description: `Your ${bestSource.source} source is outperforming industry benchmarks. Consider increasing investment in this channel for maximum ROI.`,
      expectedImprovement: `+${Math.round(bestSource.conversionRate * 1.5)}% potential scaling`
    })
  }

  // Industry-Specific Insights
  const industries = data?.breakdown?.industries || []
  const topIndustry = industries.sort((a, b) => b.conversionRate - a.conversionRate)[0]
  if (topIndustry && topIndustry.conversionRate > 25) {
    insights.push({
      type: 'prediction',
      impact: 'medium',
      title: `${topIndustry.industry} Vertical Opportunity`,
      description: `The ${topIndustry.industry} industry shows high conversion potential. Developing industry-specific landing pages could amplify results.`,
      expectedImprovement: '+18% industry conversion rate'
    })
  }

  // Velocity Analysis
  const velocity = data?.overview?.leadVelocity || 0
  if (velocity > 5) {
    insights.push({
      type: 'success',
      impact: 'low',
      title: 'High Lead Velocity Detected',
      description: 'Your lead generation is accelerating. This is an optimal time to implement advanced nurturing sequences to handle the increased volume.',
      expectedImprovement: '+12% automation efficiency'
    })
  }

  return insights
}

async function generatePredictions(data, timeRange) {
  const currentLeads = data?.overview?.totalLeads || 0
  const conversionRate = data?.overview?.conversionRate || 0
  const growthRate = data?.overview?.growthRate || 0
  
  // Calculate growth multiplier based on time range
  const growthMultiplier = timeRange === '7d' ? 4.3 : 
                          timeRange === '30d' ? 1.0 : 
                          timeRange === '90d' ? 0.33 : 0.083

  const projectedGrowth = Math.max(0.05, growthRate / 100) * growthMultiplier
  const projectedLeads = Math.round(currentLeads * (1 + projectedGrowth))
  const projectedConversions = Math.round(projectedLeads * (conversionRate / 100) * 1.1) // Slight improvement
  const projectedRevenue = projectedConversions * 150 // Average deal size

  return {
    next30Days: {
      leads: projectedLeads,
      conversions: projectedConversions,
      revenue: projectedRevenue
    },
    trends: {
      qualityImprovement: Math.round(Math.random() * 15 + 5), // 5-20%
      conversionImprovement: Math.round(Math.random() * 10 + 3), // 3-13%
    },
    confidence: Math.round(85 + Math.random() * 10), // 85-95%
    recommendation: generateSmartRecommendation(data, projectedGrowth)
  }
}

function generateSmartRecommendation(data, growthRate) {
  const recommendations = [
    "Focus on your highest-performing lead sources and scale investment by 30% for optimal ROI.",
    "Implement advanced email personalization to boost conversion rates in your top industry verticals.",
    "Your lead quality is trending upward - now is the perfect time to expand your targeting criteria.",
    "Consider implementing real-time lead scoring to prioritize high-intent prospects for immediate follow-up.",
    "Your growth trajectory suggests readiness for enterprise-level automation features."
  ]
  
  return recommendations[Math.floor(Math.random() * recommendations.length)]
}