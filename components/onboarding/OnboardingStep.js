'use client'

import { useState } from 'react'
import ProfileSetup from './steps/ProfileSetup'
import FirstLeadCapture from './steps/FirstLeadCapture'
import AIFeaturesIntro from './steps/AIFeaturesIntro'
import DashboardTour from './steps/DashboardTour'
import IntegrationSetup from './steps/IntegrationSetup'
import TeamSetup from './steps/TeamSetup'
import WelcomeComplete from './steps/WelcomeComplete'

export default function OnboardingStep({ 
  user, 
  onboardingData, 
  currentStep, 
  onStepComplete, 
  onStepSkip, 
  onNextStep,
  onPrevStep 
}) {
  const [stepData, setStepData] = useState({})
  
  if (!onboardingData || !onboardingData.onboarding_steps) {
    return null
  }

  const steps = onboardingData.onboarding_steps.sort((a, b) => a.step_order - b.step_order)
  const currentStepData = steps[currentStep]
  
  if (!currentStepData) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Onboarding Complete! 🎉</h3>
        <p className="text-white/80 mb-6">
          You've completed all onboarding steps. Ready to start using LeadFly AI?
        </p>
        <button
          onClick={() => onStepComplete('onboarding_complete', { completed_all_steps: true })}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  const handleStepComplete = (data = {}) => {
    onStepComplete(currentStepData.step_name, { ...stepData, ...data })
    setStepData({})
    onNextStep()
  }

  const handleStepSkip = () => {
    onStepSkip(currentStepData.step_name)
    setStepData({})
  }

  const renderStepContent = () => {
    switch (currentStepData.step_name) {
      case 'welcome_complete':
        return (
          <WelcomeComplete
            user={user}
            onboardingData={onboardingData}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            stepData={stepData}
            setStepData={setStepData}
          />
        )
      
      case 'profile_setup':
        return (
          <ProfileSetup
            user={user}
            onboardingData={onboardingData}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            stepData={stepData}
            setStepData={setStepData}
          />
        )
      
      case 'first_lead_capture':
        return (
          <FirstLeadCapture
            user={user}
            onboardingData={onboardingData}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            stepData={stepData}
            setStepData={setStepData}
          />
        )
      
      case 'ai_features_intro':
        return (
          <AIFeaturesIntro
            user={user}
            onboardingData={onboardingData}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            stepData={stepData}
            setStepData={setStepData}
          />
        )
      
      case 'dashboard_tour':
        return (
          <DashboardTour
            user={user}
            onboardingData={onboardingData}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            stepData={stepData}
            setStepData={setStepData}
          />
        )
      
      case 'integration_setup':
        return (
          <IntegrationSetup
            user={user}
            onboardingData={onboardingData}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            stepData={stepData}
            setStepData={setStepData}
          />
        )
      
      case 'team_setup':
        return (
          <TeamSetup
            user={user}
            onboardingData={onboardingData}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            stepData={stepData}
            setStepData={setStepData}
          />
        )
      
      default:
        return (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Unknown Step</h3>
            <p className="text-white/80 mb-6">
              This step ({currentStepData.step_name}) is not yet implemented.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleStepSkip}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Skip Step
              </button>
              <button
                onClick={() => handleStepComplete({ skipped: true })}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevStep}
          disabled={currentStep === 0}
          className="flex items-center space-x-2 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="text-center">
          <div className="text-white/60 text-sm">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="text-white font-medium">
            {currentStepData.step_name.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </div>
        </div>

        <button
          onClick={() => handleStepComplete({ skipped: true })}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <span>Skip</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  )
}