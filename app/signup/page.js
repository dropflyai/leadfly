import { SignUp } from '@clerk/nextjs'
import { SparklesIcon, CheckIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { PERMANENT_PRICING, getAllPricing } from '../../pricing-config.js'

export default function SignupPage() {
  const tiers = getAllPricing().map((tier) => ({
    key: tier.id,
    name: tier.name,
    leads_per_month: tier.leads_per_month,
    features: tier.features,
    monthly_price: tier.monthly_price,
    promotional_price: tier.promotional_price,
    discount: tier.promotional_price ? tier.monthly_price - tier.promotional_price : 0
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
                  <div key={tier.key} className="glass-card interactive-hover">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-dark-900">{tier.name}</h4>
                        <p className="text-dark-600">{tier.leads_per_month} leads/month</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      {tier.discount > 0 && (
                        <div className="text-sm text-dark-600 line-through mb-1">
                          Was ${tier.monthly_price}/month
                        </div>
                      )}
                      <div className="text-3xl font-bold gradient-text">
                        ${tier.promotional_price || tier.monthly_price}
                        <span className="text-base text-dark-600">/month</span>
                      </div>
                      {tier.discount > 0 && (
                        <div className="text-sm text-neon-400 font-semibold">
                          Save ${tier.discount}/month
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
                </p>
              </div>
            </div>

            {/* Signup Form with Clerk */}
            <div className="lg:col-span-1">
              <div className="glass-card sticky top-24">
                <h3 className="text-xl font-bold gradient-text mb-6">Create Your Account</h3>
                
                {/* Clerk SignUp Component */}
                <div className="flex justify-center">
                  <SignUp 
                    routing="hash"
                    signInUrl="/auth"
                    afterSignUpUrl="/dashboard"
                    appearance={{
                      elements: {
                        formButtonPrimary: "btn-primary w-full",
                        card: "border-0 shadow-none p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 w-full group flex items-center justify-center space-x-3 px-4 py-4 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md mb-4",
                        formFieldInput: "input-field",
                        footerActionLink: "text-electric-400 hover:text-electric-300 font-semibold transition-colors",
                        identityPreviewEditButton: "text-electric-400 hover:text-electric-300"
                      }
                    }}
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-dark-200/30">
                  <p className="text-xs text-dark-500 text-center">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}