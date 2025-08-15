'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // For demo purposes, allow any email/password to access dashboard
      if (email && password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Store basic user info in localStorage for demo
        localStorage.setItem('leadfly_user', JSON.stringify({
          email,
          name: email.split('@')[0],
          loggedIn: true,
          loginTime: new Date().toISOString()
        }))
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError('Please enter both email and password')
      }
    } catch (err) {
      setError('Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoAccess = () => {
    // Quick demo access
    localStorage.setItem('leadfly_user', JSON.stringify({
      email: 'demo@leadfly.com',
      name: 'Demo User',
      loggedIn: true,
      loginTime: new Date().toISOString()
    }))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">LeadFly AI</h1>
          </div>
          <p className="text-gray-300">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Access */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <button
              onClick={handleDemoAccess}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
            >
              Quick Demo Access
            </button>
            <p className="text-gray-400 text-xs text-center mt-2">
              Skip login and explore the dashboard
            </p>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a href="/sign-up" className="text-blue-400 hover:text-blue-300">
                Sign up
              </a>
            </p>
            <a href="/" className="text-gray-400 hover:text-white text-sm">
              ← Back to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}