'use client'

import { useState } from 'react'
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    // TODO: Implement Supabase authentication
    console.log('Auth submit:', formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
            <Link href="/" className="btn-ghost">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen pt-16 px-6">
        <div className="max-w-md w-full">
          <div className="electric-card">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <SparklesIcon className="w-12 h-12 text-electric-400 animate-glow-pulse" />
                <div className="absolute inset-0 bg-electric-400/20 blur-xl rounded-full"></div>
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">
                {isSignUp ? 'Join Neural Network' : 'Access Neural Core'}
              </h2>
              <p className="text-dark-600">
                {isSignUp ? 'Create your quantum lead generation account' : 'Sign in to your AI command center'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Acme Corp"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="neural@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-700"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              <button type="submit" className="btn-primary w-full group">
                <span className="flex items-center justify-center">
                  {isSignUp ? 'Initialize Neural Profile' : 'Access Quantum Core'}
                  <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-dark-600">
                {isSignUp ? 'Already have neural access?' : 'Need quantum clearance?'}
              </p>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-electric-400 hover:text-electric-300 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-dark-200/30">
              <p className="text-xs text-dark-500 text-center">
                By accessing LeadFly AI, you agree to quantum-scale lead generation with 95.7% AI precision
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}