-- LeadFly AI Subscriber Onboarding Database Schema
-- Adds comprehensive onboarding tracking and management

-- =====================================
-- ONBOARDING TRACKING TABLES
-- =====================================

-- Main onboarding sessions table
CREATE TABLE IF NOT EXISTS subscriber_onboarding (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'pro', 'enterprise')),
    onboarding_data JSONB DEFAULT '{}',
    current_step INTEGER DEFAULT 0,
    steps_completed TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'abandoned')),
    completion_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding steps tracking
CREATE TABLE IF NOT EXISTS onboarding_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    onboarding_id UUID REFERENCES subscriber_onboarding(id) ON DELETE CASCADE NOT NULL,
    step_name TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER DEFAULT 0,
    step_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled onboarding tasks and follow-ups
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    task_type TEXT NOT NULL, -- onboarding_email, follow_up_call, check_in, etc.
    task_data JSONB DEFAULT '{}',
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
    execution_result JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding email tracking
CREATE TABLE IF NOT EXISTS onboarding_emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    onboarding_id UUID REFERENCES subscriber_onboarding(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL, -- welcome, reminder, tutorial, completion, etc.
    email_template TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    email_data JSONB DEFAULT '{}',
    delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- Success manager assignments (for Enterprise)
CREATE TABLE IF NOT EXISTS success_manager_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    success_manager_email TEXT NOT NULL,
    success_manager_name TEXT NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_contact_scheduled TIMESTAMP WITH TIME ZONE,
    first_contact_completed TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'contacted', 'onboarding', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding analytics and metrics
CREATE TABLE IF NOT EXISTS onboarding_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL, -- step_completed, email_opened, feature_used, etc.
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT,
    page_url TEXT,
    user_agent TEXT
);

-- =====================================
-- UPDATE EXISTING TABLES
-- =====================================

-- Add onboarding fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'not_started' 
    CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed', 'abandoned'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completion_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================

-- Onboarding tracking indexes
CREATE INDEX IF NOT EXISTS idx_subscriber_onboarding_user_status 
ON subscriber_onboarding(user_id, status);

CREATE INDEX IF NOT EXISTS idx_subscriber_onboarding_plan_status 
ON subscriber_onboarding(plan_type, status);

CREATE INDEX IF NOT EXISTS idx_subscriber_onboarding_created 
ON subscriber_onboarding(created_at DESC);

-- Onboarding steps indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_user_order 
ON onboarding_steps(user_id, step_order);

CREATE INDEX IF NOT EXISTS idx_onboarding_steps_onboarding_status 
ON onboarding_steps(onboarding_id, status);

