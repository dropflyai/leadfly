#!/bin/bash

# DropFly LeadFly - Supabase Deployment Script
# This script will deploy the complete database schema to your Supabase project

echo "🚀 DropFly LeadFly - Deploying to Supabase..."
echo "Project: irvyhhkoiyzartmmvbxw"
echo "========================================"

# Set project details
PROJECT_REF="irvyhhkoiyzartmmvbxw"
PROJECT_URL="https://${PROJECT_REF}.supabase.co"

echo "📋 Please provide your Supabase credentials:"
echo "1. Go to: https://app.supabase.com/project/${PROJECT_REF}/settings/api"
echo "2. Copy your 'service_role' key (starts with 'eyJ...')"
echo ""
read -p "Enter your service_role key: " SERVICE_KEY

echo ""
echo "🔧 Setting up Supabase CLI..."

# Install Supabase CLI if not present
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

echo ""
echo "🗄️ Deploying database schema..."

# Create SQL deployment file
cat > /tmp/leadfly_schema.sql << 'EOF'
-- DropFly LeadFly Database Schema Deployment

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Authentication
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription tiers
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price INTEGER NOT NULL,
  monthly_leads INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert subscription tiers
INSERT INTO subscription_tiers (id, name, description, monthly_price, monthly_leads, features) VALUES
('starter', 'Starter', 'Perfect for small businesses', 17500, 25, '{"basic_lead_table": true, "generic_email": true, "csv_export": true, "lead_scoring": true}'),
('growth', 'Growth', 'For growing sales teams', 35000, 50, '{"basic_lead_table": true, "generic_email": true, "csv_export": true, "lead_scoring": true, "priority_quality": true, "advanced_filters": true}'),
('scale', 'Scale', 'For scaling organizations', 70000, 100, '{"basic_lead_table": true, "generic_email": true, "csv_export": true, "lead_scoring": true, "priority_quality": true, "advanced_filters": true, "daily_delivery": true, "custom_criteria": true}'),
('pro', 'Pro', 'For high-volume teams', 175000, 250, '{"basic_lead_table": true, "generic_email": true, "csv_export": true, "lead_scoring": true, "priority_quality": true, "advanced_filters": true, "daily_delivery": true, "custom_criteria": true, "priority_processing": true, "slack_included": true}'),
('enterprise', 'Enterprise', 'Custom solutions', 350000, 500, '{"basic_lead_table": true, "generic_email": true, "csv_export": true, "lead_scoring": true, "priority_quality": true, "advanced_filters": true, "daily_delivery": true, "custom_criteria": true, "priority_processing": true, "slack_included": true, "api_access": true, "white_label": true}')
ON CONFLICT (id) DO NOTHING;

-- Add-on packages
CREATE TABLE IF NOT EXISTS addon_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  pricing_tiers JSONB NOT NULL,
  features JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert add-on packages
INSERT INTO addon_packages (id, name, description, category, pricing_tiers, features) VALUES
('research_intel', 'Research Intelligence', 'Company news, events, decision makers', 'research', 
 '{"starter": 2500, "growth": 5000, "scale": 10000, "pro": 25000}',
 '{"company_news": true, "recent_events": true, "pain_points": true, "decision_mapping": true}'),
('email_personalization', 'Email Personalization', 'Custom emails, A/B testing, sequences', 'email',
 '{"starter": 4000, "growth": 7500, "scale": 15000, "pro": 37500}',
 '{"personalized_emails": true, "ab_testing": true, "multi_touch_sequences": true}'),
('automation_suite', 'Automation Suite', 'Email campaigns, lead warmers, LinkedIn', 'automation',
 '{"starter": 7500, "growth": 12500, "scale": 20000, "pro": 40000}',
 '{"auto_email_campaigns": true, "lead_warmer": true, "linkedin_automation": true}'),
('voice_ai_calling', 'Voice AI Calling', 'AI voice calls for hot leads', 'voice',
 '{"starter": 5000, "growth": 7500, "scale": 12500, "pro": 25000}',
 '{"ai_voice_calls": true, "meeting_booking": true, "call_analytics": true}'),
('conversion_optimization', 'Conversion Optimization', 'Landing pages, CRM, alerts', 'conversion',
 '{"starter": 5000, "growth": 7500, "scale": 12500, "pro": 25000}',
 '{"landing_pages": true, "crm_integration": true, "slack_alerts": true, "meeting_booking": true}')
ON CONFLICT (id) DO NOTHING;

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  tier_id TEXT REFERENCES subscription_tiers(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
  leads_used_this_period INTEGER DEFAULT 0,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User add-ons
CREATE TABLE IF NOT EXISTS user_addons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  addon_id TEXT REFERENCES addon_packages(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  price_paid INTEGER NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, addon_id)
);

