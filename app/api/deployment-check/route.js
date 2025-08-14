import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      version: "1.0.1",
      features: {
        clerkAuth: true,
        enterprisePricing: 3000,
        privatePromoCodes: ["RIO2024", "DROPFLY"],
        publicPromoCodes: false
      },
      environment: {
        hasClerkPublicKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set"
      },
      buildStatus: "successful",
      message: "LeadFly AI deployment verification - all changes implemented"
    }

    return new Response(JSON.stringify(deploymentInfo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Deployment check failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}