-- Scheduled tasks indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user_scheduled 
ON scheduled_tasks(user_id, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_type_status 
ON scheduled_tasks(task_type, status);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_due 
ON scheduled_tasks(scheduled_for) WHERE status = 'pending';

-- Email tracking indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_emails_user_type 
ON onboarding_emails(user_id, email_type);

CREATE INDEX IF NOT EXISTS idx_onboarding_emails_sent 
ON onboarding_emails(sent_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_user_event 
ON onboarding_analytics(user_id, event_type, timestamp);

CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_timestamp 
ON onboarding_analytics(timestamp DESC);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status 
ON profiles(onboarding_status);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan 
ON profiles(subscription_plan);

-- =====================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================

-- Enable RLS on new tables
ALTER TABLE subscriber_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_manager_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for user data isolation
CREATE POLICY "Users can view their own onboarding" ON subscriber_onboarding
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding" ON subscriber_onboarding
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage onboarding" ON subscriber_onboarding
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own onboarding steps" ON onboarding_steps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding steps" ON onboarding_steps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage onboarding steps" ON onboarding_steps
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own scheduled tasks" ON scheduled_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage scheduled tasks" ON scheduled_tasks
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own onboarding emails" ON onboarding_emails
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage onboarding emails" ON onboarding_emails
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their success manager assignment" ON success_manager_assignments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage success manager assignments" ON success_manager_assignments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own onboarding analytics" ON onboarding_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage onboarding analytics" ON onboarding_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================
-- UTILITY FUNCTIONS
-- =====================================

-- Function to calculate onboarding completion percentage
CREATE OR REPLACE FUNCTION calculate_onboarding_progress(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_steps INTEGER;
    completed_steps INTEGER;
    completion_percentage INTEGER;
BEGIN
    -- Get total steps for user's plan
    SELECT COUNT(*) INTO total_steps
    FROM onboarding_steps
    WHERE user_id = p_user_id;
    
    -- Get completed steps
    SELECT COUNT(*) INTO completed_steps
    FROM onboarding_steps
    WHERE user_id = p_user_id AND status = 'completed';
    
    -- Calculate percentage
    IF total_steps > 0 THEN
        completion_percentage := ROUND((completed_steps::FLOAT / total_steps::FLOAT) * 100);
    ELSE
        completion_percentage := 0;
    END IF;
    
    -- Update the onboarding record
    UPDATE subscriber_onboarding 
    SET 
        completion_percentage = completion_percentage,
        current_step = completed_steps,
        last_activity_at = NOW(),
        status = CASE 
            WHEN completion_percentage = 100 THEN 'completed'
            WHEN completion_percentage > 0 THEN 'in_progress'
            ELSE 'started'
        END,
        completed_at = CASE 
            WHEN completion_percentage = 100 THEN NOW()
            ELSE completed_at
        END
    WHERE user_id = p_user_id;
    
    RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark onboarding step as completed
CREATE OR REPLACE FUNCTION complete_onboarding_step(
    p_user_id UUID,
    p_step_name TEXT,
    p_step_data JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
    step_exists BOOLEAN;
BEGIN
    -- Check if step exists and is not already completed
    SELECT EXISTS(
        SELECT 1 FROM onboarding_steps 
        WHERE user_id = p_user_id 
        AND step_name = p_step_name 
        AND status != 'completed'
    ) INTO step_exists;
    
    IF step_exists THEN
        -- Update the step
        UPDATE onboarding_steps
        SET 
            status = 'completed',
            completed_at = NOW(),
            step_data = p_step_data,
            time_spent_seconds = COALESCE(
                EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
                0
            )
        WHERE user_id = p_user_id AND step_name = p_step_name;
        
        -- Recalculate progress
        PERFORM calculate_onboarding_progress(p_user_id);
        
        -- Log analytics event
        INSERT INTO onboarding_analytics (user_id, event_type, event_data)
        VALUES (p_user_id, 'step_completed', jsonb_build_object(
            'step_name', p_step_name,
            'step_data', p_step_data
        ));
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next pending onboarding task
CREATE OR REPLACE FUNCTION get_next_onboarding_task(p_user_id UUID)
RETURNS TABLE (
    task_id UUID,
    task_type TEXT,
    task_data JSONB,
    scheduled_for TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.id,
        st.task_type,
        st.task_data,
        st.scheduled_for
    FROM scheduled_tasks st
    WHERE st.user_id = p_user_id
        AND st.status = 'pending'
        AND st.scheduled_for <= NOW()
    ORDER BY st.scheduled_for ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track onboarding analytics
CREATE OR REPLACE FUNCTION track_onboarding_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}',
    p_session_id TEXT DEFAULT NULL,
    p_page_url TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO onboarding_analytics (
        user_id,
        event_type,
        event_data,
        session_id,
        page_url
    ) VALUES (
        p_user_id,
        p_event_type,
        p_event_data,
        p_session_id,
        p_page_url
    );
    
    -- Update last activity
    UPDATE subscriber_onboarding
    SET last_activity_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- VIEWS FOR REPORTING
-- =====================================

-- Onboarding overview dashboard
CREATE OR REPLACE VIEW onboarding_overview AS
SELECT 
    so.user_id,
    p.email,
    so.plan_type,
    so.status,
    so.completion_percentage,
    so.current_step,
    so.started_at,
    so.completed_at,
    so.last_activity_at,
    CASE 
        WHEN so.completed_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (so.completed_at - so.started_at)) / 3600
        ELSE 
            EXTRACT(EPOCH FROM (NOW() - so.started_at)) / 3600
    END as hours_in_onboarding,
    (
        SELECT COUNT(*) 
        FROM onboarding_steps os 
        WHERE os.user_id = so.user_id AND os.status = 'completed'
    ) as steps_completed,
    (
        SELECT COUNT(*) 
        FROM onboarding_steps os 
        WHERE os.user_id = so.user_id
    ) as total_steps
FROM subscriber_onboarding so
JOIN profiles p ON p.id = so.user_id;

-- Onboarding funnel analysis
CREATE OR REPLACE VIEW onboarding_funnel AS
SELECT 
    plan_type,
    status,
    COUNT(*) as user_count,
    ROUND(AVG(completion_percentage), 2) as avg_completion_percentage,
    ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(completed_at, NOW()) - started_at)) / 3600), 2) as avg_hours_to_complete
