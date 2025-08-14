'use client'

import { SparklesIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon, UserGroupIcon, RocketLaunchIcon, TrophyIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AboutPage() {
  const team = [
    {
      name: 'Dr. Alex Chen',
      role: 'Chief Technology Officer',
      bio: 'Former Google DeepMind researcher with 15+ years in machine learning. PhD in Computer Science from MIT.',
      avatar: '🧠',
      gradient: 'electric'
    },
    {
      name: 'Sarah Rodriguez',
      role: 'VP of Engineering',
      bio: 'Ex-Tesla autopilot engineer. Built scalable systems serving 100M+ requests. Stanford CS alumna.',
      avatar: '⚡',
      gradient: 'neon'
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of Growth',
      bio: 'Scaled 3 unicorn startups from seed to IPO. Expert in AI-driven growth strategies and performance marketing.',
      avatar: '🚀',
      gradient: 'purple'
    },
    {
      name: 'Dr. Lisa Wang',
      role: 'Chief Data Scientist',
      bio: 'MIT PhD in Statistical Learning. Published 50+ papers on predictive modeling and behavioral analytics.',
      avatar: '📊',
      gradient: 'electric'
    }
  ]

  const milestones = [
    { year: '2023', event: 'LeadFly AI Founded', description: 'Started with AI-powered vision' },
    { year: '2024', event: '10M+ Leads Processed', description: 'Achieved enterprise scale' },
    { year: '2024', event: '$50M Series A', description: 'Growth funding secured' },
    { year: '2025', event: 'Global AI Leader', description: 'Market leadership achieved' }
  ]

  const values = [
    {
      icon: RocketLaunchIcon,
      title: 'Continuous Innovation',
      description: 'We push the boundaries of AI to create breakthrough solutions',
      gradient: 'electric'
    },
    {
      icon: UserGroupIcon,
      title: 'Team Collaboration',
      description: 'Our distributed team works together with precision and efficiency',
      gradient: 'neon'
    },
    {
      icon: TrophyIcon,
      title: 'Excellence at Scale',
      description: 'Every algorithm, every feature is optimized for enterprise performance',
      gradient: 'purple'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Impact',
      description: 'Democratizing AI-powered growth for companies worldwide',
      gradient: 'electric'
    }
  ]

  const stats = [
    { number: '2.4M+', label: 'Leads Generated', gradient: 'electric' },
    { number: '95.7%', label: 'AI Accuracy', gradient: 'neon' },
    { number: '$127M+', label: 'Revenue Generated', gradient: 'purple' },
    { number: '1000+', label: 'Companies Served', gradient: 'electric' }
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
              <Link href="/features" className="btn-ghost">Features</Link>
              <Link href="/pricing" className="btn-ghost">Pricing</Link>
              <Link href="/about" className="btn-ghost text-electric-400">About</Link>
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
              <span className="text-dark-800">About</span>
              <span className="gradient-text"> LeadFly AI</span>
            </h1>
            <p className="text-xl text-dark-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              We're building the future of AI-powered lead generation. Our advanced algorithms and AI precision 
              are revolutionizing how companies scale from startup to enterprise success.
            </p>
          </div>

          {/* Mission */}
          <section className="mb-32">
            <div className="electric-card max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                <span className="gradient-text">Our</span>
                <span className="text-dark-800"> Mission</span>
              </h2>
              <p className="text-xl text-dark-700 leading-relaxed">
                To democratize AI-powered growth by making enterprise-scale lead generation accessible to every company. 
                We believe that with the right technology platform, any business can achieve sustainable growth 
                with precision engineering.
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="text-dark-800">Platform</span>
                <span className="gradient-text"> Impact</span>
              </h2>
              <p className="text-xl text-dark-600">
                Real numbers from our platform performance
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="glass-card text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    stat.gradient === 'electric' ? 'electric-text' :
                    stat.gradient === 'neon' ? 'neon-text' :
                    'bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent'
                  }`}>
                    {stat.number}
                  </div>
                  <div className="text-dark-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Values */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="gradient-text">Core</span>
                <span className="text-dark-800"> Values</span>
              </h2>
              <p className="text-xl text-dark-600">
                The core principles that guide our platform development
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="glass-card group interactive-hover text-center">
                  <div className={`inline-flex p-4 rounded-2xl mb-6 ${
                    value.gradient === 'electric' ? 'bg-electric-500/20 shadow-glow' :
                    value.gradient === 'neon' ? 'bg-neon-500/20 shadow-neon' :
                    'bg-purple-500/20 shadow-purple-glow'
                  }`}>
                    <value.icon className={`w-8 h-8 ${
                      value.gradient === 'electric' ? 'text-electric-400' :
                      value.gradient === 'neon' ? 'text-neon-400' :
                      'text-purple-400'
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-dark-800">{value.title}</h3>
                  <p className="text-dark-600">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="text-dark-800">Leadership</span>
                <span className="gradient-text"> Team</span>
              </h2>
              <p className="text-xl text-dark-600">
                The experienced team behind LeadFly AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="glass-card group interactive-hover text-center">
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-xl font-bold mb-2 text-dark-800">{member.name}</h3>
                  <div className={`text-sm font-semibold mb-4 ${
                    member.gradient === 'electric' ? 'electric-text' :
                    member.gradient === 'neon' ? 'neon-text' :
                    'bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent'
                  }`}>
                    {member.role}
                  </div>
                  <p className="text-dark-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="gradient-text">Company</span>
                <span className="text-dark-800"> Journey</span>
              </h2>
              <p className="text-xl text-dark-600">
                Our path to market leadership
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-electric-gradient"></div>
                
                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative flex items-center">
                      <div className="absolute left-6 w-4 h-4 bg-electric-400 rounded-full shadow-glow z-10"></div>
                      <div className="ml-20">
                        <div className="glass-card">
                          <div className="flex items-center mb-2">
                            <div className="text-2xl font-bold electric-text mr-4">{milestone.year}</div>
                            <h3 className="text-xl font-bold text-dark-800">{milestone.event}</h3>
                          </div>
                          <p className="text-dark-600">{milestone.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Join Us */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="text-dark-800">Join Our</span>
                <span className="gradient-text"> Growing Team</span>
              </h2>
              <p className="text-xl text-dark-600">
                Help us build the future of AI-powered growth
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'AI Engineers',
                  description: 'Build advanced algorithms that process millions of leads',
                  openings: '3 open roles',
                  gradient: 'electric'
                },
                {
                  title: 'Growth Hackers',
                  description: 'Scale AI systems to serve enterprise clients',
                  openings: '2 open roles',
                  gradient: 'neon'
                },
                {
                  title: 'Data Scientists',
                  description: 'Create predictive models with 95%+ accuracy',
                  openings: '4 open roles',
                  gradient: 'purple'
                }
              ].map((role, index) => (
                <div key={index} className="glass-card group interactive-hover">
                  <h3 className="text-xl font-bold mb-4 text-dark-800">{role.title}</h3>
                  <p className="text-dark-600 mb-4">{role.description}</p>
                  <div className={`text-sm font-semibold mb-6 ${
                    role.gradient === 'electric' ? 'electric-text' :
                    role.gradient === 'neon' ? 'neon-text' :
                    'bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent'
                  }`}>
                    {role.openings}
                  </div>
                  <button className="btn-secondary w-full">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section>
            <div className="electric-card text-center max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold mb-6">
                <span className="gradient-text">Ready to Scale</span>
                <span className="text-dark-800"> with Us?</span>
              </h2>
              
              <p className="text-xl text-dark-600 mb-8">
                Join 1000+ companies already experiencing accelerated growth with LeadFly AI
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