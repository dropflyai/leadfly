-- =============================================
-- LeadFly AI Automated Upsell & Cross-sell System
-- Database Schema for Expansion Revenue Engine
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Expansion Opportunity Tracking
-- =============================================

-- Table to track potential expansion opportunities
CREATE TABLE IF NOT EXISTS expansion_opportunities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_type VARCHAR(50) NOT NULL CHECK (opportunity_type IN (
        'usage_upgrade', 'feature_upgrade', 'seat_expansion', 
        'tier_progression', 'add_on_product', 'custom_package'
    )),
    current_plan VARCHAR(50) NOT NULL,
    recommended_plan VARCHAR(50),
    trigger_event VARCHAR(100) NOT NULL,
    trigger_data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    potential_arr_increase DECIMAL(10,2) DEFAULT 0,
    probability_percentage INTEGER DEFAULT 50 CHECK (probability_percentage BETWEEN 0 AND 100),
    status VARCHAR(30) DEFAULT 'identified' CHECK (status IN (
        'identified', 'qualified', 'engaged', 'proposal_sent', 
        'negotiating', 'closed_won', 'closed_lost', 'on_hold'
    )),
    assigned_to VARCHAR(255), -- CSM or Sales rep email
    identified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_contact_at TIMESTAMP WITH TIME ZONE,
    proposal_sent_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    close_reason TEXT,
    next_action VARCHAR(255),
    next_action_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_expansion_opportunities_user_id ON expansion_opportunities(user_id);
CREATE INDEX idx_expansion_opportunities_status ON expansion_opportunities(status);
CREATE INDEX idx_expansion_opportunities_priority ON expansion_opportunities(priority);
CREATE INDEX idx_expansion_opportunities_type ON expansion_opportunities(opportunity_type);

-- =============================================
-- Usage Analytics for Upsell Triggers
-- =============================================

-- Table to track detailed usage patterns for upsell identification
CREATE TABLE IF NOT EXISTS usage_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_unit VARCHAR(50) DEFAULT 'count',
    measurement_date DATE NOT NULL,
    plan_limit DECIMAL(15,2),
    utilization_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN plan_limit > 0 THEN (metric_value / plan_limit) * 100
            ELSE 0
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_usage_analytics_user_date ON usage_analytics(user_id, measurement_date);
CREATE INDEX idx_usage_analytics_metric ON usage_analytics(metric_name);
CREATE INDEX idx_usage_analytics_utilization ON usage_analytics(utilization_percentage);

-- =============================================
-- Automated Campaigns & Sequences
-- =============================================

-- Table to track automated upsell campaigns
CREATE TABLE IF NOT EXISTS upsell_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN (
        'usage_threshold', 'feature_request', 'success_milestone', 
        'plan_progression', 'seasonal', 'competitive_upgrade'
    )),
    target_plan VARCHAR(50),
    trigger_conditions JSONB NOT NULL,
    email_sequence_id UUID,
    in_app_sequence_id UUID,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track campaign enrollments
CREATE TABLE IF NOT EXISTS campaign_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES upsell_campaigns(id) ON DELETE CASCADE,
    expansion_opportunity_id UUID REFERENCES expansion_opportunities(id),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_step INTEGER DEFAULT 1,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN (
        'active', 'paused', 'completed', 'opted_out', 'converted'
    )),
    conversion_date TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL(10,2),
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    total_opens INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_replies INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Customer Interaction Tracking
-- =============================================

-- Table to track all customer interactions related to upselling
CREATE TABLE IF NOT EXISTS upsell_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expansion_opportunity_id UUID REFERENCES expansion_opportunities(id),
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
        'email_sent', 'email_opened', 'email_clicked', 'email_replied',
        'in_app_notification', 'notification_clicked', 'demo_scheduled',
        'demo_completed', 'proposal_sent', 'proposal_viewed', 'call_scheduled',
        'call_completed', 'meeting_scheduled', 'meeting_completed', 
        'feature_requested', 'upgrade_initiated', 'upgrade_completed'
    )),
    interaction_medium VARCHAR(30) CHECK (interaction_medium IN (
        'email', 'in_app', 'phone', 'video', 'chat', 'sms'
    )),
    campaign_id UUID REFERENCES upsell_campaigns(id),
    subject_line TEXT,
    message_content TEXT,
    interaction_data JSONB DEFAULT '{}',
    performed_by VARCHAR(255), -- System, CSM name, or Sales rep name
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_received BOOLEAN DEFAULT false,
    response_date TIMESTAMP WITH TIME ZONE,
    response_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_upsell_interactions_user_id ON upsell_interactions(user_id);
