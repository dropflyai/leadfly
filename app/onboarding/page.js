'use client'

import { useState, useEffect } from 'react'
import { SparklesIcon, CheckIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userData, setUserData] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const [onboardingData, setOnboardingData] = useState({
    // Step 1: Lead Criteria
    targetIndustries: [],
    companySize: '',
    targetRoles: [],
    
    // Step 2: Campaign Preferences  
    campaignName: '',
    emailSequences: true,
    voiceOutreach: false,
    linkedinOutreach: true,
    
    // Step 3: Integration Setup
    crmIntegration: 'none',
    webhookUrl: '',
    
    // Step 4: Goals & Expectations
    monthlyLeadGoal: '',
    primaryGoal: '',
    currentChallenges: []
  })

  useEffect(() => {
    setIsLoaded(true)
    
    // Get user data
    const user = localStorage.getItem('leadfly_user')
    if (user) {
      setUserData(JSON.parse(user))
    }
    
    // Check if we should skip to a specific step
    const step = searchParams.get('step')
    if (step === 'welcome') {
      setCurrentStep(0)
    }
  }, [searchParams])

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to LeadFly AI!',
      subtitle: 'Let\'s get you set up for success',
      component: WelcomeStep
    },
    {
      id: 'criteria',
      title: 'Define Your Ideal Prospects',
      subtitle: 'Help our AI understand who you want to target',
      component: LeadCriteriaStep
    },
    {
      id: 'campaigns',
      title: 'Configure Your Campaigns',
      subtitle: 'Set up your automated outreach preferences',
      component: CampaignStep
    },
    {
      id: 'integrations',
      title: 'Connect Your Tools',
      subtitle: 'Integrate with your existing workflow',
      component: IntegrationStep
    },
    {
      id: 'goals',
      title: 'Set Your Goals',
      subtitle: 'Define success metrics and expectations',
      component: GoalsStep
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      subtitle: 'Ready to generate high-quality leads',
      component: CompletionStep
    }
  ]

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    // Mark onboarding as complete and go to dashboard
    if (userData) {
      const updatedUser = {
        ...userData,
        onboardingComplete: true,
        onboardingData: onboardingData
      }
      localStorage.setItem('leadfly_user', JSON.stringify(updatedUser))
    }
    router.push('/dashboard?onboarding=skipped')
  }

  const handleComplete = () => {
    // Mark onboarding as complete
    if (userData) {
      const updatedUser = {
        ...userData,
        onboardingComplete: true,
        onboardingData: onboardingData
      }
      localStorage.setItem('leadfly_user', JSON.stringify(updatedUser))
    }
    router.push('/dashboard?onboarding=completed&first_time=true')
  }

  const updateOnboardingData = (updates) => {
    setOnboardingData(prev => ({
      ...prev,
      ...updates
    }))
  }

  const CurrentStepComponent = onboardingSteps[currentStep]?.component || WelcomeStep

  return (
    <div className="min-h-screen bg-dark-50 text-dark-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-streak-vertical"></div>
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-electric-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 nav-blur">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <SparklesIcon className="w-8 h-8 text-electric-400 animate-glow-pulse" />
                <div className="absolute inset-0 bg-electric-400/20 blur-xl rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold gradient-text">LeadFly AI</h1>
            </Link>
            
            <button 
              onClick={handleSkip}
              className="btn-ghost text-sm"
            >
              Skip Setup
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-dark-600">
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
              <span className="text-sm text-dark-600">
                {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% Complete
              </span>
            </div>
            
            <div className="w-full bg-dark-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-electric-gradient transition-all duration-300"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                <span className="gradient-text">{onboardingSteps[currentStep]?.title}</span>
              </h1>
              <p className="text-xl text-dark-600">
                {onboardingSteps[currentStep]?.subtitle}
              </p>
            </div>

            <CurrentStepComponent 
              data={onboardingData}
              updateData={updateOnboardingData}
              userData={userData}
              onNext={handleNext}
              onComplete={handleComplete}
            />
          </div>

          {/* Navigation Buttons */}
          {currentStep < onboardingSteps.length - 1 && (
            <div className="flex justify-between mt-12">
              <button 
                onClick={handlePrevious}
                className={`btn-secondary flex items-center ${currentStep === 0 ? 'invisible' : ''}`}
                disabled={currentStep === 0}
              >
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Previous
              </button>
              
              <button 
                onClick={handleNext}
                className="btn-primary flex items-center group"
              >
                Next Step
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Welcome Step Component
function WelcomeStep({ userData, onNext }) {
  return (
    <div className="electric-card text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="w-24 h-24 bg-electric-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl">🚀</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">
          Welcome{userData?.firstName ? ` ${userData.firstName}` : ''}!
        </h2>
        
        <p className="text-dark-600 leading-relaxed">
          You're now part of the LeadFly AI family. We'll help you set up your lead generation 
          engine in just a few minutes. Our AI will learn your preferences and start generating 
          high-quality prospects tailored to your business.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-neon-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h3 className="font-bold mb-2">Quick Setup</h3>
          <p className="text-sm text-dark-600">5 minutes to complete</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="font-bold mb-2">Targeted Results</h3>
          <p className="text-sm text-dark-600">AI-powered precision</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-electric-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📈</span>
          </div>
          <h3 className="font-bold mb-2">Immediate Impact</h3>
          <p className="text-sm text-dark-600">Start generating today</p>
        </div>
      </div>

      <button 
        onClick={onNext}
        className="btn-primary text-lg px-8 py-4 group"
      >
        Let's Get Started
        <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

// Lead Criteria Step
function LeadCriteriaStep({ data, updateData }) {
  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Manufacturing',
    'Retail', 'Education', 'Professional Services', 'Marketing', 'Other'
  ]
  
  const roles = [
    'CEO', 'CTO', 'VP Sales', 'Marketing Director', 'Business Owner',
    'Operations Manager', 'Product Manager', 'HR Director', 'CFO', 'Other'
  ]

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ]

  const toggleIndustry = (industry) => {
    const current = data.targetIndustries || []
    const updated = current.includes(industry) 
      ? current.filter(i => i !== industry)
      : [...current, industry]
    updateData({ targetIndustries: updated })
  }

  const toggleRole = (role) => {
    const current = data.targetRoles || []
    const updated = current.includes(role) 
      ? current.filter(r => r !== role)
      : [...current, role]
    updateData({ targetRoles: updated })
  }

  return (
    <div className="glass-card max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Industries */}
        <div>
          <h3 className="text-xl font-bold mb-4">Target Industries</h3>
          <p className="text-dark-600 mb-4">Select the industries you want to target (choose multiple)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {industries.map(industry => (
              <button
                key={industry}
                onClick={() => toggleIndustry(industry)}
                className={`p-3 rounded-lg border transition-all ${
                  data.targetIndustries?.includes(industry)
                    ? 'border-electric-400 bg-electric-500/10 text-electric-600'
                    : 'border-dark-200 hover:border-electric-300'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Company Size */}
        <div>
          <h3 className="text-xl font-bold mb-4">Company Size</h3>
          <p className="text-dark-600 mb-4">What size companies do you want to target?</p>
          <div className="space-y-3">
            {companySizes.map(size => (
              <label key={size.value} className="flex items-center">
                <input
                  type="radio"
                  name="companySize"
                  value={size.value}
                  checked={data.companySize === size.value}
                  onChange={(e) => updateData({ companySize: e.target.value })}
                  className="mr-3"
                />
                <span>{size.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Target Roles */}
        <div>
          <h3 className="text-xl font-bold mb-4">Target Roles</h3>
          <p className="text-dark-600 mb-4">What roles/titles are you looking to connect with?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => toggleRole(role)}
                className={`p-3 rounded-lg border transition-all ${
                  data.targetRoles?.includes(role)
                    ? 'border-electric-400 bg-electric-500/10 text-electric-600'
                    : 'border-dark-200 hover:border-electric-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Campaign Step
function CampaignStep({ data, updateData }) {
  return (
    <div className="glass-card max-w-3xl mx-auto">
      <div className="space-y-8">
        <div>
          <label className="block text-lg font-bold mb-4">Campaign Name</label>
          <input
            type="text"
            placeholder="e.g., Q1 2025 Enterprise Outreach"
            value={data.campaignName}
            onChange={(e) => updateData({ campaignName: e.target.value })}
            className="input-field w-full"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Outreach Channels</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.emailSequences}
                onChange={(e) => updateData({ emailSequences: e.target.checked })}
                className="mr-3"
              />
              <span>Email Sequences (Recommended)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.voiceOutreach}
                onChange={(e) => updateData({ voiceOutreach: e.target.checked })}
                className="mr-3"
              />
              <span>Voice Outreach (Premium)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.linkedinOutreach}
                onChange={(e) => updateData({ linkedinOutreach: e.target.checked })}
                className="mr-3"
              />
              <span>LinkedIn Outreach</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// Integration Step
function IntegrationStep({ data, updateData }) {
  const crmOptions = [
    { value: 'none', label: 'None (I\'ll set up later)' },
    { value: 'salesforce', label: 'Salesforce' },
    { value: 'hubspot', label: 'HubSpot' },
    { value: 'pipedrive', label: 'Pipedrive' },
    { value: 'other', label: 'Other CRM' }
  ]

  return (
    <div className="glass-card max-w-3xl mx-auto">
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">CRM Integration</h3>
          <p className="text-dark-600 mb-4">Connect your CRM to automatically sync leads</p>
          <div className="space-y-3">
            {crmOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="crmIntegration"
                  value={option.value}
                  checked={data.crmIntegration === option.value}
                  onChange={(e) => updateData({ crmIntegration: e.target.value })}
                  className="mr-3"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-bold mb-4">Webhook URL (Optional)</label>
          <input
            type="url"
            placeholder="https://your-app.com/webhooks/leadfly"
            value={data.webhookUrl}
            onChange={(e) => updateData({ webhookUrl: e.target.value })}
            className="input-field w-full"
          />
          <p className="text-sm text-dark-500 mt-2">
            We'll send real-time notifications when new leads are generated
          </p>
        </div>
      </div>
    </div>
  )
}

// Goals Step
function GoalsStep({ data, updateData }) {
  const goalOptions = [
    'Generate more qualified leads',
    'Improve conversion rates',
    'Scale outbound operations',
    'Enter new markets',
    'Increase revenue'
  ]

  const challengeOptions = [
    'Finding quality prospects',
    'Low response rates',
    'Time-consuming manual work',
    'Inconsistent messaging',
    'Poor lead qualification'
  ]

  const toggleChallenge = (challenge) => {
    const current = data.currentChallenges || []
    const updated = current.includes(challenge) 
      ? current.filter(c => c !== challenge)
      : [...current, challenge]
    updateData({ currentChallenges: updated })
  }

  return (
    <div className="glass-card max-w-3xl mx-auto">
      <div className="space-y-8">
        <div>
          <label className="block text-lg font-bold mb-4">Monthly Lead Goal</label>
          <input
            type="number"
            placeholder="e.g., 100"
            value={data.monthlyLeadGoal}
            onChange={(e) => updateData({ monthlyLeadGoal: e.target.value })}
            className="input-field w-full"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Primary Goal</h3>
          <div className="space-y-3">
            {goalOptions.map(goal => (
              <label key={goal} className="flex items-center">
                <input
                  type="radio"
                  name="primaryGoal"
                  value={goal}
                  checked={data.primaryGoal === goal}
                  onChange={(e) => updateData({ primaryGoal: e.target.value })}
                  className="mr-3"
                />
                <span>{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Current Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challengeOptions.map(challenge => (
              <button
                key={challenge}
                onClick={() => toggleChallenge(challenge)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  data.currentChallenges?.includes(challenge)
                    ? 'border-electric-400 bg-electric-500/10 text-electric-600'
                    : 'border-dark-200 hover:border-electric-300'
                }`}
              >
                {challenge}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Completion Step
function CompletionStep({ onComplete, userData }) {
  return (
    <div className="electric-card text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="w-12 h-12 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold mb-4">
          Congratulations{userData?.firstName ? ` ${userData.firstName}` : ''}!
        </h2>
        
        <p className="text-dark-600 leading-relaxed mb-8">
          Your LeadFly AI account is fully configured and ready to generate high-quality leads. 
          Our AI is already analyzing your criteria and will start producing targeted prospects 
          within the next few hours.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-electric-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="font-bold mb-2">AI Processing</h3>
            <p className="text-sm text-dark-600">Your criteria are being analyzed</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-neon-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="font-bold mb-2">Lead Generation</h3>
            <p className="text-sm text-dark-600">First leads in 2-4 hours</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onComplete}
        className="btn-primary text-lg px-8 py-4 group"
      >
        Enter Dashboard
        <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}