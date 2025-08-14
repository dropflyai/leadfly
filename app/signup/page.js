'use client'

import React, { useState, useEffect } from 'react'
import { SparklesIcon, CheckIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PERMANENT_PRICING, getPricingWithPromo, getAllPricing } from '../../pricing-config.js'

export default function SignupPage() {
  const [selectedTier, setSelectedTier] = useState('growth')
  const [pricingInfo, setPricingInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  // Get selected plan from URL parameters
  useEffect(() => {
    const planFromUrl = searchParams.get('plan')
    if (planFromUrl && PERMANENT_PRICING[planFromUrl]) {
      setSelectedTier(planFromUrl)
    }
  }, [searchParams])

  // Calculate pricing when component loads or tier changes
  useEffect(() => {
    const pricing = getPricingWithPromo(selectedTier, null) // No promo codes in signup
    setPricingInfo(pricing)
  }, [selectedTier])

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match')
        return
      }

      // Create user ID for tracking
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store user data temporarily for post-checkout processing
      const userAccount = {
        id: userId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        phone: formData.phone,
        tier: selectedTier,
        pricing: pricingInfo,
        created_at: new Date().toISOString(),
        promo_used: promoApplied ? promoCode : null
      }

      // First create user account
      const userResponse = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          planId: selectedTier
        }),
      })

      const userData = await userResponse.json()

      if (!userResponse.ok) {
        throw new Error(userData.message || 'Failed to create user account')
      }

      // Store user session
      localStorage.setItem('leadfly_user', JSON.stringify(userData.user))
      localStorage.setItem('leadfly_checkout_user', JSON.stringify(userAccount))

      // Create Stripe checkout session
      const checkoutResponse = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedTier,
          promoCode: null, // Promo codes handled in Stripe checkout
          customerInfo: {
            userId: userData.user.id,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            company: formData.company
          }
        }),
      })

      const checkoutData = await checkoutResponse.json()

      if (checkoutResponse.ok && checkoutData.url) {
        // Redirect to Stripe checkout (or demo success page)
        window.location.href = checkoutData.url
      } else {
        throw new Error(checkoutData.message || 'Failed to create checkout session')
      }

    } catch (error) {
      console.error('Signup error:', error)
      setError(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const tiers = getAllPricing().map((tier) => ({
    key: tier.id,
    name: tier.name,
    leads_per_month: tier.leads_per_month,
    features: tier.features,
    pricing: getPricingWithPromo(tier.id, null) // No promo codes in signup
  }))

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
            <div className="flex space-x-4">
              <Link href="/auth" className="btn-ghost">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Start Your Neural Lead Generation
            </h2>
            <p className="text-xl text-dark-600 max-w-3xl mx-auto">
              Join thousands of companies using AI to generate high-quality leads and accelerate growth
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pricing Tiers */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold gradient-text mb-6">Choose Your Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tiers.map((tier) => (
                  <div
                    key={tier.key}
                    className={`glass-card interactive-hover cursor-pointer transition-all ${
                      selectedTier === tier.key ? 'ring-2 ring-electric-400 shadow-glow' : ''
                    }`}
                    onClick={() => setSelectedTier(tier.key)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-dark-900">{tier.name}</h4>
                        <p className="text-dark-600">{tier.leads_per_month} leads/month</p>
                      </div>
                      {selectedTier === tier.key && (
                        <CheckIcon className="w-6 h-6 text-electric-400" />
                      )}
                    </div>

                    <div className="mb-4">
                      {tier.pricing.discount > 0 && (
                        <div className="text-sm text-dark-600 line-through mb-1">
                          Was ${tier.pricing.monthly_price}/month
                        </div>
                      )}
                      <div className="text-3xl font-bold gradient-text">
                        ${tier.pricing.final_price}
                        <span className="text-base text-dark-600">/month</span>
                      </div>
                      {tier.pricing.discount > 0 && (
                        <div className="text-sm text-neon-400 font-semibold">
                          Save ${tier.pricing.discount}/month
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2 text-sm text-dark-600">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckIcon className="w-4 h-4 text-neon-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Promo Code Info */}
              <div className="glass-card mt-6">
                <h4 className="text-lg font-semibold mb-4">💡 Have a promo code?</h4>
                <p className="text-dark-600 text-sm">
                  You can enter your promo code during checkout to get instant discounts.
                  Valid codes include: FOUNDER100, LEADFLY100, DEMO100, LAUNCH50, SAVE25
                </p>
              </div>
            </div>

            {/* Signup Form */}
            <div className="lg:col-span-1">
              <div className="glass-card sticky top-24">
                <h3 className="text-xl font-bold gradient-text mb-6">Create Your Account</h3>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Order Summary */}
                  {pricingInfo && (
                    <div className="border-t border-dark-200/30 pt-4 mt-6">
                      <h4 className="font-semibold mb-2">Order Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>{pricingInfo.name} Plan</span>
                          <span>${pricingInfo.monthly_price}/month</span>
                        </div>
                        {pricingInfo.discount > 0 && (
                          <div className="flex justify-between text-neon-400">
                            <span>Promo Discount</span>
                            <span>-${pricingInfo.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t border-dark-200/30 pt-2">
                          <span>Total</span>
                          <span className="gradient-text">${pricingInfo.final_price}/month</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn-primary w-full group mt-6"
                    disabled={isLoading}
                  >
                    <span className="flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Start Neural Lead Generation
                          <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>

                  <p className="text-xs text-dark-500 text-center mt-4">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}