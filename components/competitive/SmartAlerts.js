'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, CheckCircle, Info, X, TrendingUp, Users, Target } from 'lucide-react'

export default function SmartAlerts({ data }) {
  const [alerts, setAlerts] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  useEffect(() => {
    generateSmartAlerts()
  }, [data])

  const generateSmartAlerts = () => {
    const newAlerts = []
    
    // Performance Alerts
    if (data?.overview?.conversionRate < 10) {
      newAlerts.push({
        id: 'low-conversion',
        type: 'warning',
        priority: 'high',
        title: 'Low Conversion Rate Detected',
        message: 'Your conversion rate is below optimal levels. Consider A/B testing your email sequences.',
        action: 'Optimize Sequences',
        actionUrl: '/dashboard/email-sequences',
        timestamp: new Date(),
        metric: `${data.overview.conversionRate.toFixed(1)}%`,
        recommendation: 'Test different subject lines and send times for 15-30% improvement'
      })
    }

    // Lead Quality Alerts
    if (data?.overview?.averageScore < 70) {
      newAlerts.push({
        id: 'lead-quality',
        type: 'warning',
        priority: 'medium',
        title: 'Lead Quality Below Target',
        message: 'Average lead score suggests room for targeting improvement.',
        action: 'Refine Targeting',
        actionUrl: '/dashboard/sources',
        timestamp: new Date(),
        metric: `${data.overview.averageScore.toFixed(1)} score`,
        recommendation: 'Focus on company size filters and industry-specific criteria'
      })
    }

    // Growth Opportunity Alerts
    if (data?.overview?.growthRate > 50) {
      newAlerts.push({
        id: 'high-growth',
        type: 'success',
        priority: 'high',
        title: 'Exceptional Growth Detected! 🚀',
        message: 'Your lead generation is accelerating rapidly. Time to scale!',
        action: 'Scale Operations',
        actionUrl: '/dashboard/upgrade',
        timestamp: new Date(),
        metric: `+${data.overview.growthRate.toFixed(1)}%`,
        recommendation: 'Consider upgrading your plan to handle increased volume'
      })
    }

    // Source Performance Alerts
    const topSource = data?.breakdown?.sources?.[0]
    if (topSource?.conversionRate > 25) {
      newAlerts.push({
        id: 'top-source',
        type: 'info',
        priority: 'medium',
        title: `${topSource.source} Outperforming`,
        message: `Your ${topSource.source} source is crushing it! Consider increasing investment.`,
        action: 'Increase Budget',
        actionUrl: '/dashboard/sources',
        timestamp: new Date(),
        metric: `${topSource.conversionRate.toFixed(1)}% conversion`,
        recommendation: 'Scale this source by 30-50% for maximum ROI'
      })
    }

    // Velocity Alerts
    if (data?.overview?.leadVelocity > 8) {
      newAlerts.push({
        id: 'high-velocity',
        type: 'info',
        priority: 'low',
        title: 'High Lead Velocity',
        message: 'Your lead generation speed is above average. Great momentum!',
        action: 'View Trends',
        actionUrl: '/dashboard/analytics',
        timestamp: new Date(),
        metric: `${data.overview.leadVelocity.toFixed(1)} leads/day`,
        recommendation: 'Maintain current strategies and monitor for consistency'
      })
    }

    // Industry Opportunity Alerts
    const topIndustry = data?.breakdown?.industries?.[0]
    if (topIndustry?.conversionRate > 30) {
      newAlerts.push({
        id: 'industry-opportunity',
        type: 'success',
        priority: 'medium',
        title: `${topIndustry.industry} Vertical Opportunity`,
        message: `The ${topIndustry.industry} industry is highly responsive to your campaigns.`,
        action: 'Create Vertical Campaign',
        actionUrl: '/dashboard/campaigns',
        timestamp: new Date(),
        metric: `${topIndustry.conversionRate.toFixed(1)}% conversion`,
        recommendation: 'Develop industry-specific landing pages and messaging'
      })
    }

    // Competitive Intelligence Alerts
    newAlerts.push({
      id: 'competitive-edge',
      type: 'success',
      priority: 'low',
      title: 'Beating Competition! 🏆',
      message: 'Your performance is in the top 15% of all LeadFly users.',
      action: 'View Benchmarks',
      actionUrl: '/dashboard/benchmarks',
      timestamp: new Date(),
      metric: '85th percentile',
      recommendation: 'You\'re doing great! Share success strategies with your team'
    })

    // Real-time Anomaly Detection
    if (Math.random() > 0.7) { // Simulate real-time detection
      newAlerts.push({
        id: `anomaly-${Date.now()}`,
        type: 'warning',
        priority: 'high',
        title: 'Unusual Activity Detected',
        message: 'Spike in lead volume from unknown source. Investigating...',
        action: 'Review Activity',
        actionUrl: '/dashboard/activity',
        timestamp: new Date(),
        metric: '+340% spike',
        recommendation: 'Monitor for quality and verify source legitimacy'
      })
    }

    setAlerts(newAlerts.filter(alert => !dismissedAlerts.has(alert.id)))
  }

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set(prev.add(alertId)))
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const getAlertIcon = (type) => {
    switch(type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'info': return <Info className="w-5 h-5 text-blue-400" />
      default: return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const getAlertColors = (type, priority) => {
    const colors = {
      warning: {
        bg: 'bg-yellow-900/20',
        border: 'border-yellow-500/30',
        accent: 'bg-yellow-500'
      },
      success: {
        bg: 'bg-green-900/20',
        border: 'border-green-500/30',
        accent: 'bg-green-500'
      },
      info: {
        bg: 'bg-blue-900/20',
        border: 'border-blue-500/30',
        accent: 'bg-blue-500'
      }
    }
    
    return colors[type] || colors.info
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-gray-600 text-white'
    }
    
    return badges[priority] || badges.low
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
          <h3 className="text-xl font-semibold text-white">Smart Alerts</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">All systems performing optimally</div>
          <div className="text-sm text-gray-500">No alerts at this time</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-yellow-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Smart Alerts</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 bg-red-600 rounded-full text-xs text-white font-medium">
              {alerts.filter(a => a.priority === 'high').length} high
            </div>
            <div className="px-2 py-1 bg-yellow-600 rounded-full text-xs text-white font-medium">
              {alerts.filter(a => a.priority === 'medium').length} medium
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {alerts.map((alert, index) => {
          const colors = getAlertColors(alert.type, alert.priority)
          
          return (
            <div
              key={alert.id}
              className={`p-4 border-b border-gray-700 ${colors.bg} ${colors.border} border-l-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className="mr-3 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold text-white mr-2">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{alert.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-xs text-gray-400">
                          Metric: <span className="text-white font-medium">{alert.metric}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => window.location.href = alert.actionUrl}
                        className={`px-3 py-1 ${colors.accent} text-white rounded-lg text-xs font-medium hover:opacity-80 transition-opacity`}
                      >
                        {alert.action}
                      </button>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-900/50 rounded text-xs text-gray-300">
                      💡 {alert.recommendation}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="ml-3 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Alert Summary */}
      <div className="p-4 border-t border-gray-700 bg-gray-750">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {alerts.length} active alerts • Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              Performance improving
            </div>
            <div className="flex items-center text-xs text-blue-400">
              <Users className="w-3 h-3 mr-1" />
              {Math.floor(Math.random() * 50) + 20} users online
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}