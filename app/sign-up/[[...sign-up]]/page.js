'use client'

import { SignUp } from '@clerk/nextjs'
import { SparklesIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-50 text-dark-900 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-electric-400/30 border-t-electric-400 rounded-full animate-spin"></div>
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
                Join Neural Network
              </h2>
              <p className="text-dark-600">
                Create your AI command center account
              </p>
            </div>

            {/* Clerk SignUp Component with Error Boundary */}
            <div className="flex justify-center">
              <div className="w-full">
                <SignUp 
                  path="/sign-up"
                  routing="path"
                  signInUrl="/sign-in"
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-electric-500 hover:bg-electric-600 text-white w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-glow",
                      card: "bg-transparent border-0 shadow-none p-0 w-full",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md mb-4",
                      formFieldInput: "w-full px-4 py-3 bg-dark-100/30 backdrop-blur-sm border border-dark-300/30 rounded-xl text-dark-800 placeholder-dark-500 focus:border-electric-400 focus:bg-dark-100/50 focus:outline-none focus:ring-2 focus:ring-electric-400/20 transition-all duration-300 hover:border-dark-400/50",
                      footerActionLink: "text-electric-400 hover:text-electric-300 font-semibold transition-colors",
                      footerActionText: "text-dark-600",
                      dividerLine: "bg-dark-200/30",
                      dividerText: "text-dark-600 text-sm",
                      formFieldLabel: "text-dark-700 font-medium",
                      identityPreviewEditButton: "text-electric-400 hover:text-electric-300",
                      formFieldSuccessText: "text-neon-400",
                      formFieldErrorText: "text-red-400",
                      formResendCodeLink: "text-electric-400 hover:text-electric-300",
                      otpCodeFieldInput: "w-full px-4 py-3 bg-dark-100/30 backdrop-blur-sm border border-dark-300/30 rounded-xl text-dark-800 focus:border-electric-400 focus:bg-dark-100/50 focus:outline-none focus:ring-2 focus:ring-electric-400/20 transition-all duration-300",
                    }
                  }}
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-dark-200/30">
              <p className="text-xs text-dark-500 text-center">
                By creating an account, you agree to quantum-scale lead generation with 95.7% AI precision
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}