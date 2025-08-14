'use client'

import { TrendingUp, TrendingDown, Users, Target, Star, DollarSign } from 'lucide-react'

export default function MetricsCards({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Leads',
      value: data?.overview?.totalLeads?.toLocaleString() || '0',
      change: data?.overview?.growthRate || 0,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Conversion Rate',
      value: `${(data?.overview?.conversionRate || 0).toFixed(1)}%`,
      change: 5.2, // Mock comparison
      icon: Target,
      color: 'green'
    },
    {
      title: 'Avg Lead Score',
      value: (data?.overview?.averageScore || 0).toFixed(1),
      change: 8.7,
      icon: Star,
      color: 'yellow'
    },
    {
      title: 'Est. Revenue',
      value: `$${((data?.overview?.totalLeads || 0) * 150).toLocaleString()}`,
      change: 15.8,
      icon: DollarSign,
      color: 'purple'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}

function MetricCard({ title, value, change, icon: Icon, color }) {
  const isPositive = change >= 0
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center text-sm font-medium ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-gray-400 text-sm">{title}</div>
        <div className="text-xs text-gray-500">
          vs previous period
        </div>
      </div>
    </div>
  )
}