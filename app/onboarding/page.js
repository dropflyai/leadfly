'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import OnboardingProgress from '@/components/onboarding/OnboardingProgress'
import OnboardingStep from '@/components/onboarding/OnboardingStep'
import OnboardingCompletion from '@/components/onboarding/OnboardingCompletion'

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  const [user, setUser] = useState(null)
  const [onboardingData, setOnboardingData] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get session from URL or user session
  const sessionId = searchParams.get('session')

  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        
        if (!user) {
          router.push('/auth/signin')
          return
        }
        
        setUser(user)

        // Load onboarding data
        const { data: onboarding, error: onboardingError } = await supabase
          .from('subscriber_onboarding')
          .select(`
            *,
            onboarding_steps (
              id,
              step_name,
              step_order,
              status,
              started_at,
              completed_at,
              time_spent_seconds,
              step_data
            )
          `)
          .eq('user_id', user.id)
          .single()

        if (onboardingError && onboardingError.code !== 'PGRST116') {
          throw onboardingError
        }

        if (!onboarding) {
          // No onboarding found, redirect to dashboard
          router.push('/dashboard')
          return
        }

        setOnboardingData(onboarding)
        setCurrentStep(onboarding.current_step || 0)
        
      } catch (err) {
        console.error('Error loading onboarding:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadOnboardingData()
  }, [router, supabase, sessionId])

  const handleStepComplete = async (stepName, stepData = {}) => {
    try {
      // Call the complete step function
      const { error } = await supabase.rpc('complete_onboarding_step', {
        p_user_id: user.id,
        p_step_name: stepName,
        p_step_data: stepData
      })

      if (error) throw error

      // Track analytics
      await supabase.rpc('track_onboarding_event', {
        p_user_id: user.id,
        p_event_type: 'step_completed',
        p_event_data: { step_name: stepName, ...stepData },
        p_session_id: sessionId,
        p_page_url: window.location.href
      })

      // Reload onboarding data
      const { data: updated } = await supabase
        .from('subscriber_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (updated) {
        setOnboardingData(prev => ({ ...prev, ...updated }))
        setCurrentStep(updated.current_step)
      }

    } catch (err) {
      console.error('Error completing step:', err)
      setError(err.message)
    }
  }

  const handleSkipStep = async (stepName) => {
    try {
      const { error } = await supabase
        .from('onboarding_steps')
        .update({ status: 'skipped' })
        .eq('user_id', user.id)
        .eq('step_name', stepName)

      if (error) throw error

      // Move to next step
      setCurrentStep(prev => prev + 1)

    } catch (err) {
      console.error('Error skipping step:', err)
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your onboarding...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Onboarding Complete!</h2>
          <p className="text-white/80 mb-6">You've already completed your onboarding.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Check if onboarding is completed
  if (onboardingData.status === 'completed') {
    return (
      <OnboardingCompletion 
        user={user}
        onboardingData={onboardingData}
        onGoToDashboard={() => router.push('/dashboard')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to LeadFly AI! 🚀
          </h1>
          <p className="text-white/80 text-lg">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Progress Indicator */}
        <OnboardingProgress 
          onboardingData={onboardingData}
          currentStep={currentStep}
        />

        {/* Current Step */}
        <div className="max-w-4xl mx-auto mt-8">
          <OnboardingStep
            user={user}
            onboardingData={onboardingData}
            currentStep={currentStep}
            onStepComplete={handleStepComplete}
            onStepSkip={handleSkipStep}
            onNextStep={() => setCurrentStep(prev => prev + 1)}
            onPrevStep={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          />
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Need help? We're here for you! 💪
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="mailto:onboarding@leadfly-ai.com"
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors"
              >
                <div className="text-2xl mb-2">📧</div>
                <div className="font-semibold">Email Support</div>
                <div className="text-sm text-white/80">Quick response</div>
              </a>
              <a
                href="https://docs.leadfly-ai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors"
              >
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold">Documentation</div>
                <div className="text-sm text-white/80">Complete guides</div>
              </a>
              <a
                href="https://discord.gg/leadfly-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold">Community</div>
                <div className="text-sm text-white/80">Chat with experts</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}