CREATE INDEX idx_upsell_interactions_opportunity ON upsell_interactions(expansion_opportunity_id);
CREATE INDEX idx_upsell_interactions_type ON upsell_interactions(interaction_type);

-- =============================================
-- Feature Request Tracking
-- =============================================

-- Table to track feature requests that could lead to upsells
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    feature_category VARCHAR(100),
    request_description TEXT,
    business_justification TEXT,
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    available_in_plan VARCHAR(50), -- Which plan includes this feature
    upgrade_required BOOLEAN DEFAULT false,
    estimated_upgrade_value DECIMAL(10,2),
    request_source VARCHAR(50) CHECK (request_source IN (
        'support_ticket', 'survey', 'call', 'email', 'in_app', 'sales_conversation'
    )),
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'reviewed', 'approved', 'in_development', 
        'completed', 'rejected', 'deferred', 'upgrade_offered'
    )),
    assigned_to VARCHAR(255),
    response_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Success Milestones & Triggers
-- =============================================

-- Table to track customer success milestones that trigger expansion opportunities
CREATE TABLE IF NOT EXISTS success_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(100) NOT NULL,
    milestone_name VARCHAR(255) NOT NULL,
    milestone_value DECIMAL(15,2),
    milestone_unit VARCHAR(50),
    achievement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    baseline_date TIMESTAMP WITH TIME ZONE,
    improvement_percentage DECIMAL(5,2),
    triggers_expansion BOOLEAN DEFAULT false,
    expansion_recommendation TEXT,
    celebration_sent BOOLEAN DEFAULT false,
    expansion_offer_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample milestone types:
-- 'roi_achievement', 'lead_volume_growth', 'conversion_improvement', 
-- 'cost_savings', 'time_savings', 'user_adoption', 'feature_mastery'

-- =============================================
-- Competitive Intelligence for Upgrades
-- =============================================

-- Table to track competitive situations that might drive upgrades
CREATE TABLE IF NOT EXISTS competitive_intelligence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255),
    competitive_situation VARCHAR(100) CHECK (competitive_situation IN (
        'evaluation_started', 'demo_scheduled', 'proposal_received', 
        'contract_negotiation', 'price_comparison', 'feature_comparison',
        'renewal_risk', 'churn_risk', 'won_against', 'lost_to'
    )),
    intelligence_source VARCHAR(100),
    situation_details TEXT,
    our_position VARCHAR(50) CHECK (our_position IN (
        'winning', 'competitive', 'at_risk', 'losing', 'unknown'
    )),
    recommended_action TEXT,
    upgrade_opportunity BOOLEAN DEFAULT false,
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    assigned_to VARCHAR(255),
    situation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolution_date TIMESTAMP WITH TIME ZONE,
    outcome VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Automated Triggers & Functions
-- =============================================

-- Function to automatically identify usage-based expansion opportunities
CREATE OR REPLACE FUNCTION identify_usage_expansion_opportunities()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    current_usage DECIMAL;
    plan_limit DECIMAL;
    utilization DECIMAL;
