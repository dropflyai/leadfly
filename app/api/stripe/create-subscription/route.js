import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { user_id, price_id, user_email, user_name } = await request.json()

    if (!user_id || !price_id || !user_email) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, price_id, user_email' },
        { status: 400 }
      )
    }

    console.log('🚀 Creating subscription for user:', user_id)

    // Check if customer already exists
    let customer
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single()

    if (existingSubscription?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(existingSubscription.stripe_customer_id)
    } else {
      // Create new Stripe customer
      customer = await stripe.customers.create({
        email: user_email,
        name: user_name,
        metadata: {
          user_id: user_id
        }
      })
    }

    // Get price details to validate
    const price = await stripe.prices.retrieve(price_id)
    const product = await stripe.products.retrieve(price.product)

    console.log(`Creating subscription for product: ${product.name}`)

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price_id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: user_id,
        leads_allowance: product.metadata.leads || '25'
      }
    })

    // Map price to subscription tier
    const tierMapping = {
      17500: 'starter',   // $175
      35000: 'growth',    // $350
      70000: 'scale',     // $700
      175000: 'pro',      // $1,750
      350000: 'enterprise' // $3,500
    }

    const tierSlug = tierMapping[price.unit_amount] || 'starter'

    // Get the tier from database
    const { data: tier } = await supabase
      .from('subscription_tiers')
      .select('id')
      .eq('slug', tierSlug)
      .single()

    if (tier) {
      // Create or update subscription in database
      const { error: dbError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user_id,
          subscription_tier_id: tier.id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customer.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          leads_used_this_period: 0
        }, {
          onConflict: 'user_id'
        })

      if (dbError) {
        console.error('Database error:', dbError)
      }
    }

    return NextResponse.json({
      subscription_id: subscription.id,
      client_secret: subscription.latest_invoice.payment_intent.client_secret,
      customer_id: customer.id,
      status: subscription.status,
      product_name: product.name,
      amount: price.unit_amount,
      leads_allowance: product.metadata.leads
    })

  } catch (error) {
    console.error('Subscription creation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create subscription',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's current subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_tiers (
          name,
          slug,
          monthly_price,
          monthly_leads,
          features
        )
      `)
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!subscription) {
      return NextResponse.json({
        has_subscription: false,
        subscription: null
      })
    }

    // Get Stripe subscription details
    let stripeSubscription = null
    if (subscription.stripe_subscription_id) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
      } catch (stripeError) {
        console.error('Error retrieving Stripe subscription:', stripeError)
      }
    }

    return NextResponse.json({
      has_subscription: true,
      subscription: {
        ...subscription,
        stripe_details: stripeSubscription
      }
    })

  } catch (error) {
    console.error('Get subscription error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get subscription',
        message: error.message 
      },
      { status: 500 }
    )
  }
}