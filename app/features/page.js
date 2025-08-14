'use client'

import { useState } from 'react'
import { SparklesIcon, PlayIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon, CpuChipIcon, RocketLaunchIcon, BeakerIcon, ShieldCheckIcon, LightBulbIcon, BoltIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function FeaturesPage() {
  const [selectedFeature, setSelectedFeature] = useState(0)

  const coreFeatures = [
    {
      icon: CpuChipIcon,
      title: 'AI-Powered Intelligence',
      description: 'Advanced machine learning models analyze and score leads with 95% accuracy using proprietary algorithms',
      details: [
        'Real-time lead scoring with advanced algorithms',
        'Intent signal detection across 100+ data sources',
        'Predictive conversion probability modeling',
        'Behavioral pattern recognition',
        'Automated lead prioritization'
      ],
      gradient: 'electric',
      demo: 'ai-scoring-demo.mp4'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Hyper-Scale Automation',
      description: 'Automated workflows orchestrate email, voice, and LinkedIn outreach across multiple channels',
      details: [
        'Multi-channel campaign orchestration',
        'Automated follow-up sequences',
        'Dynamic content personalization',
        'Cross-platform synchronization',
        'Performance optimization algorithms'
      ],
      gradient: 'neon',
      demo: 'automation-demo.mp4'
    },
    {
      icon: BeakerIcon,
      title: 'Multi-Source Fusion',
      description: 'Combines multiple data sources and proprietary algorithms for complete prospect profiles',
      details: [
        'Real-time data enrichment from 50+ sources',
        'Company intelligence aggregation',
        'Contact verification and validation',
        'Social media profile mapping',
        'Technographic data analysis'
      ],
      gradient: 'purple',
      demo: 'data-fusion-demo.mp4'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level encryption with SOC2 compliance and real-time threat monitoring',
      details: [
        'End-to-end encryption (AES-256)',
        'SOC2 Type II certified infrastructure',
        'GDPR and CCPA compliance',
        'Real-time threat detection',
        'Audit logs and compliance reporting'
      ],
      gradient: 'electric',
      demo: 'security-demo.mp4'
    },
    {
      icon: LightBulbIcon,
      title: 'Predictive Analytics',
      description: 'Machine learning models predict conversion probability and optimal outreach timing',
      details: [
        'Conversion probability modeling',
        'Optimal timing predictions',
        'A/B testing automation',
        'Performance trend analysis',
        'ROI optimization algorithms'
      ],
      gradient: 'neon',
      demo: 'analytics-demo.mp4'
    },
    {
      icon: BoltIcon,
      title: 'Real-Time Processing',
      description: 'Sub-second lead scoring with instant webhook notifications and live dashboards',
      details: [
        'Sub-second response times',
        'Real-time webhook notifications',
        'Live dashboard updates',
        'Instant alert systems',
        'High-availability infrastructure'
      ],
      gradient: 'purple',
      demo: 'realtime-demo.mp4'
    }
  ]

  const integrations = [
    { name: 'CRM Systems', logo: '🎯', category: 'Lead Management' },
    { name: 'Salesforce', logo: '☁️', category: 'CRM' },
    { name: 'HubSpot', logo: '🎯', category: 'CRM' },
    { name: 'Mailchimp', logo: '📧', category: 'Email Marketing' },
    { name: 'Calendly', logo: '📅', category: 'Scheduling' },
    { name: 'MongoDB', logo: '🍃', category: 'Database' },
    { name: 'Stripe', logo: '💳', category: 'Payments' },
    { name: 'LinkedIn', logo: '💼', category: 'Social' },
    { name: 'Google', logo: '🔍', category: 'Search' },
    { name: 'HubSpot', logo: '🎯', category: 'CRM' },
    { name: 'Salesforce', logo: '☁️', category: 'CRM' },
    { name: 'Zapier', logo: '⚙️', category: 'Automation' }
  ]

  const useCases = [
    {
      title: 'SaaS Lead Generation',
      description: 'Scale from 0 to 1000+ qualified B2B leads per month',
      metrics: ['847% pipeline increase', '95.7% accuracy rate', '<1s processing time'],
      gradient: 'electric'
    },
    {
      title: 'Enterprise Sales',
      description: 'AI-powered account-based marketing for large deals',
      metrics: ['$127M+ revenue generated', 'Enterprise-grade performance', '2.4M+ leads processed'],
      gradient: 'neon'
    },
    {
      title: 'Agency Scaling',
      description: 'White-label solutions for marketing agencies',
      metrics: ['10x client capacity', 'Custom branding', 'API integrations'],
      gradient: 'purple'
    }
  ]

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
              <Link href="/features" className="btn-ghost text-electric-400">Features</Link>
              <Link href="/pricing" className="btn-ghost">Pricing</Link>
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
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold mb-6">
              <span className="text-dark-800">Platform</span>
              <span className="gradient-text"> Architecture</span>
            </h1>
            <p className="text-xl text-dark-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Built on enterprise-grade infrastructure with precision engineering.
              Experience the future of AI-powered lead generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth" className="btn-primary text-xl px-8 py-4 group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <RocketLaunchIcon className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  Launch Platform
                </span>
                <div className="gradient-streak"></div>
              </Link>
              
              <button className="btn-secondary text-xl px-8 py-4 group">
                <span className="flex items-center">
                  <PlayIcon className="w-6 h-6 mr-3" />
                  Watch Demo
                </span>
              </button>
            </div>
          </div>

          {/* Core Features */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="gradient-text">Core</span>
                <span className="text-dark-800"> Features</span>
              </h2>
              <p className="text-xl text-dark-600">
                Six advanced modules working in perfect harmony
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
              <div className="space-y-6">
                {coreFeatures.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedFeature(index)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedFeature === index 
                        ? 'electric-card scale-105' 
                        : 'glass-card hover:scale-102'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        feature.gradient === 'electric' ? 'bg-electric-500/20 shadow-glow' :
                        feature.gradient === 'neon' ? 'bg-neon-500/20 shadow-neon' :
                        'bg-purple-500/20 shadow-purple-glow'
                      }`}>
                        <feature.icon className={`w-6 h-6 ${
                          feature.gradient === 'electric' ? 'text-electric-400' :
                          feature.gradient === 'neon' ? 'text-neon-400' :
                          'text-purple-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-dark-800">{feature.title}</h3>
                        <p className="text-dark-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card">
                <div className="aspect-video bg-dark-100 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-6xl">🎬</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-dark-800">
                  {coreFeatures[selectedFeature].title}
                </h3>
                <ul className="space-y-3">
                  {coreFeatures[selectedFeature].details.map((detail, index) => (
                    <li key={index} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        coreFeatures[selectedFeature].gradient === 'electric' ? 'bg-electric-400' :
                        coreFeatures[selectedFeature].gradient === 'neon' ? 'bg-neon-400' :
                        'bg-purple-400'
                      }`}></div>
                      <span className="text-dark-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="text-dark-800">Enterprise</span>
                <span className="gradient-text"> Use Cases</span>
              </h2>
              <p className="text-xl text-dark-600">
                Proven solutions across industries and scales
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className="glass-card group interactive-hover">
                  <h3 className="text-xl font-bold mb-4 text-dark-800">{useCase.title}</h3>
                  <p className="text-dark-600 mb-6">{useCase.description}</p>
                  
                  <div className="space-y-3">
                    {useCase.metrics.map((metric, idx) => (
                      <div key={idx} className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                        useCase.gradient === 'electric' ? 'bg-electric-500/20 text-electric-700' :
                        useCase.gradient === 'neon' ? 'bg-neon-500/20 text-neon-700' :
                        'bg-purple-500/20 text-purple-700'
                      }`}>
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Integrations */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="gradient-text">Platform</span>
                <span className="text-dark-800"> Integrations</span>
              </h2>
              <p className="text-xl text-dark-600">
                Seamlessly connects with your entire tech stack
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {integrations.map((integration, index) => (
                <div key={index} className="glass-card text-center group interactive-hover">
                  <div className="text-4xl mb-3">{integration.logo}</div>
                  <h3 className="font-semibold text-dark-800 mb-1">{integration.name}</h3>
                  <p className="text-xs text-dark-600">{integration.category}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section>
            <div className="electric-card text-center max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold mb-6">
                <span className="gradient-text">Ready to</span>
                <span className="text-dark-800"> Get Started?</span>
              </h2>
              
              <p className="text-xl text-dark-600 mb-8">
                Join 1000+ companies scaling with AI precision. Start your growth transformation today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth" className="btn-primary text-xl px-8 py-4 group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                    Start Free Trial
                  </span>
                  <div className="gradient-streak"></div>
                </Link>
                
                <Link href="/pricing" className="btn-secondary text-xl px-8 py-4">
                  View Pricing
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}