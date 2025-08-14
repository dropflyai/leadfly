'use client'

import { useState } from 'react'
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { PERMANENT_PRICING, getAllPricing } from '../../pricing-config.js'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('monthly')

  const plans = getAllPricing().map(plan => ({
    id: plan.id,
    name: plan.name,
    badge: plan.badge,
    price: { 
      monthly: plan.promotional_price || plan.monthly_price, 
      yearly: plan.yearly_price 
    },
    originalPrice: plan.promotional_price ? { 
      monthly: plan.monthly_price, 
      yearly: plan.yearly_price 
    } : null,
    leads: plan.leads_per_month,
    warmLeads: plan.leads_per_month,
    features: plan.features,
    limitations: [], // Add limitations if needed in pricing config
    popular: plan.popular,
    gradient: plan.gradient,
    stripeId: plan.stripe_price_id
  }))


  const addons = [
    {
      name: 'Cold Lead Expansion',
      description: 'Additional cold leads for more qualification opportunities',
      pricing: 'Cost per cold lead: $2-4 depending on tier and source quality',
      packages: [
        { leads: 100, starter: 350, growth: 280, scale: 220 },
        { leads: 250, starter: 750, growth: 600, scale: 480 },
        { leads: 500, starter: 1400, growth: 1100, scale: 850 }
      ],
      icon: '🎯'
    },
    {
      name: 'Premium Qualification',
      description: 'Enhanced AI scoring and multi-channel nurturing for higher conversion',
      pricing: 'Improves cold → warm conversion rates by 40-60%',
      packages: [
        { tier: 'Starter Boost', price: 127, features: ['Advanced AI scoring', 'LinkedIn research', 'Better templates'] },
        { tier: 'Growth Boost', price: 197, features: ['Predictive modeling', 'Custom sequences', 'Call optimization'] },
        { tier: 'Scale Boost', price: 297, features: ['ML qualification', 'Multi-touch attribution', 'Custom algorithms'] }
      ],
      icon: '🧠'
    },
    {
      name: 'Compliance Plus',
      description: 'Advanced legal compliance and call monitoring for regulated industries',
      pricing: 'Essential for financial services, insurance, and healthcare',
      packages: [
        { tier: 'Basic Compliance', price: 197, features: ['TCPA monitoring', 'Call recording', 'Basic reporting'] },
        { tier: 'Advanced Compliance', price: 397, features: ['Legal review', 'Industry templates', 'Audit trails'] },
        { tier: 'Enterprise Compliance', price: 797, features: ['Custom compliance', 'Legal consultation', 'Risk management'] }
      ],
      icon: '⚖️'
    },
    {
      name: 'White Label Platform',
      description: 'Transform your account into a white-label solution for reselling',
      pricing: 'Available for Scale tier and above only',
      packages: [
        { tier: 'Scale White Label', price: 497, features: ['Custom branding', 'Client management', 'Basic reseller tools'] },
        { tier: 'Enterprise Included', price: 0, features: ['Full platform', 'Revenue sharing', 'Advanced reseller program'] }
      ],
      icon: '🏷️'
    }
  ]

  const handleSubscribe = async (planId) => {
    // Redirect to signup page with selected plan
    window.location.href = `/signup?plan=${planId}`
  }

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
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="btn-ghost">Features</Link>
              <Link href="/pricing" className="btn-ghost text-electric-400">Pricing</Link>
              <Link href="/about" className="btn-ghost">About</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth" className="btn-secondary">Sign In</Link>
              <Link href="/auth" className="btn-primary group">
                Start Free Trial
                <ChevronRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text">Enterprise</span>
              <span className="text-dark-800"> Pricing</span>
            </h1>
            <p className="text-xl text-dark-600 mb-8 max-w-3xl mx-auto">
              Transparent pricing designed to scale with your business growth. 
              From startup agility to enterprise excellence.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-lg ${billingPeriod === 'monthly' ? 'text-dark-800 font-semibold' : 'text-dark-600'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-electric-500' : 'bg-dark-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${billingPeriod === 'yearly' ? 'text-dark-800 font-semibold' : 'text-dark-600'}`}>
                Yearly
              </span>
              {billingPeriod === 'yearly' && (
                <div className="bg-neon-500/20 text-neon-600 px-3 py-1 rounded-full text-sm font-semibold">
                  Save 15%
                </div>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative group transition-all duration-500 ${
                  plan.popular 
                    ? 'electric-card scale-105 z-10' 
                    : 'glass-card hover:scale-105'
                }`}
              >
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-glow ${
                    plan.popular 
                      ? 'bg-electric-gradient text-white' 
                      : plan.badge === 'Loss Leader' 
                        ? 'bg-neon-gradient text-white'
                        : plan.badge === 'White Label'
                          ? 'bg-purple-gradient text-white'
                          : 'bg-dark-200 text-dark-700'
                  }`}>
                    {plan.badge}
                  </div>
                </div>
                
                <div className="relative overflow-hidden pt-4">
                  <div className="gradient-streak"></div>
                  
                  <div className="text-center relative z-10">
                    <h3 className="text-xl font-bold mb-2 text-dark-800">{plan.name}</h3>
                    
                    <div className="mb-6">
                      {/* Promotional Badge */}
                      {plan.originalPrice && billingPeriod === 'monthly' && (
                        <div className="flex justify-center mb-3">
                          <div className="bg-neon-500/20 border border-neon-500/30 text-neon-600 px-3 py-1 rounded-full text-xs font-semibold shadow-neon">
                            Save ${(plan.originalPrice[billingPeriod] - plan.price[billingPeriod]).toLocaleString()}!
                          </div>
                        </div>
                      )}
                      
                      {plan.originalPrice && (
                        <div className="text-sm text-dark-600 line-through mb-1">
                          Was ${plan.originalPrice[billingPeriod].toLocaleString()}/{billingPeriod === 'monthly' ? 'month' : 'year'}
                        </div>
                      )}
                      <div className="text-4xl font-bold mb-2 text-dark-800">
                        ${plan.price[billingPeriod] ? plan.price[billingPeriod].toLocaleString() : 'N/A'}
                      </div>
                      <div className="text-sm text-dark-600">
                        /{billingPeriod === 'monthly' ? 'month' : 'year'}
                      </div>
                      {billingPeriod === 'yearly' && (
                        <div className="text-xs text-neon-600 mt-1">
                          Save ${((plan.price.monthly * 12) - plan.price.yearly).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-dark-800 mb-1">
                          {plan.leads.toLocaleString()} cold leads
                        </div>
                        <div className="text-xs text-dark-600 mb-2">↓ AI nurturing ↓</div>
                        <div className="text-2xl font-bold text-electric-600 mb-1">
                          {plan.warmLeads.toLocaleString()} warm calls
                        </div>
                        <div className="text-xs text-dark-600">qualified & ready</div>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-dark-800 mb-3">What's Included:</h4>
                      <ul className="space-y-2 text-sm">
                        {plan.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckIcon className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
                              plan.popular ? 'text-electric-400' : 'text-neon-400'
                            }`} />
                            <span className="text-dark-700 text-left text-xs">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 5 && (
                          <li className="text-xs text-dark-600">
                            +{plan.features.length - 5} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-dark-800 mb-3">Limitations:</h4>
                        <ul className="space-y-2 text-sm">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-400">⚠</span>
                              <span className="text-dark-600 text-left text-xs">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        plan.popular 
                          ? 'btn-primary' 
                          : 'btn-secondary hover:border-electric-500/50'
                      }`}
                    >
                      {plan.id === 'starter' ? 'Start Free Trial' : `Choose ${plan.name}`}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add-ons Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                <span className="text-dark-800">Platform</span>
                <span className="gradient-text"> Add-ons</span>
              </h2>
              <p className="text-lg text-dark-600">
                Enhance your platform capabilities with specialized modules
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {addons.map((addon, index) => (
                <div key={index} className="glass-card group interactive-hover">
                  <div className="text-center">
                    <div className="text-4xl mb-4">{addon.icon}</div>
                    <h3 className="text-lg font-bold mb-3 text-dark-800">{addon.name}</h3>
                    <p className="text-dark-600 mb-4 text-sm">{addon.description}</p>
                    
                    <div className="text-xs text-dark-600 mb-4 font-medium">
                      {addon.pricing}
                    </div>
                    
                    {addon.packages && (
                      <div className="space-y-3">
                        {addon.packages.map((pkg, idx) => (
                          <div key={idx} className="bg-dark-100/30 rounded-lg p-3">
                            {pkg.calls && (
                              <>
                                <div className="font-semibold text-dark-800 text-sm">{pkg.calls} calls</div>
                                <div className="text-xs space-y-1">
                                  {pkg.growth && <div>Growth: ${pkg.growth}</div>}
                                  {pkg.scale && <div>Scale: ${pkg.scale}</div>}
                                </div>
                              </>
                            )}
                            {pkg.leads && (
                              <>
                                <div className="font-semibold text-dark-800 text-sm">{pkg.leads} leads</div>
                                <div className="text-xs space-y-1">
                                  {pkg.starter && <div>Starter: ${pkg.starter}</div>}
                                  {pkg.growth && <div>Growth: ${pkg.growth}</div>}
                                  {pkg.scale && <div>Scale: ${pkg.scale}</div>}
                                </div>
                              </>
                            )}
                            {pkg.users && (
                              <>
                                <div className="font-semibold text-dark-800 text-sm">{pkg.users} users</div>
                                <div className="text-xs space-y-1">
                                  {pkg.growth && <div>Growth: ${pkg.growth}/mo</div>}
                                  {pkg.scale && <div>Scale: ${pkg.scale}/mo</div>}
                                  {pkg.enterprise === 0 && <div>Enterprise: Included</div>}
                                </div>
                              </>
                            )}
                            {pkg.tier && (
                              <>
                                <div className="font-semibold text-dark-800 text-sm">{pkg.tier}</div>
                                <div className="text-xs">
                                  {pkg.price > 0 ? `$${pkg.price}/mo` : 'Included'}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                <span className="gradient-text">Platform</span>
                <span className="text-dark-800"> FAQ</span>
              </h2>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "How accurate is the AI lead scoring?",
                  answer: "Our advanced AI models achieve 95.7% accuracy, trained on 2.4M+ successful lead conversions using proprietary algorithms."
                },
                {
                  question: "Can I upgrade or downgrade anytime?",
                  answer: "Yes! Changes take effect immediately. Upgrades are prorated, downgrades apply at next billing cycle."
                },
                {
                  question: "What integrations are supported?",
                  answer: "LinkedIn, Salesforce, HubSpot, Pipedrive, Mailchimp, Calendly, and 50+ enterprise APIs through our integration platform."
                },
                {
                  question: "Do you offer enterprise discounts?",
                  answer: "Yes! Enterprise plans include volume discounts, custom SLAs, and dedicated success managers."
                }
              ].map((faq, index) => (
                <div key={index} className="glass-card">
                  <h3 className="text-lg font-semibold mb-3 text-dark-800">{faq.question}</h3>
                  <p className="text-dark-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="electric-card max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                <span className="gradient-text">Ready to</span>
                <span className="text-dark-800"> Get Started?</span>
              </h2>
              
              <p className="text-xl text-dark-600 mb-8">
                Join 1000+ companies generating $127M+ with AI precision
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth" className="btn-primary text-xl px-8 py-4 group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                    Start Free Trial
                  </span>
                  <div className="gradient-streak"></div>
                </Link>
                
                <button className="btn-secondary text-xl px-8 py-4">
                  Schedule Platform Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}