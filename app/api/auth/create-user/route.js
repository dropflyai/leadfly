import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-key'
)

export async function POST(request) {
  try {
    const { email, password, firstName, lastName, company, planId } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // For demo purposes, if no Supabase key, create local user
    if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'demo-key' || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('🎯 Demo mode - creating local user account')
      
      const mockUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        company,
        planId,
        created_at: new Date().toISOString(),
        isDemo: true
      }

      return NextResponse.json({
        success: true,
        user: mockUser,
        message: 'Demo user created successfully'
      })
    }

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account', details: authError.message },
        { status: 400 }
      )
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authUser.user.id,
          email,
          full_name: `${firstName} ${lastName}`,
          company_name: company
        }
      ])
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail if profile creation fails, user is still created
    }

    // Create subscription if planId provided
    if (planId) {
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert([
          {
            user_id: authUser.user.id,
            subscription_tier_id: planId,
            status: 'active',
            leads_used_this_period: 0
          }
        ])
        .select()

      if (subError) {
        console.error('Subscription creation error:', subError)
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        firstName,
        lastName,
        company
      },
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('User creation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create user account',
        message: error.message 
      },
      { status: 500 }
    )
  }
}