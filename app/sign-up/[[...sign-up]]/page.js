'use client'

import { SignUp } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        backgroundColor: '#1e293b',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid #334155'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#3b82f6'
        }}>
          Sign Up for LeadFly AI
        </h1>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              card: 'bg-slate-800 border-slate-600',
              headerTitle: 'text-white',
              headerSubtitle: 'text-slate-300',
              socialButtonsBlockButton: 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600',
              formFieldInput: 'bg-slate-700 border-slate-600 text-white',
              formFieldLabel: 'text-slate-300',
              footerActionLink: 'text-blue-400 hover:text-blue-300'
            }
          }}
        />
      </div>
    </div>
  )
}