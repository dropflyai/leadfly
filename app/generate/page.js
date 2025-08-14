'use client'

import { useState } from 'react'
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function GenerateLeads() {
  const [criteria, setCriteria] = useState({
    job_titles: ['CEO', 'VP Sales'],
    locations: ['United States'],
    company_sizes: ['11-50', '51-200'],
    industries: ['Software', 'SaaS'],
    keywords: ''
  })
  const [leadCount, setLeadCount] = useState(25)
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState(null)

  const jobTitleOptions = [
    'CEO', 'VP Sales', 'VP Marketing', 'Director of Sales', 'Director of Marketing',
    'Sales Manager', 'Marketing Manager', 'Business Development', 'COO', 'CTO'
  ]

  const industryOptions = [
    'Software', 'SaaS', 'Technology', 'Healthcare', 'Finance', 'Manufacturing',
    'E-commerce', 'Marketing', 'Consulting', 'Real Estate'
  ]

  const companySizeOptions = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ]

  const locationOptions = [
    'United States', 'California', 'New York', 'Texas', 'Florida',
    'Canada', 'United Kingdom', 'Germany', 'Australia'
  ]

  const handleAddOption = (field, value) => {
    if (value && !criteria[field].includes(value)) {
      setCriteria({
        ...criteria,
        [field]: [...criteria[field], value]
      })
    }
  }

  const handleRemoveOption = (field, value) => {
    setCriteria({
      ...criteria,
      [field]: criteria[field].filter(item => item !== value)
    })
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Simulate API call
    setTimeout(() => {
      setResults({
        success: true,
        count: leadCount,
        high_value_count: Math.floor(leadCount * 0.3),
        cost: leadCount * 0.40,
        estimated_time: '3-5 minutes'
      })
      setIsGenerating(false)
    }, 2000)
  }

  const estimatedCost = leadCount * 0.40
  const estimatedQuality = Math.floor(leadCount * 0.25)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">LeadFly AI</h1>
              <span className="ml-4 text-sm text-gray-500">Generate Leads</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Credits: 153/500</span>
              <button className="btn-secondary">Back to Dashboard</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Generate High-Quality Leads
          </h1>
          <p className="text-lg text-gray-600">
            Define your ideal customer profile and let AI find qualified prospects
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Job Titles */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Job Titles</h3>
              <div className="mb-4">
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={(e) => handleAddOption('job_titles', e.target.value)}
                  value=""
                >
                  <option value="">Add job title...</option>
                  {jobTitleOptions.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {criteria.job_titles.map(title => (
                  <span key={title} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    {title}
                    <button 
                      onClick={() => handleRemoveOption('job_titles', title)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Industries</h3>
              <div className="mb-4">
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={(e) => handleAddOption('industries', e.target.value)}
                  value=""
                >
                  <option value="">Add industry...</option>
                  {industryOptions.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {criteria.industries.map(industry => (
                  <span key={industry} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {industry}
                    <button 
                      onClick={() => handleRemoveOption('industries', industry)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Company Size */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Company Size</h3>
              <div className="mb-4">
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={(e) => handleAddOption('company_sizes', e.target.value)}
                  value=""
                >
                  <option value="">Add company size...</option>
                  {companySizeOptions.map(size => (
                    <option key={size} value={size}>{size} employees</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {criteria.company_sizes.map(size => (
                  <span key={size} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {size} employees
                    <button 
                      onClick={() => handleRemoveOption('company_sizes', size)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Locations</h3>
              <div className="mb-4">
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={(e) => handleAddOption('locations', e.target.value)}
                  value=""
                >
                  <option value="">Add location...</option>
                  {locationOptions.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {criteria.locations.map(location => (
                  <span key={location} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {location}
                    <button 
                      onClick={() => handleRemoveOption('locations', location)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Keywords (Optional)</h3>
              <input
                type="text"
                placeholder="Company keywords, technologies, etc..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={criteria.keywords}
                onChange={(e) => setCriteria({...criteria, keywords: e.target.value})}
              />
            </div>
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            
            {/* Lead Count */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Lead Quantity</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of leads
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={leadCount}
                  onChange={(e) => setLeadCount(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Estimated cost:</span>
                  <span className="font-medium">${estimatedCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>High-quality leads:</span>
                  <span className="font-medium">~{estimatedQuality}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing time:</span>
                  <span className="font-medium">3-5 min</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="card">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'btn-primary hover:shadow-lg'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate Leads
                  </span>
                )}
              </button>
            </div>

            {/* Results */}
            {results && (
              <div className="card">
                <div className="text-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Leads Generated Successfully!
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total leads:</span>
                      <span className="font-medium">{results.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High-quality:</span>
                      <span className="font-medium">{results.high_value_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="font-medium">${results.cost.toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 btn-primary">
                    View in Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="card border-blue-200 bg-blue-50">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Pro Tips</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• More specific job titles = higher quality leads</li>
                <li>• Target 2-3 industries for best results</li>
                <li>• 25-100 leads per batch is optimal</li>
                <li>• AI scoring improves over time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}