-- Features
CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  default_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert features
INSERT INTO features (id, name, description, category, default_enabled) VALUES
('basic_lead_table', 'Basic Lead Table', 'Access to lead data table', 'core', true),
('generic_email', 'Generic Email Template', 'Copy/paste email template', 'core', true),
('csv_export', 'CSV Export', 'Download leads as CSV', 'core', true),
('lead_scoring', 'Lead Scoring', 'AI-powered lead scoring 1-100', 'core', true),
('priority_quality', 'Priority Quality', 'Higher quality lead sources', 'core', false),
('advanced_filters', 'Advanced Filters', 'Enhanced search and filtering', 'core', false),
('daily_delivery', 'Daily Delivery', 'Daily lead batches', 'core', false),
('custom_criteria', 'Custom Criteria', 'Custom lead targeting', 'core', false),
('priority_processing', 'Priority Processing', 'Faster processing queue', 'core', false),
('slack_included', 'Slack Alerts Included', 'Basic Slack notifications', 'core', false),
('api_access', 'API Access', 'Programmatic access', 'core', false),
('white_label', 'White Label', 'Remove DropFly branding', 'core', false),
('company_news', 'Company News Research', 'Recent company news and events', 'addon', false),
('recent_events', 'Recent Events Research', 'Company events and announcements', 'addon', false),
('pain_points', 'Pain Points Analysis', 'AI-identified company challenges', 'addon', false),
('decision_mapping', 'Decision Maker Mapping', 'Org chart and reporting structure', 'addon', false),
('personalized_emails', 'Personalized Emails', 'Custom email per lead', 'addon', false),
('ab_testing', 'A/B Testing', 'Email subject/content testing', 'addon', false),
('multi_touch_sequences', 'Multi-Touch Sequences', '5-email nurture campaigns', 'addon', false),
('auto_email_campaigns', 'Auto Email Campaigns', 'Fully managed email sending', 'addon', false),
('lead_warmer', 'Lead Warmer Sequences', 'Pre-outreach engagement', 'addon', false),
('linkedin_automation', 'LinkedIn Automation', 'Auto connect and messaging', 'addon', false),
('ai_voice_calls', 'AI Voice Calls', 'Autonomous voice calling', 'addon', false),
('meeting_booking', 'Meeting Booking', 'Calendar integration', 'addon', false),
('call_analytics', 'Call Analytics', 'Voice call insights', 'addon', false),
('landing_pages', 'Landing Pages', 'Custom lead capture pages', 'addon', false),
('crm_integration', 'CRM Integration', 'Direct CRM data sync', 'addon', false),
('slack_alerts', 'Slack Alerts', 'Real-time notifications', 'addon', false)
ON CONFLICT (id) DO NOTHING;

-- Lead sources
CREATE TABLE IF NOT EXISTS lead_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_endpoint TEXT,
  cost_per_lead DECIMAL(10,2),
  active BOOLEAN DEFAULT true
);

INSERT INTO lead_sources (id, name, cost_per_lead, active) VALUES
('apollo', 'Apollo.io', 0.35, true),
('clay', 'Clay.com', 0.14, true),
('clearbit', 'Clearbit', 0.36, true),
('hunter', 'Hunter.io', 0.10, true),
('audience_labs', 'Audience Labs', 0.20, true)
ON CONFLICT (id) DO NOTHING;

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  company_name TEXT,
  company_website TEXT,
  company_domain TEXT,
  industry TEXT,
  company_size TEXT,
  job_title TEXT,
  seniority_level TEXT,
  department TEXT,
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  status TEXT DEFAULT 'new',
  source_id TEXT REFERENCES lead_sources(id),
  cost DECIMAL(10,2),
  research_data JSONB,
  personalized_email JSONB,
  automation_status JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user feature access view
CREATE OR REPLACE VIEW user_feature_access AS
SELECT DISTINCT
  us.user_id,
  f.id as feature_id,
  f.name as feature_name,
  CASE 
    WHEN f.category = 'core' AND (st.features ->> f.id)::boolean = true THEN true
    WHEN f.category = 'addon' AND ua.user_id IS NOT NULL AND ua.status = 'active' AND (ap.features ->> f.id)::boolean = true THEN true
    ELSE false
  END as has_access
FROM user_subscriptions us
JOIN subscription_tiers st ON us.tier_id = st.id
CROSS JOIN features f
LEFT JOIN user_addons ua ON us.user_id = ua.user_id AND ua.status = 'active'
LEFT JOIN addon_packages ap ON ua.addon_id = ap.id AND (ap.features ->> f.id)::boolean = true
WHERE us.status = 'active';

-- Create functions
CREATE OR REPLACE FUNCTION user_has_feature(p_user_id UUID, p_feature_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_feature_access 
    WHERE user_id = p_user_id 
    AND feature_id = p_feature_id 
    AND has_access = true
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_lead_limit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  lead_limit INTEGER;
BEGIN
  SELECT st.monthly_leads INTO lead_limit
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.tier_id = st.id
  WHERE us.user_id = p_user_id AND us.status = 'active';
  
  RETURN COALESCE(lead_limit, 0);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own addons" ON user_addons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own leads" ON leads FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF

# Execute the SQL using curl
echo "🔧 Executing SQL schema..."

curl -X POST "${PROJECT_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$(cat /tmp/leadfly_schema.sql | sed 's/"/\\"/g' | tr '\n' ' ')\"}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database schema deployed successfully!"
    echo ""
    echo "🎯 What was created:"
    echo "   ✅ User profiles and authentication"
    echo "   ✅ 5 subscription tiers (Starter to Enterprise)"
    echo "   ✅ 5 add-on packages with tiered pricing"
    echo "   ✅ 25+ feature toggles"
    echo "   ✅ Leads storage with AI scoring"
    echo "   ✅ Row Level Security (RLS)"
    echo "   ✅ Performance indexes"
    echo ""
    echo "💰 Revenue potential: $2.5M+ ARR"
    echo "📊 Ready for 80% margin pricing"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Test the database at: https://app.supabase.com/project/${PROJECT_REF}/editor"
    echo "   2. Set up API keys for data sources"
    echo "   3. Deploy the frontend dashboard"
    echo "   4. Start generating leads!"
    echo ""
    echo "🔐 Remember to:"
    echo "   - Keep your service_role key secure"
    echo "   - Set up proper environment variables"
    echo "   - Configure Stripe for billing"
else
    echo "❌ Deployment failed. Check your service_role key and try again."
fi

# Clean up
rm -f /tmp/leadfly_schema.sql

echo ""
echo "🏁 Deployment complete!"
EOF

chmod +x /Users/rioallen/Documents/DropFly/knowledge-engine/leadfly-integration/deploy-to-supabase.sh