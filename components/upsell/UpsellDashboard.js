'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function UpsellDashboard({ user }) {
  const [opportunities, setOpportunities] = useState([])
  const [usageInsights, setUsageInsights] = useState({})
  const [featureRequests, setFeatureRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('opportunities')
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load expansion opportunities
      const oppResponse = await fetch('/api/upsell/opportunities?status=identified,qualified,engaged')
      if (oppResponse.ok) {
        const oppData = await oppResponse.json()
        setOpportunities(oppData.opportunities || [])
      }

      // Load usage insights
      const usageResponse = await fetch('/api/upsell/usage-tracking?days=30')
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setUsageInsights(usageData.insights || {})
      }

      // Load feature requests
      const requestResponse = await fetch('/api/upsell/feature-requests?status=submitted,reviewed')
      if (requestResponse.ok) {
        const requestData = await requestResponse.json()
        setFeatureRequests(requestData.requests || [])
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitFeatureRequest = async (featureData) => {
    try {
      const response = await fetch('/api/upsell/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(featureData)
      })

      if (response.ok) {
        loadDashboardData() // Refresh data
        return true
      }
      return false
    } catch (error) {
      console.error('Error submitting feature request:', error)
      return false
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account Growth Center</h1>
          <p className="text-gray-400">Discover opportunities to expand your LeadFly AI experience</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'opportunities', label: 'Growth Opportunities', count: opportunities.length },
            { id: 'usage', label: 'Usage Insights', count: Object.keys(usageInsights).length },
            { id: 'requests', label: 'Feature Requests', count: featureRequests.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'opportunities' && (
          <OpportunitiesTab opportunities={opportunities} onRefresh={loadDashboardData} />
        )}

        {activeTab === 'usage' && (
          <UsageInsightsTab insights={usageInsights} />
        )}

        {activeTab === 'requests' && (
          <FeatureRequestsTab 
            requests={featureRequests} 
            onSubmitRequest={submitFeatureRequest}
            onRefresh={loadDashboardData}
          />
        )}
      </div>
    </div>
  )
}