BEGIN
    -- Loop through active users and check their usage patterns
    FOR user_record IN 
        SELECT DISTINCT ua.user_id, p.subscription_tier_slug as current_plan
        FROM usage_analytics ua
        JOIN user_subscriptions us ON ua.user_id = us.user_id
        JOIN subscription_tiers st ON us.subscription_tier_id = st.id
        JOIN profiles p ON ua.user_id = p.id
        WHERE ua.measurement_date >= CURRENT_DATE - INTERVAL '7 days'
        AND us.status = 'active'
    LOOP
        -- Check lead usage
        SELECT AVG(metric_value), MAX(plan_limit)
        INTO current_usage, plan_limit
        FROM usage_analytics 
        WHERE user_id = user_record.user_id 
        AND metric_name = 'leads_processed'
        AND measurement_date >= CURRENT_DATE - INTERVAL '30 days';
        
        IF plan_limit > 0 THEN
            utilization := (current_usage / plan_limit) * 100;
            
            -- Create opportunity if usage is above 80%
            IF utilization >= 80 THEN
                INSERT INTO expansion_opportunities (
                    user_id, 
                    opportunity_type, 
                    current_plan,
                    recommended_plan,
                    trigger_event,
                    trigger_data,
                    priority,
                    potential_arr_increase,
                    probability_percentage
                ) VALUES (
                    user_record.user_id,
                    'usage_upgrade',
                    user_record.current_plan,
                    CASE 
                        WHEN user_record.current_plan = 'starter' THEN 'growth'
                        WHEN user_record.current_plan = 'growth' THEN 'scale'
                        WHEN user_record.current_plan = 'scale' THEN 'pro'
                        WHEN user_record.current_plan = 'pro' THEN 'enterprise'
                        ELSE 'enterprise'
                    END,
                    'usage_threshold_exceeded',
                    jsonb_build_object(
                        'current_usage', current_usage,
                        'plan_limit', plan_limit,
                        'utilization_percentage', utilization
                    ),
                    CASE 
                        WHEN utilization >= 95 THEN 'critical'
                        WHEN utilization >= 90 THEN 'high'
                        ELSE 'medium'
                    END,
                    CASE user_record.current_plan
                        WHEN 'starter' THEN 1200.00  -- $149-$49 = $100 * 12
                        WHEN 'growth' THEN 1800.00   -- $299-$149 = $150 * 12
                        WHEN 'scale' THEN 5400.00    -- $749-$299 = $450 * 12
                        WHEN 'pro' THEN 9000.00      -- $1499-$749 = $750 * 12
                        ELSE 0
                    END,
                    CASE 
                        WHEN utilization >= 95 THEN 80
                        WHEN utilization >= 90 THEN 70
                        ELSE 60
                    END
                )
                ON CONFLICT DO NOTHING; -- Avoid duplicates
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to identify feature-based expansion opportunities
CREATE OR REPLACE FUNCTION identify_feature_expansion_opportunities()
RETURNS VOID AS $$
DECLARE
    request_record RECORD;
    recommended_plan VARCHAR(50);
    upgrade_value DECIMAL(10,2);
BEGIN
    -- Loop through recent feature requests that require upgrades
    FOR request_record IN 
        SELECT fr.*, p.subscription_tier_slug as current_plan
        FROM feature_requests fr
        JOIN profiles p ON fr.user_id = p.id
        WHERE fr.status = 'submitted'
        AND fr.upgrade_required = true
        AND fr.created_at >= CURRENT_DATE - INTERVAL '30 days'
    LOOP
        -- Determine recommended plan based on feature request
        recommended_plan := CASE 
            WHEN request_record.feature_name ILIKE '%api%' AND request_record.current_plan IN ('starter', 'growth') THEN 'scale'
            WHEN request_record.feature_name ILIKE '%integration%' AND request_record.current_plan IN ('starter', 'growth') THEN 'scale'
            WHEN request_record.feature_name ILIKE '%white%label%' THEN 'enterprise'
            WHEN request_record.feature_name ILIKE '%custom%' THEN 'enterprise'
            WHEN request_record.feature_name ILIKE '%advanced%' AND request_record.current_plan = 'starter' THEN 'growth'
            ELSE request_record.available_in_plan
        END;
        
        -- Calculate upgrade value
        upgrade_value := CASE 
            WHEN request_record.current_plan = 'starter' AND recommended_plan = 'growth' THEN 1200.00
            WHEN request_record.current_plan = 'starter' AND recommended_plan = 'scale' THEN 3000.00
            WHEN request_record.current_plan = 'growth' AND recommended_plan = 'scale' THEN 1800.00
            WHEN request_record.current_plan IN ('starter', 'growth', 'scale') AND recommended_plan = 'enterprise' THEN 9000.00
            ELSE 0
        END;
        
        -- Create expansion opportunity
        INSERT INTO expansion_opportunities (
            user_id,
            opportunity_type,
            current_plan,
            recommended_plan,
            trigger_event,
            trigger_data,
            priority,
            potential_arr_increase,
            probability_percentage
        ) VALUES (
            request_record.user_id,
            'feature_upgrade',
            request_record.current_plan,
            recommended_plan,
            'feature_request_submitted',
            jsonb_build_object(
                'feature_name', request_record.feature_name,
                'feature_category', request_record.feature_category,
                'urgency_level', request_record.urgency_level,
                'request_id', request_record.id
            ),
            CASE request_record.urgency_level
                WHEN 'critical' THEN 'critical'
                WHEN 'high' THEN 'high'
                ELSE 'medium'
            END,
            upgrade_value,
            CASE request_record.urgency_level
                WHEN 'critical' THEN 85
                WHEN 'high' THEN 75
                WHEN 'medium' THEN 65
                ELSE 50
            END
        )
        ON CONFLICT DO NOTHING;
        
        -- Update feature request status
        UPDATE feature_requests 
        SET status = 'upgrade_offered', updated_at = NOW()
        WHERE id = request_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to identify success milestone expansion opportunities
