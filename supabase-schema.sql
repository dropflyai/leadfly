-- DropFly LeadFly Supabase Database Schema
-- Tiered SaaS with Feature Toggles

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTION MANAGEMENT
-- =============================================

-- Subscription tiers
CREATE TABLE subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price INTEGER NOT NULL, -- in cents
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
('enterprise', 'Enterprise', 'Custom solutions', 350000, 500, '{"basic_lead_table": true, "generic_email": true, "csv_export": true, "lead_scoring": true, "priority_quality": true, "advanced_filters": true, "daily_delivery": true, "custom_criteria": true, "priority_processing": true, "slack_included": true, "api_access": true, "white_label": true}');

-- Add-on packages
CREATE TABLE addon_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- research, email, automation, voice, conversion
  pricing_tiers JSONB NOT NULL, -- {"starter": 2500, "growth": 5000, "scale": 10000, "pro": 25000}
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
 '{"landing_pages": true, "crm_integration": true, "slack_alerts": true, "meeting_booking": true}');

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  tier_id TEXT REFERENCES subscription_tiers(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
  leads_used_this_period INTEGER DEFAULT 0,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User add-ons
CREATE TABLE user_addons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  addon_id TEXT REFERENCES addon_packages(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled
  price_paid INTEGER NOT NULL, -- price they paid based on their tier
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, addon_id)
);

-- =============================================
-- FEATURE TOGGLES SYSTEM
-- =============================================

-- Feature definitions
CREATE TABLE features (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- core, addon
  default_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert core and addon features
INSERT INTO features (id, name, description, category, default_enabled) VALUES
-- Core features (included in base tiers)
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

-- Add-on features
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
('slack_alerts', 'Slack Alerts', 'Real-time notifications', 'addon', false);

-- User feature access (computed from subscription + add-ons)
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

-- =============================================
-- LEADS DATA
-- =============================================

-- Lead sources for tracking
CREATE TABLE lead_sources (
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
('audience_labs', 'Audience Labs', 0.20, true);

-- Main leads table
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Basic contact info
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  
  -- Company info
  company_name TEXT,
  company_website TEXT,
  company_domain TEXT,
  industry TEXT,
  company_size TEXT,
  
  -- Job info
  job_title TEXT,
  seniority_level TEXT,
  department TEXT,
  
  -- Lead scoring and status
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  status TEXT DEFAULT 'new', -- new, contacted, responded, qualified, closed
  
  -- Source tracking
  source_id TEXT REFERENCES lead_sources(id),
  cost DECIMAL(10,2),
  
  -- Research data (add-on)
  research_data JSONB,
  
  -- Email data (add-on)
  personalized_email JSONB,
  
  -- Automation tracking
  automation_status JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead research data (for research add-on)
CREATE TABLE lead_research (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) NOT NULL,
  company_news TEXT[],
  recent_events TEXT[],
  pain_points TEXT[],
  decision_makers JSONB,
  technology_stack TEXT[],
  competitors TEXT[],
  funding_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates and personalization
CREATE TABLE email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_generic BOOLEAN DEFAULT false,
  template_type TEXT DEFAULT 'custom', -- generic, personalized, sequence
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert generic email template
INSERT INTO email_templates (name, subject, body, is_generic, template_type) VALUES
('Generic Outreach', 'Quick question about {{company_name}}', 
'Hi {{first_name}},

I noticed {{company_name}} and thought you might be interested in how companies like yours are solving [specific challenge].

Would you be open to a brief conversation about how we might be able to help?

Best regards,
[Your Name]', 
true, 'generic');

-- =============================================
-- AUTOMATION & CAMPAIGNS
-- =============================================

-- Email campaigns (automation add-on)
CREATE TABLE email_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed
  campaign_type TEXT DEFAULT 'sequence', -- sequence, broadcast
  leads_targeted INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice call logs (voice add-on)
CREATE TABLE voice_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  call_status TEXT, -- completed, failed, no_answer, busy
  duration INTEGER, -- seconds
  recording_url TEXT,
  transcript TEXT,
  ai_summary TEXT,
  meeting_booked BOOLEAN DEFAULT false,
  cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BILLING & USAGE TRACKING
-- =============================================

-- Usage tracking
CREATE TABLE usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  leads_generated INTEGER DEFAULT 0,
  research_requests INTEGER DEFAULT 0,
  personalized_emails INTEGER DEFAULT 0,
  voice_calls INTEGER DEFAULT 0,
  automation_runs INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Billing events
CREATE TABLE billing_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  event_type TEXT NOT NULL, -- subscription_created, addon_added, payment_success, payment_failed
  amount INTEGER, -- in cents
  stripe_event_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check if user has feature access
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

-- Function to get user's lead limit
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

-- Function to check if user can generate more leads
CREATE OR REPLACE FUNCTION can_generate_leads(p_user_id UUID, p_requested_count INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  lead_limit INTEGER;
  leads_used INTEGER;
BEGIN
  SELECT get_user_lead_limit(p_user_id) INTO lead_limit;
  
  SELECT leads_used_this_period INTO leads_used
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  RETURN (COALESCE(leads_used, 0) + p_requested_count) <= lead_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own addons" ON user_addons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own leads" ON leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own research" ON lead_research FOR ALL USING (
  EXISTS (SELECT 1 FROM leads WHERE id = lead_research.lead_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view own templates" ON email_templates FOR ALL USING (auth.uid() = user_id OR is_generic = true);
CREATE POLICY "Users can view own campaigns" ON email_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own calls" ON voice_calls FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON usage_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own billing" ON billing_events FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Core indexes
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_score ON leads(lead_score);
CREATE INDEX idx_leads_status ON leads(status);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

CREATE INDEX idx_user_addons_user_id ON user_addons(user_id);
CREATE INDEX idx_user_addons_status ON user_addons(status);

CREATE INDEX idx_usage_tracking_user_period ON usage_tracking(user_id, period_start);

-- Composite indexes
CREATE INDEX idx_leads_user_created ON leads(user_id, created_at);
CREATE INDEX idx_leads_user_score ON leads(user_id, lead_score);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

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

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();