// Opportunities Tab Component
function OpportunitiesTab({ opportunities, onRefresh }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20'
      case 'high': return 'text-orange-400 bg-orange-900/20'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20'
      case 'low': return 'text-green-400 bg-green-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'usage_upgrade': return '📈'
      case 'feature_upgrade': return '🚀'
      case 'tier_progression': return '⬆️'
      case 'seat_expansion': return '👥'
      default: return '💡'
    }
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-xl font-semibold text-white mb-2">All Set!</h3>
        <p className="text-gray-400">No growth opportunities identified at the moment. Keep using LeadFly AI and we'll let you know when there are ways to expand your success!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {opportunities.map((opportunity) => (
        <div key={opportunity.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getTypeIcon(opportunity.opportunity_type)}</span>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {formatOpportunityTitle(opportunity)}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(opportunity.priority)}`}>
                    {opportunity.priority.toUpperCase()}
                  </span>
                  <span className="text-green-400 text-sm font-medium">
                    {opportunity.probability_percentage}% likely
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold text-lg">
                +${opportunity.potential_arr_increase.toLocaleString()}/year
              </div>
              <div className="text-gray-400 text-sm">Potential value</div>
            </div>
          </div>

          <div className="text-gray-300 mb-4">
            {formatOpportunityDescription(opportunity)}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Identified {new Date(opportunity.created_at).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Learn More
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Usage Insights Tab Component
function UsageInsightsTab({ insights }) {
  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'text-red-400'
    if (utilization >= 75) return 'text-yellow-400'
    if (utilization >= 50) return 'text-blue-400'
    return 'text-green-400'
  }

  const getUtilizationBg = (utilization) => {
    if (utilization >= 90) return 'bg-red-500'
    if (utilization >= 75) return 'bg-yellow-500'
    if (utilization >= 50) return 'bg-blue-500'
    return 'bg-green-500'
  }

  if (Object.keys(insights).length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-white mb-2">Usage Data Loading</h3>
        <p className="text-gray-400">We're collecting your usage data to provide personalized insights. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(insights).map(([metricName, data]) => (
        <div key={metricName} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white capitalize">
              {metricName.replace(/_/g, ' ')}
            </h3>
            {data.trend > 0 && (
              <span className="text-green-400 text-sm">
                ↗ +{data.trend}%
              </span>
            )}
            {data.trend < 0 && (
              <span className="text-red-400 text-sm">
                ↘ {data.trend}%
              </span>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Current Usage</span>
              <span className={`font-bold ${getUtilizationColor(data.current_utilization)}`}>
                {data.current_utilization.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUtilizationBg(data.current_utilization)}`}
                style={{ width: `${Math.min(100, data.current_utilization)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Current:</span>
              <span className="text-white">{data.current_value.toLocaleString()}</span>
            </div>
            {data.plan_limit && (
              <div className="flex justify-between">
                <span className="text-gray-400">Limit:</span>
                <span className="text-white">{data.plan_limit.toLocaleString()}</span>
              </div>
            )}
            {data.days_until_limit && data.days_until_limit > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Est. full in:</span>
                <span className="text-yellow-400">{data.days_until_limit} days</span>
              </div>
            )}
          </div>

          {data.upgrade_recommended && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-yellow-400 text-sm font-medium">Upgrade Recommended</span>
              </div>
              <p className="text-yellow-300 text-xs mt-1">
                You're approaching your plan limits. Consider upgrading to avoid disruptions.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Feature Requests Tab Component
function FeatureRequestsTab({ requests, onSubmitRequest, onRefresh }) {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formData, setFormData] = useState({
    feature_name: '',
    feature_category: 'general',
    request_description: '',
    business_justification: '',
    urgency_level: 'medium'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await onSubmitRequest(formData)
    if (success) {
      setFormData({
        feature_name: '',
        feature_category: 'general',
        request_description: '',
        business_justification: '',
        urgency_level: 'medium'
      })
      setShowRequestForm(false)
      onRefresh()
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'text-blue-400 bg-blue-900/20'
      case 'reviewed': return 'text-yellow-400 bg-yellow-900/20'
      case 'approved': return 'text-green-400 bg-green-900/20'
      case 'in_development': return 'text-purple-400 bg-purple-900/20'
      case 'completed': return 'text-green-400 bg-green-900/20'
      case 'upgrade_offered': return 'text-orange-400 bg-orange-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Request a Feature</h3>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showRequestForm ? 'Cancel' : 'New Request'}
          </button>
        </div>

        {showRequestForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feature Name
                </label>
                <input
                  type="text"
                  value={formData.feature_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, feature_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.feature_category}
                  onChange={(e) => setFormData(prev => ({ ...prev, feature_category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="general">General</option>
                  <option value="api">API & Integrations</option>
                  <option value="analytics">Analytics</option>
                  <option value="automation">Automation</option>
                  <option value="team">Team & Collaboration</option>
                  <option value="security">Security</option>
                  <option value="ui_ux">UI/UX</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.request_description}
                onChange={(e) => setFormData(prev => ({ ...prev, request_description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Justification
              </label>
              <textarea
                value={formData.business_justification}
                onChange={(e) => setFormData(prev => ({ ...prev, business_justification: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-20"
                placeholder="How would this feature help your business?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Urgency Level
              </label>
              <select
                value={formData.urgency_level}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency_level: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="low">Low - Nice to have</option>
                <option value="medium">Medium - Would improve workflow</option>
                <option value="high">High - Important for business</option>
                <option value="critical">Critical - Blocking operations</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Submit Request
            </button>
          </form>
        )}
      </div>

      {/* Existing Requests */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Your Feature Requests</h3>
        
        {requests.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Requests Yet</h3>
            <p className="text-gray-400">Submit your first feature request to help us improve LeadFly AI for your needs!</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{request.feature_name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">{request.feature_category}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>

              <p className="text-gray-300 mb-3">{request.request_description}</p>

              {request.business_justification && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400 text-sm font-medium">Business Impact:</span>
                  <p className="text-gray-300 text-sm mt-1">{request.business_justification}</p>
                </div>
              )}

              {request.upgrade_required && (
                <div className="mt-3 p-3 bg-orange-900/20 border border-orange-600 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400">🚀</span>
                    <span className="text-orange-400 text-sm font-medium">
                      Available in {request.available_in_plan} plan
                    </span>
                  </div>
                  <p className="text-orange-300 text-xs mt-1">
                    This feature is available with a plan upgrade. Upgrade to unlock immediately!
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Helper functions
function formatOpportunityTitle(opportunity) {
  switch (opportunity.opportunity_type) {
    case 'usage_upgrade':
      return `Upgrade to ${opportunity.recommended_plan} Plan`
    case 'feature_upgrade':
      const featureName = opportunity.trigger_data?.feature_name || 'Advanced Features'
      return `Unlock ${featureName}`
    case 'tier_progression':
      return `Ready for ${opportunity.recommended_plan} Plan`
    case 'seat_expansion':
      return 'Add Team Members'
    default:
      return 'Growth Opportunity'
  }
}

function formatOpportunityDescription(opportunity) {
  switch (opportunity.opportunity_type) {
    case 'usage_upgrade':
      const utilization = opportunity.trigger_data?.utilization_percentage || 0
      return `You're using ${utilization.toFixed(1)}% of your plan limits. Upgrade to ${opportunity.recommended_plan} for more capacity and advanced features.`
    case 'feature_upgrade':
      const featureName = opportunity.trigger_data?.feature_name || 'advanced features'
      return `You've requested ${featureName}. This feature is available in the ${opportunity.recommended_plan} plan along with other powerful capabilities.`
    case 'tier_progression':
      const milestone = opportunity.trigger_data?.milestone_name || 'success milestone'
      return `Congratulations on achieving ${milestone}! You're ready to scale with our ${opportunity.recommended_plan} plan.`
    default:
      return 'An opportunity to expand your LeadFly AI capabilities and drive even better results.'
  }
}