CREATE OR REPLACE FUNCTION identify_success_expansion_opportunities()
RETURNS VOID AS $$
DECLARE
    milestone_record RECORD;
BEGIN
    -- Loop through recent success milestones that trigger expansion
    FOR milestone_record IN 
        SELECT sm.*, p.subscription_tier_slug as current_plan
        FROM success_milestones sm
        JOIN profiles p ON sm.user_id = p.id
        WHERE sm.triggers_expansion = true
        AND sm.expansion_offer_sent = false
        AND sm.achievement_date >= CURRENT_DATE - INTERVAL '7 days'
    LOOP
        -- Create expansion opportunity based on success milestone
        INSERT INTO expansion_opportunities (
            user_id,
            opportunity_type,
            current_plan,
            recommended_plan,
            trigger_event,
            trigger_data,
            priority,
            potential_arr_increase,
            probability_percentage
        ) VALUES (
            milestone_record.user_id,
            'tier_progression',
            milestone_record.current_plan,
            CASE 
                WHEN milestone_record.current_plan = 'starter' THEN 'growth'
                WHEN milestone_record.current_plan = 'growth' THEN 'scale'
                WHEN milestone_record.current_plan = 'scale' THEN 'pro'
                WHEN milestone_record.current_plan = 'pro' THEN 'enterprise'
                ELSE 'enterprise'
            END,
            'success_milestone_achieved',
            jsonb_build_object(
                'milestone_type', milestone_record.milestone_type,
                'milestone_name', milestone_record.milestone_name,
                'milestone_value', milestone_record.milestone_value,
                'improvement_percentage', milestone_record.improvement_percentage,
                'milestone_id', milestone_record.id
            ),
            'high', -- Success milestones are high priority
            CASE milestone_record.current_plan
                WHEN 'starter' THEN 1200.00
                WHEN 'growth' THEN 1800.00
                WHEN 'scale' THEN 5400.00
                WHEN 'pro' THEN 9000.00
                ELSE 0
            END,
            85 -- High probability due to demonstrated success
        )
        ON CONFLICT DO NOTHING;
        
        -- Mark milestone as having expansion offer sent
        UPDATE success_milestones 
        SET expansion_offer_sent = true
        WHERE id = milestone_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Automated Campaign Triggers
-- =============================================

-- Function to enroll users in appropriate upsell campaigns
CREATE OR REPLACE FUNCTION enroll_in_upsell_campaigns()
RETURNS VOID AS $$
DECLARE
    opportunity_record RECORD;
    campaign_record RECORD;
