'use client'

import { useState, useEffect } from 'react'
import { Activity, Eye, MessageCircle, UserCheck, TrendingUp, Zap } from 'lucide-react'

export default function RealTimeActivity() {
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({})
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Initialize with some activities
    setActivities(generateInitialActivities())
    setStats(generateLiveStats())
    
    // Set up real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        addNewActivity()
        updateStats()
      }
    }, 3000) // New activity every 3 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const addNewActivity = () => {
    const newActivity = generateRandomActivity()
    setActivities(prev => [newActivity, ...prev.slice(0, 19)]) // Keep last 20
  }

  const updateStats = () => {
    setStats(prev => ({
      ...prev,
      activeNow: Math.max(1, prev.activeNow + Math.floor(Math.random() * 3) - 1),
      todayLeads: prev.todayLeads + (Math.random() > 0.7 ? 1 : 0),
      lastHourConversions: prev.lastHourConversions + (Math.random() > 0.9 ? 1 : 0)
    }))
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-green-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Real-Time Activity</h3>
            <div className={`ml-3 w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              isLive 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="p-6 border-b border-gray-700">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.activeNow}</div>
            <div className="text-xs text-gray-400">Active Now</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.todayLeads}</div>
            <div className="text-xs text-gray-400">Today's Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.lastHourConversions}</div>
            <div className="text-xs text-gray-400">Last Hour</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.avgResponseTime}s</div>
            <div className="text-xs text-gray-400">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <ActivityItem key={activity.id} activity={activity} isNew={index === 0} />
        ))}
      </div>

      {/* Activity Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-750">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            {activities.length} activities in the last hour
          </div>
          <div className="flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+23% vs yesterday</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity, isNew }) {
  const getIcon = (type) => {
    switch(type) {
      case 'lead_captured': return <UserCheck className="w-4 h-4 text-green-400" />
      case 'page_view': return <Eye className="w-4 h-4 text-blue-400" />
      case 'email_opened': return <MessageCircle className="w-4 h-4 text-yellow-400" />
      case 'conversion': return <Zap className="w-4 h-4 text-purple-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    return `${Math.floor(diffInSeconds / 3600)}h ago`
  }

  return (
    <div className={`p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors ${
      isNew ? 'bg-green-900/20 border-green-500/30' : ''
    }`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {getIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white truncate">
              <span className="font-medium">{activity.contact}</span>
              <span className="text-gray-400 ml-1">{activity.description}</span>
            </p>
            <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              {getTimeAgo(activity.timestamp)}
            </div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-400">{activity.source}</span>
            {activity.location && (
              <>
                <span className="text-gray-600 mx-1">•</span>
                <span className="text-xs text-gray-400">{activity.location}</span>
              </>
            )}
            {activity.score && (
              <>
                <span className="text-gray-600 mx-1">•</span>
                <span className="text-xs text-yellow-400">Score: {activity.score}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function generateInitialActivities() {
  const activities = []
  const now = new Date()
  
  for (let i = 0; i < 15; i++) {
    activities.push({
      id: `activity-${i}`,
      type: getRandomActivityType(),
      contact: getRandomContact(),
      description: getRandomDescription(),
      source: getRandomSource(),
      location: getRandomLocation(),
      score: getRandomScore(),
      timestamp: new Date(now.getTime() - i * 2 * 60000) // 2 minutes apart
    })
  }
  
  return activities
}

function generateRandomActivity() {
  return {
    id: `activity-${Date.now()}-${Math.random()}`,
    type: getRandomActivityType(),
    contact: getRandomContact(),
    description: getRandomDescription(),
    source: getRandomSource(),
    location: getRandomLocation(),
    score: getRandomScore(),
    timestamp: new Date()
  }
}

function getRandomActivityType() {
  const types = ['lead_captured', 'page_view', 'email_opened', 'conversion']
  return types[Math.floor(Math.random() * types.length)]
}

function getRandomContact() {
  const names = [
    'Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'James Rodriguez', 'Lisa Park',
    'David Kim', 'Rachel Green', 'Tom Anderson', 'Amy Taylor', 'Chris Brown',
    'Jessica Lee', 'Ryan Murphy', 'Maria Garcia', 'Kevin Zhang', 'Sophie Davis'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

function getRandomDescription() {
  const descriptions = {
    lead_captured: 'submitted contact form',
    page_view: 'viewed pricing page',
    email_opened: 'opened welcome email',
    conversion: 'completed demo booking'
  }
  
  const type = getRandomActivityType()
  return descriptions[type] || 'performed action'
}

function getRandomSource() {
  const sources = ['Apollo', 'LinkedIn', 'Website', 'Referral', 'Google Ads', 'Email Campaign']
  return sources[Math.floor(Math.random() * sources.length)]
}

function getRandomLocation() {
  const locations = [
    'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA',
    'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Miami, FL', 'Atlanta, GA'
  ]
  return Math.random() > 0.3 ? locations[Math.floor(Math.random() * locations.length)] : null
}

function getRandomScore() {
  return Math.random() > 0.4 ? Math.floor(Math.random() * 40) + 60 : null // 60-100 score
}

function generateLiveStats() {
  return {
    activeNow: Math.floor(Math.random() * 15) + 5, // 5-20 active
    todayLeads: Math.floor(Math.random() * 50) + 25, // 25-75 leads today
    lastHourConversions: Math.floor(Math.random() * 5) + 1, // 1-6 conversions
    avgResponseTime: Math.floor(Math.random() * 30) + 15 // 15-45 seconds
  }
}