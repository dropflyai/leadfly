'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ProfileSetup({ 
  user, 
  onboardingData, 
  onComplete, 
  onSkip, 
  stepData, 
  setStepData 
}) {
  const [profile, setProfile] = useState({
    full_name: '',
    company: '',
    title: '',
    industry: '',
    company_size: '',
    phone: '',
    website: '',
    goals: []
  })
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Load existing profile data
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          company: data.company || '',
          title: data.title || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          phone: data.phone || '',
          website: data.website || '',
          goals: data.goals || []
        })
      }
    }

    loadProfile()
  }, [user.id, supabase])

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setStepData(prev => ({ ...prev, [field]: value }))
  }

  const handleGoalToggle = (goal) => {
    const newGoals = profile.goals.includes(goal)
      ? profile.goals.filter(g => g !== goal)
      : [...profile.goals, goal]
    
    handleInputChange('goals', newGoals)
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          company: profile.company,
          title: profile.title,
          industry: profile.industry,
          company_size: profile.company_size,
          phone: profile.phone,
          website: profile.website,
          goals: profile.goals,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setSaveMessage('Profile saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)

    } catch (err) {
      console.error('Error saving profile:', err)
      setSaveMessage('Error saving profile')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    if (!profile.full_name || !profile.company) {
      setSaveMessage('Please fill in required fields (Name and Company)')
      return
    }

    onComplete({
      profile_completed: true,
      profile_data: profile,
      completion_time: new Date().toISOString()
    })
  }

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Professional Services',
    'Non-Profit',
    'Other'
  ]

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ]

  const goalOptions = [
    'Increase lead quality',
    'Reduce lead processing costs',
    'Improve conversion rates',
    'Automate lead qualification',
    'Better sales intelligence',
    'Integrate with existing tools',
    'Scale lead generation',
    'Improve team productivity'
  ]

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Let's Set Up Your Profile 👤</h2>
        <p className="text-white/80 text-lg">
          Help us personalize your LeadFly AI experience by telling us about yourself and your goals.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Personal Information */}
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Company Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your company name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Your Title
                </label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sales Manager, CEO"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Industry
                </label>
                <select
                  value={profile.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry} className="bg-gray-800">
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Company Size
                </label>
                <select
                  value={profile.company_size}
                  onChange={(e) => handleInputChange('company_size', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select company size</option>
                  {companySizes.map(size => (
                    <option key={size} value={size} className="bg-gray-800">
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Selection */}
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Your Goals with LeadFly AI</h3>
          <p className="text-white/70 mb-4">Select all that apply to help us personalize your experience:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goalOptions.map(goal => (
              <button
                key={goal}
                onClick={() => handleGoalToggle(goal)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  profile.goals.includes(goal)
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    profile.goals.includes(goal)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-white/40'
                  }`}>
                    {profile.goals.includes(goal) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span>{goal}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`text-center p-3 rounded-lg ${
            saveMessage.includes('Error') 
              ? 'bg-red-500/20 text-red-300' 
              : 'bg-green-500/20 text-green-300'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          
          <button
            onClick={onSkip}
            className="sm:w-auto bg-gray-500/20 hover:bg-gray-500/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Skip for Now
          </button>
          
          <button
            onClick={handleComplete}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Complete Setup →
          </button>
        </div>
      </div>

      {/* Benefits Preview */}
      <div className="mt-8 pt-8 border-t border-white/20">
        <h4 className="text-lg font-semibold text-white mb-4 text-center">
          🎯 Why complete your profile?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-2xl mb-2">🎨</div>
            <div className="text-white font-medium">Personalized Experience</div>
            <div className="text-white/60 text-sm">AI customized to your industry and goals</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-white font-medium">Better Insights</div>
            <div className="text-white/60 text-sm">Industry-specific analytics and benchmarks</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-white font-medium">Faster Setup</div>
            <div className="text-white/60 text-sm">Pre-configured templates and workflows</div>
          </div>
        </div>
      </div>
    </div>
  )
}