BEGIN
    -- Loop through new expansion opportunities
    FOR opportunity_record IN 
        SELECT * FROM expansion_opportunities 
        WHERE status = 'identified' 
        AND created_at >= CURRENT_DATE - INTERVAL '1 day'
    LOOP
        -- Find matching active campaign
        SELECT * INTO campaign_record
        FROM upsell_campaigns 
        WHERE campaign_type = opportunity_record.opportunity_type
        AND is_active = true
        AND (target_plan IS NULL OR target_plan = opportunity_record.recommended_plan)
        ORDER BY priority DESC
        LIMIT 1;
        
        -- Enroll user in campaign if found
        IF campaign_record.id IS NOT NULL THEN
            INSERT INTO campaign_enrollments (
                user_id,
                campaign_id,
                expansion_opportunity_id
            ) VALUES (
                opportunity_record.user_id,
                campaign_record.id,
                opportunity_record.id
            )
            ON CONFLICT DO NOTHING;
            
            -- Update opportunity status
            UPDATE expansion_opportunities 
            SET status = 'engaged', updated_at = NOW()
            WHERE id = opportunity_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Periodic Maintenance Functions
-- =============================================

-- Function to update opportunity priorities based on latest data
CREATE OR REPLACE FUNCTION update_opportunity_priorities()
RETURNS VOID AS $$
BEGIN
    -- Update priorities based on usage urgency
    UPDATE expansion_opportunities 
    SET priority = CASE 
        WHEN (trigger_data->>'utilization_percentage')::DECIMAL >= 95 THEN 'critical'
        WHEN (trigger_data->>'utilization_percentage')::DECIMAL >= 90 THEN 'high'
        WHEN (trigger_data->>'utilization_percentage')::DECIMAL >= 80 THEN 'medium'
        ELSE 'low'
    END,
    updated_at = NOW()
    WHERE opportunity_type = 'usage_upgrade';
    
    -- Update probabilities based on engagement
    UPDATE expansion_opportunities 
    SET probability_percentage = CASE 
        WHEN status = 'proposal_sent' THEN probability_percentage + 20
        WHEN status = 'negotiating' THEN probability_percentage + 30
        WHEN (SELECT COUNT(*) FROM upsell_interactions WHERE expansion_opportunity_id = expansion_opportunities.id AND response_received = true) > 0 
            THEN probability_percentage + 15
        ELSE probability_percentage
    END,
    updated_at = NOW()
    WHERE status NOT IN ('closed_won', 'closed_lost');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE expansion_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_intelligence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data isolation
CREATE POLICY "Users can view their own expansion opportunities" ON expansion_opportunities
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage analytics" ON usage_analytics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own campaign enrollments" ON campaign_enrollments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions" ON upsell_interactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own feature requests" ON feature_requests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own success milestones" ON success_milestones
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own competitive intelligence" ON competitive_intelligence
    FOR ALL USING (auth.uid() = user_id);

-- Admin policies for campaign management
CREATE POLICY "Admins can manage campaigns" ON upsell_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'customer_success', 'sales')
        )
    );

-- =============================================
-- Automated Triggers
-- =============================================

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expansion_opportunities_updated_at 
    BEFORE UPDATE ON expansion_opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_enrollments_updated_at 
    BEFORE UPDATE ON campaign_enrollments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at 
    BEFORE UPDATE ON feature_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitive_intelligence_updated_at 
    BEFORE UPDATE ON competitive_intelligence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Sample Data for Testing
-- =============================================

-- Insert sample upsell campaigns
INSERT INTO upsell_campaigns (campaign_name, campaign_type, target_plan, trigger_conditions) VALUES
('Usage Threshold Upgrade - Starter to Growth', 'usage_threshold', 'growth', 
 '{"min_utilization": 80, "current_plan": "starter"}'),
('Feature Request Upgrade - API Access', 'feature_request', 'scale', 
 '{"features": ["api_access", "integrations"], "current_plans": ["starter", "growth"]}'),
('Success Milestone Celebration', 'success_milestone', null, 
 '{"milestone_types": ["roi_achievement", "conversion_improvement"]}'),
('Competitive Upgrade Defense', 'competitive_upgrade', null, 
 '{"competitive_situations": ["evaluation_started", "proposal_received"]}');

-- Insert sample usage analytics (this would normally be populated by the application)
-- This is just for testing the trigger functions
INSERT INTO usage_analytics (user_id, metric_name, metric_value, plan_limit, measurement_date) 
SELECT 
    auth.uid(), 
    'leads_processed', 
    45, 
    50, 
    CURRENT_DATE
WHERE auth.uid() IS NOT NULL;

COMMIT;