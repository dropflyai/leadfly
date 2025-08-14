'use client'

import { useState } from 'react'
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
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
    setIsLoading(true)
    
    try {
      // For now, simulate successful authentication
      console.log('Auth submit:', formData)
      
      // Store user session in localStorage for demo
      localStorage.setItem('leadfly_user', JSON.stringify({
        id: '00000000-0000-0000-0000-000000000000',
        email: formData.email,
        firstName: formData.firstName || 'Demo',
        lastName: formData.lastName || 'User',
        company: formData.company || 'Demo Company'
      }))
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    
    try {
      // Use Google OAuth popup - this would normally integrate with Google's OAuth API
      // For demo, we'll create a realistic authenticated user
      const authenticatedUser = {
        id: `google_${Date.now()}`,
        email: `user.${Math.floor(Math.random() * 10000)}@gmail.com`,
        firstName: 'Google',
        lastName: 'User',
        company: 'Demo Company',
        provider: 'google',
        picture: `https://ui-avatars.com/api/?name=Google+User&background=4285f4&color=fff&size=150`,
        tier: 'growth',
        created_at: new Date().toISOString(),
        isAuthenticated: true
      }
      
      // Store user session
      localStorage.setItem('leadfly_user', JSON.stringify(authenticatedUser))
      
      // Register user in backend
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authenticatedUser)
      })
      
      if (response.ok) {
        // Show success feedback
        const successDiv = document.createElement('div')
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
        successDiv.innerHTML = '✅ Successfully signed in with Google!'
        document.body.appendChild(successDiv)
        
        // Remove success message and redirect
        setTimeout(() => {
          document.body.removeChild(successDiv)
          router.push('/dashboard?welcome=true&auth=google')
        }, 2000)
      } else {
        throw new Error('Authentication registration failed')
      }
    } catch (error) {
      console.error('Google Sign-In error:', error)
      alert('Google Sign-In failed. Please try again.')
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

            {/* Quick Google Sign-In */}
            <div className="mb-8">
              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 w-full group flex items-center justify-center space-x-3 px-4 py-4 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-lg">
                  {isLoading ? 'Signing in...' : '🚀 Quick Start with Google'}
                </span>
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-200/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-dark-50 text-dark-600">or use email</span>
                </div>
              </div>
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

              <button type="submit" className="btn-primary w-full group" disabled={isLoading}>
                <span className="flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Initialize Neural Profile' : 'Access Quantum Core'}
                      <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
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