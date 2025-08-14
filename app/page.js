'use client'

import { useState, useEffect } from 'react'
import { ChevronRightIcon, CheckIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { 
  BoltIcon, 
  ChartBarIcon, 
  CogIcon, 
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  BeakerIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: CpuChipIcon,
      title: 'AI-Powered Intelligence',
      description: 'Advanced artificial intelligence analyzes and scores leads with 94% accuracy for maximum conversion potential',
      gradient: 'electric'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Enterprise Automation',
      description: 'Sophisticated automation engine orchestrates multi-channel outreach with precision timing and personalization',
      gradient: 'neon'
    },
    {
      icon: BeakerIcon,
      title: 'Data Intelligence Platform',
      description: 'Proprietary algorithms combine multiple data sources to create comprehensive prospect profiles and insights',
      gradient: 'purple'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level encryption with SOC2 compliance and real-time threat monitoring for complete data protection',
      gradient: 'electric'
    },
    {
      icon: LightBulbIcon,
      title: 'Predictive Analytics',
      description: 'Machine learning models predict conversion probability and identify optimal engagement opportunities',
      gradient: 'neon'
    },
    {
      icon: BoltIcon,
      title: 'Real-Time Processing',
      description: 'Lightning-fast lead scoring and qualification with instant notifications and comprehensive dashboards',
      gradient: 'purple'
    }
  ]

  const stats = [
    { label: 'Leads Generated', value: '2.4M+', gradient: 'electric' },
    { label: 'AI Accuracy', value: '95.7%', gradient: 'neon' },
    { label: 'Revenue Generated', value: '$127M+', gradient: 'purple' },
    { label: 'Processing Speed', value: '<1s', gradient: 'electric' }
  ]

  return (
    <div className="min-h-screen bg-dark-50 text-dark-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-streak-vertical"></div>
        <div 
          className="absolute w-96 h-96 rounded-full bg-electric-500/10 blur-3xl animate-float"
          style={{
            left: mousePosition.x - 192 + 'px',
            top: mousePosition.y - 192 + 'px',
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-80 h-80 rounded-full bg-neon-500/10 blur-3xl animate-pulse delay-1000"></div>
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
              <Link href="/pricing" className="btn-ghost">Pricing</Link>
              <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
              <Link href="/about" className="btn-ghost">About</Link>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton>
                  <button className="btn-secondary">Sign In</button>
                </SignInButton>
                <SignUpButton>
                  <button className="btn-primary group">
                    Start Free Trial
                    <ChevronRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative inline-block mb-6">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                Generate
                <span className="block gradient-text animate-gradient-shift">
                  Quality Leads
                </span>
                <span className="text-dark-700">with AI</span>
              </h1>
              <div className="text-sm text-electric-400 mt-2 font-bold">🚀 DEPLOYMENT VERIFICATION: JAN-14-2025-16:00 - CLERK AUTH ENABLED 🚀</div>
              <div className="absolute -top-4 -right-4">
                <div className="w-4 h-4 bg-neon-400 rounded-full animate-pulse shadow-neon"></div>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-dark-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Advanced AI-powered lead generation platform that delivers
              <span className="electric-text font-semibold"> high-quality, conversion-ready prospects </span>
              through intelligent
              <span className="neon-text font-semibold"> multi-channel automation </span>
              with 
              <span className="gradient-text font-semibold"> enterprise-grade compliance</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <SignUpButton>
                <button className="btn-primary text-xl px-8 py-4 group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <RocketLaunchIcon className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Start Free Trial
                  </span>
                  <div className="gradient-streak"></div>
                </button>
              </SignUpButton>
              
              <Link href="/features" className="btn-secondary text-xl px-8 py-4 group">
                <span className="flex items-center">
                  View Demo
                  <div className="w-2 h-2 bg-electric-400 rounded-full ml-3 animate-pulse"></div>
                </span>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className={`glass-card text-center transition-all duration-500 delay-${index * 100} ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <div className={`text-3xl font-bold mb-2 ${stat.gradient === 'electric' ? 'electric-text' : stat.gradient === 'neon' ? 'neon-text' : 'bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent'}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-dark-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-500/5 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-dark-800">Platform</span>
              <span className="gradient-text"> Features</span>
            </h2>
            <p className="text-xl text-dark-600 max-w-3xl mx-auto">
              Enterprise-grade technology platform built for scale and performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`glass-card group interactive-hover transition-all duration-500 delay-${index * 100} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-2xl mb-6 ${
                    feature.gradient === 'electric' ? 'bg-electric-500/20 shadow-glow' :
                    feature.gradient === 'neon' ? 'bg-neon-500/20 shadow-neon' :
                    'bg-purple-500/20 shadow-purple-glow'
                  }`}>
                    <feature.icon className={`w-8 h-8 ${
                      feature.gradient === 'electric' ? 'text-electric-400' :
                      feature.gradient === 'neon' ? 'text-neon-400' :
                      'text-purple-400'
                    }`} />
                  </div>
                  <div className="absolute top-0 right-0">
                    <div className={`status-dot ${
                      feature.gradient === 'electric' ? 'status-processing' :
                      feature.gradient === 'neon' ? 'status-online' :
                      'status-warning'
                    }`}></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-dark-800 group-hover:text-dark-900 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-dark-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Social Proof */}
      <section className="relative py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-dark-800">Trusted by</span>
              <span className="gradient-text"> Growth Leaders</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "LeadFly AI transformed our lead qualification process. We're seeing 3x higher conversion rates and much better ROI on our marketing spend.",
                author: "Sarah Chen",
                title: "VP of Marketing",
                company: "TechFlow Solutions",
                gradient: 'electric'
              },
              {
                quote: "The AI-powered lead scoring has been a game changer. We're focusing on the right prospects and closing deals faster than ever.",
                author: "Marcus Williams",
                title: "Chief Revenue Officer",
                company: "GrowthScale",
                gradient: 'neon'
              },
              {
                quote: "Impressive platform that delivers real results. The duplicate prevention alone saved us thousands while improving our lead quality.",
                author: "Lisa Rodriguez",
                title: "Head of Sales Operations",
                company: "Revenue Labs",
                gradient: 'purple'
              }
            ].map((testimonial, index) => (
              <div key={index} className={`glass-card group interactive-hover transition-all duration-500 delay-${index * 100}`}>
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-5 h-5 ${
                      testimonial.gradient === 'electric' ? 'text-electric-400' :
                      testimonial.gradient === 'neon' ? 'text-neon-400' :
                      'text-purple-400'
                    }`} />
                  ))}
                </div>
                
                <p className="text-dark-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                
                <div className="border-t border-dark-200/30 pt-4">
                  <div className="font-semibold text-dark-800">{testimonial.author}</div>
                  <div className="text-sm text-dark-600">{testimonial.title}</div>
                  <div className={`text-sm font-medium ${
                    testimonial.gradient === 'electric' ? 'electric-text' :
                    testimonial.gradient === 'neon' ? 'neon-text' :
                    'bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent'
                  }`}>
                    {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 lg:px-8">
        <div className="absolute inset-0 bg-electric-gradient opacity-10"></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="glass-card">
            <h2 className="text-5xl font-bold mb-6">
              <span className="gradient-text">Ready to Get</span>
              <span className="text-dark-800"> Started?</span>
            </h2>
            
            <p className="text-xl text-dark-600 mb-8">
              Join thousands of companies generating higher quality leads with AI-powered automation
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <SignUpButton>
                <button className="btn-primary text-xl px-8 py-4 group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                    Start Free Trial
                  </span>
                  <div className="gradient-streak"></div>
                </button>
              </SignUpButton>
              
              <Link href="/features" className="btn-secondary text-xl px-8 py-4">
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-dark-200/20 py-12 px-6 lg:px-8">
        <div className="absolute inset-0 bg-dark-gradient opacity-50"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-electric-400" />
                <h3 className="text-xl font-bold gradient-text">LeadFly AI</h3>
              </div>
              <p className="text-dark-600">
                AI-powered lead generation platform
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-dark-800">Platform</h4>
              <ul className="space-y-2 text-dark-600">
                <li><Link href="/features" className="hover:electric-text cursor-pointer transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:electric-text cursor-pointer transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:electric-text cursor-pointer transition-colors">API Access</Link></li>
                <li><Link href="/features" className="hover:electric-text cursor-pointer transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-dark-800">Company</h4>
              <ul className="space-y-2 text-dark-600">
                <li><Link href="/about" className="hover:neon-text cursor-pointer transition-colors">About</Link></li>
                <li><Link href="/about" className="hover:neon-text cursor-pointer transition-colors">Blog</Link></li>
                <li><Link href="/about" className="hover:neon-text cursor-pointer transition-colors">Careers</Link></li>
                <li><Link href="/about" className="hover:neon-text cursor-pointer transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-dark-800">Support</h4>
              <ul className="space-y-2 text-dark-600">
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">System Status</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dark-200/20 mt-8 pt-8 text-center text-dark-600">
            <p>&copy; 2025 LeadFly AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}