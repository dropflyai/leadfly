'use client'

import { useState, useEffect } from 'react'
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { PERMANENT_PRICING } from '../../../pricing-config.js'

export default function CheckoutSuccess() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
    
    // Get order details from URL parameters
    const sessionId = searchParams.get('session_id')
    const planId = searchParams.get('plan')
    
    if (sessionId && planId) {
      // Process the successful checkout
      processCheckoutSuccess(sessionId, planId)
    }
  }, [searchParams])

  const processCheckoutSuccess = async (sessionId, planId) => {
    try {
      // Get stored user data from checkout
      const checkoutUser = localStorage.getItem('leadfly_checkout_user')
      
      if (checkoutUser) {
        const userData = JSON.parse(checkoutUser)
        const planDetails = PERMANENT_PRICING[planId]
        
        // Create the successful order details
        const orderInfo = {
          orderId: sessionId.substring(0, 8),
          customerName: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          company: userData.company,
          plan: planDetails,
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
        
        setOrderDetails(orderInfo)
        
        // Store final user data
        const finalUser = {
          ...userData,
          subscriptionActive: true,
          stripeSessionId: sessionId,
          onboardingComplete: false
        }
        
        localStorage.setItem('leadfly_user', JSON.stringify(finalUser))
        localStorage.removeItem('leadfly_checkout_user') // Clean up
        
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Error processing checkout success:', error)
      setIsProcessing(false)
    }
  }

  const handleStartOnboarding = () => {
    router.push('/onboarding?step=welcome')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard?welcome=true&new_user=true')
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-dark-50 text-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-dark-600">Processing your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-50 text-dark-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-streak-vertical"></div>
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-electric-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-80 h-80 rounded-full bg-green-500/10 blur-3xl animate-pulse delay-1000"></div>
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
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircleIcon className="w-24 h-24 text-green-500 animate-bounce" />
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-4">
              <span className="gradient-text">Payment</span>
              <span className="text-green-600"> Successful!</span>
            </h1>
            
            <p className="text-2xl text-dark-600 mb-8">
              Welcome to LeadFly AI! Your subscription is now active.
            </p>
          </div>

          {/* Order Confirmation */}
          {orderDetails && (
            <div className={`electric-card mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold gradient-text mb-2">Order Confirmation</h2>
                <p className="text-dark-600">Order #{orderDetails.orderId}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Customer Details */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-dark-800">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-dark-600">Name:</span>
                      <span className="font-semibold">{orderDetails.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Email:</span>
                      <span className="font-semibold">{orderDetails.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Company:</span>
                      <span className="font-semibold">{orderDetails.company || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Order Date:</span>
                      <span className="font-semibold">{new Date(orderDetails.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Subscription Details */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-dark-800">Subscription Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-dark-600">Plan:</span>
                      <span className="font-semibold">{orderDetails.plan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Monthly Leads:</span>
                      <span className="font-semibold">{orderDetails.plan.leads_per_month}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Billing:</span>
                      <span className="font-semibold">Monthly</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-dark-200/30 pt-3">
                      <span>Total:</span>
                      <span className="gradient-text">${orderDetails.plan.monthly_price}/month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className={`glass-card mb-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-2xl font-bold gradient-text mb-6 text-center">What's Next?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-electric-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="font-bold mb-2">Complete Setup</h3>
                <p className="text-sm text-dark-600">Configure your preferences and lead criteria</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-neon-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold mb-2">Generate Leads</h3>
                <p className="text-sm text-dark-600">Start generating high-quality leads immediately</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-bold mb-2">Track Results</h3>
                <p className="text-sm text-dark-600">Monitor performance with real-time analytics</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <button 
              onClick={handleStartOnboarding}
              className="btn-primary text-xl px-8 py-4 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <RocketLaunchIcon className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Start Onboarding
              </span>
              <div className="gradient-streak"></div>
            </button>
            
            <button 
              onClick={handleGoToDashboard}
              className="btn-secondary text-xl px-8 py-4 group"
            >
              <span className="flex items-center">
                Go to Dashboard
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Support Information */}
          <div className={`text-center mt-12 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-dark-600 mb-4">
              Need help? Our support team is here for you 24/7
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="mailto:support@leadfly.ai" className="text-electric-400 hover:text-electric-300">
                Email Support
              </a>
              <span className="text-dark-400">•</span>
              <a href="/help" className="text-electric-400 hover:text-electric-300">
                Help Center
              </a>
              <span className="text-dark-400">•</span>
              <a href="/docs" className="text-electric-400 hover:text-electric-300">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}