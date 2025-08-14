import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PERMANENT_PRICING, getPricingWithPromo } from '../../../../pricing-config.js'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export async function POST(request) {
  try {
    const { planId, promoCode, customerInfo } = await request.json()

    if (!planId || !PERMANENT_PRICING[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    const pricingInfo = getPricingWithPromo(planId, promoCode)
    
    if (!pricingInfo) {
      return NextResponse.json(
        { error: 'Could not calculate pricing' },
        { status: 400 }
      )
    }

    // If no Stripe key, create demo checkout
    if (!stripe) {
      console.log('🎯 Demo mode - no Stripe key, creating mock checkout')
      const mockSessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return NextResponse.json({
        sessionId: mockSessionId,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id=${mockSessionId}&plan=${planId}&demo=true`,
        planName: pricingInfo.name,
        finalPrice: pricingInfo.final_price,
        discount: pricingInfo.discount,
        demo: true
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: customerInfo.email,
      client_reference_id: customerInfo.userId,
      
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `LeadFly AI - ${pricingInfo.name} Plan`,
              description: `${pricingInfo.leads_per_month} qualified leads per month`,
              metadata: {
                plan_id: planId,
                leads_per_month: pricingInfo.leads_per_month.toString(),
                promo_code: promoCode || ''
              }
            },
            unit_amount: pricingInfo.final_price * 100, // Convert to cents
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],

      // Enable promo codes in Stripe checkout
      allow_promotion_codes: true,

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signup?plan=${planId}&checkout=cancelled`,
      
      metadata: {
        plan_id: planId,
        promo_code: promoCode || '',
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        company: customerInfo.company || ''
      }
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      planName: pricingInfo.name,
      finalPrice: pricingInfo.final_price,
      discount: pricingInfo.discount
    })

  } catch (error) {
    console.error('Checkout session creation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Helper function to create promo coupon dynamically
async function createPromoCoupon(promoCode, discountAmount) {
  try {
    const existingCoupons = await stripe.coupons.list({
      limit: 100
    })

    const existing = existingCoupons.data.find(c => c.id === `promo-${promoCode.toLowerCase()}`)
    if (existing) {
      return existing.id
    }

    // Create new coupon for this promo code
    const coupon = await stripe.coupons.create({
      id: `promo-${promoCode.toLowerCase()}`,
      amount_off: discountAmount * 100, // Convert to cents
      currency: 'usd',
      duration: 'once',
      name: `${promoCode} Discount`,
      metadata: {
        promo_code: promoCode
      }
    })

    return coupon.id
  } catch (error) {
    console.error('Error creating coupon:', error)
    // Return null so checkout continues without discount
    return null
  }
}