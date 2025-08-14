'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function OnboardingCompletion({ 
  user, 
  onboardingData, 
  onGoToDashboard 
}) {
  const [stats, setStats] = useState({
    timeSpent: 0,
    stepsCompleted: 0,
    featuresUnlocked: 0
  })
  const [celebrationShown, setCelebrationShown] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Calculate completion stats
    if (onboardingData) {
      const startTime = new Date(onboardingData.started_at)
      const endTime = new Date(onboardingData.completed_at || new Date())
      const timeSpent = Math.round((endTime - startTime) / (1000 * 60 * 60)) // hours
      
      const stepsCompleted = onboardingData.onboarding_steps?.filter(
        step => step.status === 'completed'
      ).length || 0

      const planFeatures = {
        starter: 4,
        pro: 7,
        enterprise: 12
      }

      setStats({
        timeSpent: Math.max(1, timeSpent),
        stepsCompleted,
        featuresUnlocked: planFeatures[onboardingData.plan_type] || 4
      })
    }

    // Show celebration animation
    setTimeout(() => setCelebrationShown(true), 500)

    // Track completion analytics
    if (user && onboardingData) {
      supabase.rpc('track_onboarding_event', {
        p_user_id: user.id,
        p_event_type: 'onboarding_completed',
        p_event_data: {
          plan_type: onboardingData.plan_type,
          time_spent_hours: stats.timeSpent,
          steps_completed: stats.stepsCompleted,
          completion_date: new Date().toISOString()
        }
      })
    }
  }, [onboardingData, user, supabase, stats.timeSpent, stats.stepsCompleted])

  const getNextSteps = () => {
    const baseSteps = [
      {
        icon: '🎯',
        title: 'Capture Your First Lead',
        description: 'Set up your first lead capture form and start generating qualified leads',
        action: 'Go to Lead Capture'
      },
      {
        icon: '📊',
        title: 'Explore Analytics',
        description: 'View your performance dashboard and track lead quality metrics',
        action: 'View Analytics'
      },
      {
        icon: '🤖',
        title: 'Try AI Features',
        description: 'Experience our advanced AI lead scoring and qualification',
        action: 'Try AI Features'
      }
    ]

    const planSpecificSteps = {
      pro: [
        {
          icon: '🔌',
          title: 'Connect Integrations',
          description: 'Link your CRM and marketing tools for seamless workflows',
          action: 'Setup Integrations'
        }
      ],
      enterprise: [
        {
          icon: '🔌',
          title: 'Connect Integrations',
          description: 'Link your CRM and marketing tools for seamless workflows',
          action: 'Setup Integrations'
        },
        {
          icon: '👥',
          title: 'Invite Team Members',
          description: 'Add your team and set up permissions for collaboration',
          action: 'Manage Team'
        }
      ]
    }

    return [...baseSteps, ...(planSpecificSteps[onboardingData.plan_type] || [])]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Celebration Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${
          celebrationShown ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}>
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Congratulations!
          </h1>
          <h2 className="text-2xl text-white/80 mb-6">
            You've successfully completed your LeadFly AI onboarding
          </h2>
          
          {/* Achievement Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.timeSpent}h</div>
              <div className="text-white/80">Time to Complete</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.stepsCompleted}</div>
              <div className="text-white/80">Steps Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">{stats.featuresUnlocked}</div>
              <div className="text-white/80">Features Unlocked</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - What's Next */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">What's Next? 🚀</h3>
            
            <div className="space-y-4">
              {getNextSteps().map((step, index) => (
                <div 
                  key={index}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{step.icon}</div>
                    <div className="flex-grow">
                      <h4 className="text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-white/70 text-sm mb-2">
                        {step.description}
                      </p>
                      <div className="text-blue-400 text-sm font-medium group-hover:text-blue-300">
                        {step.action} →
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Plan Benefits */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Your {onboardingData.plan_type?.charAt(0).toUpperCase() + onboardingData.plan_type?.slice(1)} Plan Benefits 💎
            </h3>
            
            <div className="space-y-4">
              {onboardingData.plan_type === 'starter' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">50 qualified leads per month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">99.2% duplicate prevention</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">AI lead scoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">Basic analytics dashboard</span>
                  </div>
                </>
              )}

              {onboardingData.plan_type === 'pro' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">200 qualified leads per month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">Advanced AI insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">CRM integrations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">API access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">Priority support</span>
                  </div>
                </>
              )}

              {onboardingData.plan_type === 'enterprise' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">Unlimited qualified leads</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">White-label solution</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">Custom integrations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">Dedicated success manager</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white">24/7 priority support</span>
                  </div>
                </>
              )}
            </div>

            {/* Upgrade Prompt for Starter/Pro */}
            {onboardingData.plan_type !== 'enterprise' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                <h4 className="text-white font-semibold mb-2">
                  Ready for more? 🚀
                </h4>
                <p className="text-white/70 text-sm mb-3">
                  Upgrade your plan to unlock more features and higher lead limits.
                </p>
                <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-purple-600 hover:to-blue-600 transition-all">
                  View Upgrade Options
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
          <button
            onClick={onGoToDashboard}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            Go to Dashboard 🚀
          </button>
          
          <button
            onClick={() => window.open('https://docs.leadfly-ai.com', '_blank')}
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all"
          >
            View Documentation 📚
          </button>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 text-white/60">
          <p>Need help getting started? Reach out to us!</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="mailto:onboarding@leadfly-ai.com" className="hover:text-white transition-colors">
              📧 Email Support
            </a>
            <a href="https://discord.gg/leadfly-ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              💬 Discord Community
            </a>
            <a href="https://docs.leadfly-ai.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              📖 Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}