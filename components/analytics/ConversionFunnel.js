'use client'

import { useState } from 'react'
import { ChevronRight, TrendingUp, AlertCircle } from 'lucide-react'

export default function ConversionFunnel({ data, loading }) {
  const [selectedStage, setSelectedStage] = useState(null)

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const funnel = data?.breakdown?.status || {}
  const total = funnel.cold + funnel.contacted + funnel.qualified + funnel.converted || 1

  const stages = [
    {
      name: 'Cold Leads',
      count: funnel.cold || 0,
      percentage: ((funnel.cold || 0) / total * 100).toFixed(1),
      color: 'bg-gray-600',
      description: 'Initial leads captured from various sources'
    },
    {
      name: 'Contacted',
      count: funnel.contacted || 0,
      percentage: ((funnel.contacted || 0) / total * 100).toFixed(1),
      color: 'bg-blue-600',
      description: 'Leads that have been reached out to'
    },
    {
      name: 'Qualified',
      count: funnel.qualified || 0,
      percentage: ((funnel.qualified || 0) / total * 100).toFixed(1),
      color: 'bg-yellow-600',
      description: 'Leads that meet qualification criteria'
    },
    {
      name: 'Converted',
      count: funnel.converted || 0,
      percentage: ((funnel.converted || 0) / total * 100).toFixed(1),
      color: 'bg-green-600',
      description: 'Leads that completed desired action'
    }
  ]

  // Calculate conversion rates between stages
  const conversionRates = [
    {
      from: 'Cold',
      to: 'Contacted',
      rate: funnel.cold > 0 ? ((funnel.contacted || 0) / funnel.cold * 100).toFixed(1) : '0'
    },
    {
      from: 'Contacted',
      to: 'Qualified',
      rate: funnel.contacted > 0 ? ((funnel.qualified || 0) / funnel.contacted * 100).toFixed(1) : '0'
    },
    {
      from: 'Qualified',
      to: 'Converted',
      rate: funnel.qualified > 0 ? ((funnel.converted || 0) / funnel.qualified * 100).toFixed(1) : '0'
    }
  ]

  // Identify bottlenecks
  const bottlenecks = conversionRates
    .map((rate, index) => ({ ...rate, index, rateNum: parseFloat(rate.rate) }))
    .filter(rate => rate.rateNum < 25) // Less than 25% conversion is concerning
    .sort((a, b) => a.rateNum - b.rateNum)

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Conversion Funnel</h3>
        <div className="text-sm text-gray-400">
          Overall: {((funnel.converted || 0) / total * 100).toFixed(1)}% conversion
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-3 mb-6">
        {stages.map((stage, index) => (
          <div
            key={stage.name}
            className={`relative cursor-pointer transition-all duration-200 ${
              selectedStage === index ? 'scale-102' : 'hover:scale-101'
            }`}
            onClick={() => setSelectedStage(selectedStage === index ? null : index)}
          >
            {/* Stage Bar */}
            <div className="relative">
              <div 
                className={`${stage.color} rounded-lg p-4 shadow-lg`}
                style={{ 
                  width: `${Math.max(20, stage.percentage)}%`,
                  minWidth: '200px'
                }}
              >
                <div className="flex items-center justify-between text-white">
                  <div>
                    <div className="font-semibold">{stage.name}</div>
                    <div className="text-sm opacity-90">{stage.count.toLocaleString()} leads</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{stage.percentage}%</div>
                  </div>
                </div>
              </div>
              
              {/* Conversion Rate Arrow */}
              {index < stages.length - 1 && (
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 flex items-center">
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                  <div className="ml-2 text-sm text-gray-400 font-medium">
                    {conversionRates[index]?.rate}%
                  </div>
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {selectedStage === index && (
              <div className="mt-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <p className="text-gray-300 text-sm mb-3">{stage.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Current Performance</div>
                    <div className="text-white font-semibold">{stage.count} leads ({stage.percentage}%)</div>
                  </div>
                  
                  {index < stages.length - 1 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Next Stage Conversion</div>
                      <div className="text-white font-semibold">{conversionRates[index]?.rate}%</div>
                    </div>
                  )}
                </div>

                {/* Optimization Suggestions */}
                {index === 0 && (
                  <div className="mt-3 text-xs text-blue-400">
                    💡 Tip: Improve lead quality by refining targeting criteria
                  </div>
                )}
                {index === 1 && (
                  <div className="mt-3 text-xs text-yellow-400">
                    💡 Tip: Optimize email sequences and timing for better response rates
                  </div>
                )}
                {index === 2 && (
                  <div className="mt-3 text-xs text-green-400">
                    💡 Tip: Enhance qualification criteria and lead scoring
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottleneck Analysis */}
      {bottlenecks.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <h4 className="text-red-400 font-semibold">Conversion Bottlenecks Detected</h4>
          </div>
          
          <div className="space-y-2">
            {bottlenecks.slice(0, 2).map((bottleneck, index) => (
              <div key={index} className="text-sm text-red-300">
                • {bottleneck.from} → {bottleneck.to}: {bottleneck.rate}% conversion rate
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-red-400">
            Focus optimization efforts on these conversion points for maximum impact.
          </div>
        </div>
      )}

      {/* Performance Indicators */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {((funnel.converted || 0) / total * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Overall Conversion</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {conversionRates[1]?.rate || '0'}%
          </div>
          <div className="text-xs text-gray-400">Contact→Qualified</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {data?.overview?.leadVelocity?.toFixed(1) || '0'}
          </div>
          <div className="text-xs text-gray-400">Leads/Day</div>
        </div>
      </div>
    </div>
  )
}