import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3loaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg1MjE3NCwiZXhwIjoyMDQ5NDI4MTc0fQ.q30mqGJAOJ-Bk-2_sMqfWWTTpvhjRVpJP6KBM3GzgDo'
)

const sampleLeads = [
  {
    user_id: 'demo-user-123',
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah.chen@techcorp.com',
    phone: '+1 (555) 123-4567',
    company_name: 'TechCorp Inc',
    company_website: 'https://techcorp.com',
    job_title: 'VP of Sales',
    industry: 'Software',
    lead_score: 92,
    company_size: '51-200',
    status: 'new',
    lead_source: 'LinkedIn Outreach',
    ai_insights: 'Decision maker with budget authority. Company actively hiring.',
    notes: 'Interested in scaling sales operations. Mentioned budget approval process.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'demo-user-123',
    first_name: 'Marcus',
    last_name: 'Johnson',
    email: 'marcus@growthco.com',
    phone: '+1 (555) 234-5678',
    company_name: 'GrowthCo',
    company_website: 'https://growthco.io',
    job_title: 'CEO',
    industry: 'Marketing',
    lead_score: 88,
    company_size: '11-50',
    status: 'contacted',
    lead_source: 'Cold Email',
    ai_insights: 'CEO looking for growth solutions. High budget allocation.',
    notes: 'Responded to initial outreach. Wants to see competitive analysis.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'demo-user-123',
    first_name: 'Lisa',
    last_name: 'Rodriguez',
    email: 'l.rodriguez@scaleinc.com',
    phone: '+1 (555) 345-6789',
    company_name: 'Scale Inc',
    company_website: 'https://scaleinc.com',
    job_title: 'Director of Marketing',
    industry: 'SaaS',
    lead_score: 85,
    company_size: '201-500',
    status: 'qualified',
    lead_source: 'Referral',
    ai_insights: 'Marketing director with expanding team. Budget approved.',
    notes: 'Team of 12 marketers. Q1 budget allocated for lead gen tools.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function POST(request) {
  try {
    console.log('Starting seed process...')
    
    // First, check if leads table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase
      .from('leads')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('Table access error:', tableError)
      return NextResponse.json({
        error: 'Cannot access leads table',
        details: tableError.message,
        hint: 'Check if leads table exists and RLS policies allow access'
      }, { status: 500 })
    }
    
    console.log('Table access successful, inserting sample leads...')
    
    // Insert sample leads
    const { data, error } = await supabase
      .from('leads')
      .insert(sampleLeads)
      .select()
    
    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({
        error: 'Failed to insert sample data',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('Successfully inserted leads:', data?.length || 0)
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data?.length || 0} sample leads`,
      data: data
    })
    
  } catch (error) {
    console.error('Seed API error:', error)
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed sample lead data',
    endpoint: '/api/leads/seed',
    method: 'POST'
  })
}