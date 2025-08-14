import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key')

export async function POST(request) {
  try {
    console.log('🎯 Setting up Stripe promotion codes...')

    const promoCodes = [
      {
        code: 'FOUNDER100',
        percent_off: 100,
        duration: 'once',
        max_redemptions: 100,
        metadata: { description: 'Founder access - 100% off first month' }
      },
      {
        code: 'LEADFLY100', 
        percent_off: 100,
        duration: 'once',
        max_redemptions: 50,
        metadata: { description: 'LeadFly special - 100% off first month' }
      },
      {
        code: 'DEMO100',
        percent_off: 100,
        duration: 'once', 
        max_redemptions: 25,
        metadata: { description: 'Demo access - 100% off first month' }
      },
      {
        code: 'LAUNCH50',
        percent_off: 50,
        duration: 'once',
        max_redemptions: 200,
        metadata: { description: 'Launch special - 50% off first month' }
      },
      {
        code: 'SAVE25',
        percent_off: 25,
        duration: 'once',
        max_redemptions: 500,
        metadata: { description: 'Save 25% off first month' }
      }
    ]

    const createdCodes = []

    for (const promoData of promoCodes) {
      try {
        // Check if coupon already exists
        let coupon
        try {
          coupon = await stripe.coupons.retrieve(promoData.code.toLowerCase())
          console.log(`✅ Coupon ${promoData.code} already exists`)
        } catch (error) {
          // Create new coupon
          coupon = await stripe.coupons.create({
            id: promoData.code.toLowerCase(),
            percent_off: promoData.percent_off,
            duration: promoData.duration,
            metadata: promoData.metadata
          })
          console.log(`✅ Created coupon: ${promoData.code}`)
        }

        // Check if promotion code already exists
        let promotionCode
        try {
          const existingPromoCodes = await stripe.promotionCodes.list({
            coupon: coupon.id,
            active: true,
            limit: 1
          })
          
          if (existingPromoCodes.data.length > 0) {
            promotionCode = existingPromoCodes.data[0]
            console.log(`✅ Promotion code ${promoData.code} already exists`)
          } else {
            throw new Error('Not found')
          }
        } catch (error) {
          // Create new promotion code
          promotionCode = await stripe.promotionCodes.create({
            coupon: coupon.id,
            code: promoData.code,
            active: true,
            max_redemptions: promoData.max_redemptions,
            metadata: promoData.metadata
          })
          console.log(`✅ Created promotion code: ${promoData.code}`)
        }

        createdCodes.push({
          code: promoData.code,
          coupon_id: coupon.id,
          promotion_code_id: promotionCode.id,
          percent_off: promoData.percent_off,
          status: 'active'
        })

      } catch (error) {
        console.error(`❌ Error creating ${promoData.code}:`, error.message)
        createdCodes.push({
          code: promoData.code,
          error: error.message,
          status: 'failed'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion codes setup completed',
      codes: createdCodes,
      active_codes: createdCodes.filter(c => c.status === 'active').length,
      failed_codes: createdCodes.filter(c => c.status === 'failed').length
    })

  } catch (error) {
    console.error('❌ Promo setup error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to setup promotion codes',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    // List existing promotion codes
    const promotionCodes = await stripe.promotionCodes.list({
      active: true,
      limit: 20
    })

    const codes = promotionCodes.data.map(code => ({
      id: code.id,
      code: code.code,
      coupon: code.coupon,
      active: code.active,
      times_redeemed: code.times_redeemed,
      max_redemptions: code.max_redemptions,
      created: new Date(code.created * 1000).toISOString()
    }))

    return NextResponse.json({
      success: true,
      promotion_codes: codes,
      total_active: codes.length
    })

  } catch (error) {
    console.error('❌ Error listing promotion codes:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to list promotion codes',
        message: error.message 
      },
      { status: 500 }
    )
  }
}