FROM subscriber_onboarding
GROUP BY plan_type, status
ORDER BY plan_type, status;

-- Email engagement metrics
CREATE OR REPLACE VIEW email_engagement_metrics AS
SELECT 
    email_type,
    COUNT(*) as emails_sent,
    COUNT(opened_at) as emails_opened,
    COUNT(clicked_at) as emails_clicked,
    ROUND(COUNT(opened_at)::FLOAT / COUNT(*)::FLOAT * 100, 2) as open_rate,
    ROUND(COUNT(clicked_at)::FLOAT / COUNT(*)::FLOAT * 100, 2) as click_rate
FROM onboarding_emails
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY email_type
ORDER BY emails_sent DESC;

-- =====================================
-- TRIGGERS FOR AUTOMATION
-- =====================================

-- Trigger to update onboarding progress when steps change
CREATE OR REPLACE FUNCTION trigger_update_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate progress when step status changes
    IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) OR TG_OP = 'INSERT' THEN
        PERFORM calculate_onboarding_progress(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_progress_trigger
    AFTER INSERT OR UPDATE ON onboarding_steps
    FOR EACH ROW EXECUTE FUNCTION trigger_update_onboarding_progress();

-- Trigger to update profile onboarding status
CREATE OR REPLACE FUNCTION trigger_update_profile_onboarding()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET 
        onboarding_status = NEW.status,
        onboarding_completion_date = NEW.completed_at
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_onboarding_trigger
    AFTER UPDATE ON subscriber_onboarding
    FOR EACH ROW EXECUTE FUNCTION trigger_update_profile_onboarding();

-- =====================================
-- SAMPLE DATA FOR TESTING
-- =====================================

-- Insert sample onboarding steps for different plans
INSERT INTO onboarding_steps (user_id, onboarding_id, step_name, step_order) 
SELECT 
    '00000000-0000-0000-0000-000000000000'::UUID,
    '00000000-0000-0000-0000-000000000000'::UUID,
    step_name,
    step_order
FROM (VALUES
    ('welcome_complete', 1),
    ('profile_setup', 2),
    ('first_lead_capture', 3),
    ('ai_features_intro', 4),
    ('dashboard_tour', 5)
) AS steps(step_name, step_order)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON onboarding_overview TO authenticated;
GRANT SELECT ON onboarding_funnel TO authenticated;
GRANT SELECT ON email_engagement_metrics TO authenticated;

-- =====================================
-- COMPLETION MESSAGE
-- =====================================

DO $$
BEGIN
    RAISE NOTICE 'LeadFly AI Onboarding Database Schema deployed successfully!';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '  ✅ Comprehensive onboarding tracking';
    RAISE NOTICE '  ✅ Multi-step progress monitoring';
    RAISE NOTICE '  ✅ Automated email scheduling';
    RAISE NOTICE '  ✅ Success manager assignments (Enterprise)';
    RAISE NOTICE '  ✅ Analytics and engagement tracking';
    RAISE NOTICE '  ✅ Progress calculation and automation';
    RAISE NOTICE '  ✅ Reporting views and dashboards';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Deploy the onboarding n8n workflow';
    RAISE NOTICE '  2. Configure email templates and SMTP';
    RAISE NOTICE '  3. Set up onboarding dashboard components';
    RAISE NOTICE '  4. Test end-to-end onboarding flow';
END
$$;