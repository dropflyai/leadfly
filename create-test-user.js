// Create test user for system testing
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3loaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg1MjE3NCwiZXhwIjoyMDQ5NDI4MTc0fQ.q30mqGJAOJ-Bk-2_sMqfWWTTpvhjRVpJP6KBM3GzgDo'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function createTestUser() {
  console.log('🧪 Creating test user and subscription...')

  try {
    // Create test user profile
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single()

    if (!existingUser) {
      const { error: userError } = await supabase
        .from('user_profiles')
        .insert({
          id: testUserId,
          email: 'test@dropfly.com',
          full_name: 'Test User',
          company_name: 'DropFly Test Corp'
        })

      if (userError && userError.code !== '23505') { // Ignore duplicate key errors
        throw userError
      }
    }

    // Create test subscription (Pro tier = 500 leads)
    const { data: proTier } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('slug', 'pro')
      .single()

    if (proTier) {
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          id: '11111111-1111-1111-1111-111111111111',
          user_id: testUserId,
          subscription_tier_id: proTier.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          leads_used_this_period: 0
        }, {
          onConflict: 'id'
        })

      if (subError) throw subError
    }

    console.log('✅ Test user created successfully!')
    console.log(`👤 User ID: ${testUserId}`)
    console.log(`💎 Subscription: Pro (500 leads/month)`)
    console.log(`📊 Leads used: 0/500`)

    return { success: true, user_id: testUserId }

  } catch (error) {
    console.error('❌ Test user creation error:', error)
    return { success: false, error: error.message }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUser()
}

export { createTestUser }