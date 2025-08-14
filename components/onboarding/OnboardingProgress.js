'use client'

import { CheckIcon, ClockIcon } from '@heroicons/react/24/solid'

export default function OnboardingProgress({ onboardingData, currentStep }) {
  if (!onboardingData || !onboardingData.onboarding_steps) {
    return null
  }

  const steps = onboardingData.onboarding_steps.sort((a, b) => a.step_order - b.step_order)
  const completionPercentage = onboardingData.completion_percentage || 0

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'pending'
  }

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="w-5 h-5 text-green-500" />
      case 'current':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
    }
  }

  const formatStepName = (stepName) => {
    return stepName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-white">Your Progress</h3>
          <span className="text-white/80">{completionPercentage}% Complete</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-white/70">
          {currentStep} of {steps.length} steps completed
        </div>
      </div>

      {/* Step Timeline */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isCompleted = step.status === 'completed'
          const isCurrent = index === currentStep
          
          return (
            <div 
              key={step.id}
              className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
                isCurrent 
                  ? 'bg-blue-500/20 border border-blue-500/50' 
                  : isCompleted 
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-white/5 border border-white/10'
              }`}
            >
              {/* Step Icon */}
              <div className={`flex-shrink-0 ${isCurrent ? 'animate-pulse' : ''}`}>
                {getStepIcon(status)}
              </div>

              {/* Step Info */}
              <div className="flex-grow">
                <h4 className={`font-medium ${
                  isCompleted ? 'text-green-400' : 
                  isCurrent ? 'text-blue-400' : 'text-white/70'
                }`}>
                  {formatStepName(step.step_name)}
                </h4>
                
                {step.completed_at && (
                  <p className="text-sm text-white/60">
                    Completed {new Date(step.completed_at).toLocaleDateString()}
                  </p>
                )}
                
                {step.time_spent_seconds > 0 && (
                  <p className="text-sm text-white/60">
                    Time spent: {Math.round(step.time_spent_seconds / 60)} minutes
                  </p>
                )}
              </div>

              {/* Step Status Badge */}
              <div className="flex-shrink-0">
                {isCompleted && (
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                    Complete
                  </span>
                )}
                {isCurrent && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                    Current
                  </span>
                )}
                {!isCompleted && !isCurrent && (
                  <span className="bg-white/10 text-white/60 px-2 py-1 rounded-full text-xs font-medium">
                    Pending
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Plan Info */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">
              {onboardingData.plan_type?.charAt(0).toUpperCase() + onboardingData.plan_type?.slice(1)} Plan
            </h4>
            <p className="text-white/60 text-sm">
              Started {new Date(onboardingData.started_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-sm">
              Expected completion
            </div>
            <div className="text-white font-medium">
              {onboardingData.plan_type === 'enterprise' ? '21 days' :
               onboardingData.plan_type === 'pro' ? '14 days' : '7 days'}
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {completionPercentage < 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h5 className="text-white font-medium">
                {completionPercentage >= 75 ? "Almost there!" :
                 completionPercentage >= 50 ? "Great progress!" :
                 completionPercentage >= 25 ? "You're doing great!" : "Let's get started!"}
              </h5>
              <p className="text-white/70 text-sm">
                {completionPercentage >= 75 ? "Just a few more steps to unlock the full power of LeadFly AI!" :
                 completionPercentage >= 50 ? "You're halfway through your onboarding journey." :
                 completionPercentage >= 25 ? "Keep going to unlock more features." : "Complete your setup to start generating qualified leads."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}