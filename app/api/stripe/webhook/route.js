import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log('Received Stripe webhook:', event.type)

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      case 'customer.created':
        await handleCustomerCreated(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('🎉 New subscription created:', subscription.id)
  
  try {
    // Get the price to determine the tier
    const price = await stripe.prices.retrieve(subscription.items.data[0].price.id)
    const product = await stripe.products.retrieve(price.product)
    
    // Map price to subscription tier
    const tierMapping = {
      17500: 'starter',
      35000: 'growth', 
      70000: 'scale',
      175000: 'pro',
      350000: 'enterprise'
    }
    
    const tierSlug = tierMapping[price.unit_amount] || 'starter'
    
    // Get the tier ID from database
    const { data: tier } = await supabase
      .from('subscription_tiers')
      .select('id')
      .eq('slug', tierSlug)
      .single()
    
    if (!tier) {
      console.error('Tier not found for:', tierSlug)
      return
    }

    // Get user information
    const userId = subscription.metadata.user_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, onboarding_status')
      .eq('id', userId)
      .single()

    // Create or update user subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        subscription_tier_id: tier.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        leads_used_this_period: 0
      }, {
        onConflict: 'stripe_subscription_id'
      })

    if (error) {
      console.error('Error creating subscription:', error)
      return
    }

    console.log('✅ Subscription created in database')

    // Initialize onboarding for new subscribers
    if (profile && subscription.status === 'active' && profile.onboarding_status !== 'completed') {
      try {
        console.log('🚀 Initializing onboarding for user:', userId)
        
        const initResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            email: profile.email,
            plan_type: tierSlug,
            stripe_customer_id: subscription.customer,
            subscription_id: subscription.id
          })
        })

        if (initResponse.ok) {
          console.log('✅ Onboarding initialized successfully')
        } else {
          console.error('❌ Failed to initialize onboarding:', await initResponse.text())
        }

      } catch (error) {
        console.error('Error initializing onboarding:', error)
      }
    }

  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id)
  
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
    } else {
      console.log('✅ Subscription updated in database')
    }

  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription cancelled:', subscription.id)
  
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error cancelling subscription:', error)
    } else {
      console.log('✅ Subscription cancelled in database')
    }

  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id)
  
  try {
    // Reset lead usage for new billing period
    if (invoice.billing_reason === 'subscription_cycle') {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          leads_used_this_period: 0,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', invoice.customer)

      if (error) {
        console.error('Error resetting lead usage:', error)
      } else {
        console.log('✅ Lead usage reset for new billing period')
      }
    }

    // Log successful payment
    const { error: logError } = await supabase
      .from('payment_logs')
      .insert({
        stripe_invoice_id: invoice.id,
        stripe_customer_id: invoice.customer,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging payment:', logError)
    }

  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice) {
  console.log('💸 Payment failed:', invoice.id)
  
  try {
    // Log failed payment
    const { error } = await supabase
      .from('payment_logs')
      .insert({
        stripe_invoice_id: invoice.id,
        stripe_customer_id: invoice.customer,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        failure_reason: 'payment_failed',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging failed payment:', error)
    }

    // Could trigger dunning management here
    console.log('⚠️ Payment failed - consider dunning management')

  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleCustomerCreated(customer) {
  console.log('👤 Customer created:', customer.id)
  
  try {
    // Customer creation is typically handled during signup
    // This webhook can be used for additional customer onboarding
    console.log('✅ Customer created:', customer.email)

  } catch (error) {
    console.error('Error handling customer created:', error)
  }
}