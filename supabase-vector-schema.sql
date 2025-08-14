-- LeadFly AI Enhanced Vector Database Schema
-- Adds vector embeddings, memory management, and RAG capabilities

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable additional useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================
-- VECTOR EMBEDDINGS TABLES
-- =====================================

-- Lead embeddings for semantic search and qualification
CREATE TABLE IF NOT EXISTS lead_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'lead_interaction', -- lead_interaction, qualification_notes, research
    embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company research embeddings for competitive intelligence
CREATE TABLE IF NOT EXISTS company_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_domain TEXT NOT NULL,
    company_name TEXT,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL, -- news, events, pain_points, decision_makers, competitive_analysis
    source_url TEXT,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    relevance_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Industry and market intelligence embeddings
CREATE TABLE IF NOT EXISTS industry_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    industry TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL, -- trends, opportunities, challenges, market_data
    source TEXT,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    confidence_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales playbook and template embeddings
CREATE TABLE IF NOT EXISTS playbook_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    playbook_type TEXT NOT NULL, -- email_template, objection_handling, qualification_script
    industry TEXT,
    use_case TEXT,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    performance_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- MEMORY AND CONVERSATION MANAGEMENT
-- =====================================

-- Conversation memory for multi-turn interactions
CREATE TABLE IF NOT EXISTS conversation_memory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('human', 'ai', 'system')),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'message', -- message, action, analysis, recommendation
    metadata JSONB DEFAULT '{}',
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead interaction tracking with context
CREATE TABLE IF NOT EXISTS lead_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    interaction_type TEXT NOT NULL, -- qualification, follow_up, objection_handling, closing
    interaction_content TEXT NOT NULL,
    ai_analysis JSONB DEFAULT '{}',
    context_used JSONB DEFAULT '{}', -- vector search results used
    outcomes JSONB DEFAULT '{}',
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- AI ANALYSIS AND SCORING TABLES
-- =====================================

-- Enhanced lead scoring with AI analysis
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS knowledge_context JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_ai_update TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);

-- Lead scoring history for tracking improvements
CREATE TABLE IF NOT EXISTS lead_scoring_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    scoring_model TEXT DEFAULT 'ai_enhanced',
    factors JSONB DEFAULT '{}',
    confidence FLOAT DEFAULT 0.0,
    context_documents INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- VECTOR SEARCH OPTIMIZATION INDEXES
-- =====================================

-- Vector similarity search indexes (using ivfflat for performance)
CREATE INDEX IF NOT EXISTS idx_lead_embeddings_vector 
ON lead_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_company_embeddings_vector 
ON company_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_industry_embeddings_vector 
ON industry_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_playbook_embeddings_vector 
ON playbook_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Traditional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_lead_embeddings_user_type 
ON lead_embeddings(user_id, content_type);

CREATE INDEX IF NOT EXISTS idx_lead_embeddings_lead_created 
ON lead_embeddings(lead_id, created_at);

CREATE INDEX IF NOT EXISTS idx_company_embeddings_domain_type 
ON company_embeddings(company_domain, content_type);

CREATE INDEX IF NOT EXISTS idx_company_embeddings_created 
ON company_embeddings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_industry_embeddings_industry_type 
ON industry_embeddings(industry, content_type);

CREATE INDEX IF NOT EXISTS idx_playbook_embeddings_user_type 
ON playbook_embeddings(user_id, playbook_type);

CREATE INDEX IF NOT EXISTS idx_conversation_memory_session 
ON conversation_memory(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_conversation_memory_user_lead 
ON conversation_memory(user_id, lead_id, created_at);

CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_type 
ON lead_interactions(lead_id, interaction_type, created_at);

CREATE INDEX IF NOT EXISTS idx_lead_scoring_history_lead_created 
ON lead_scoring_history(lead_id, created_at DESC);

-- Text search indexes for content
CREATE INDEX IF NOT EXISTS idx_lead_embeddings_content_gin 
ON lead_embeddings USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_company_embeddings_content_gin 
ON company_embeddings USING gin(to_tsvector('english', content));

-- =====================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================

-- Enable RLS on new tables
ALTER TABLE lead_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scoring_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for user data isolation
CREATE POLICY "Users can manage their own lead embeddings" ON lead_embeddings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access company embeddings" ON company_embeddings
    FOR SELECT USING (true); -- Company data is shared across users

CREATE POLICY "Users can access industry embeddings" ON industry_embeddings
    FOR SELECT USING (true); -- Industry data is shared across users

CREATE POLICY "Users can manage their own playbook embeddings" ON playbook_embeddings
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage their own conversation memory" ON conversation_memory
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lead interactions" ON lead_interactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own lead scoring history" ON lead_scoring_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = lead_scoring_history.lead_id 
            AND leads.user_id = auth.uid()
        )
    );

-- =====================================
-- UTILITY FUNCTIONS
-- =====================================

-- Function to calculate embedding similarity
CREATE OR REPLACE FUNCTION calculate_similarity(
    embedding1 vector(1536),
    embedding2 vector(1536)
) RETURNS FLOAT AS $$
BEGIN
    RETURN 1 - (embedding1 <=> embedding2);
END;
$$ LANGUAGE plpgsql;

-- Function to get lead context from embeddings
CREATE OR REPLACE FUNCTION get_lead_context(
    p_user_id UUID,
    p_lead_id UUID DEFAULT NULL,
    p_query_embedding vector(1536),
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    content TEXT,
    content_type TEXT,
    similarity FLOAT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        le.content,
        le.content_type,
        calculate_similarity(p_query_embedding, le.embedding) as similarity,
        le.metadata
    FROM lead_embeddings le
    WHERE le.user_id = p_user_id
        AND (p_lead_id IS NULL OR le.lead_id = p_lead_id)
        AND le.embedding IS NOT NULL
    ORDER BY le.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get company research context
CREATE OR REPLACE FUNCTION get_company_context(
    p_company_domain TEXT,
    p_query_embedding vector(1536),
    p_limit INTEGER DEFAULT 5
) RETURNS TABLE (
    content TEXT,
    content_type TEXT,
    similarity FLOAT,
    source_url TEXT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.content,
        ce.content_type,
        calculate_similarity(p_query_embedding, ce.embedding) as similarity,
        ce.source_url,
        ce.metadata
    FROM company_embeddings ce
    WHERE ce.company_domain ILIKE '%' || p_company_domain || '%'
        AND ce.embedding IS NOT NULL
    ORDER BY ce.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update lead with AI analysis
CREATE OR REPLACE FUNCTION update_lead_ai_analysis(
    p_lead_id UUID,
    p_ai_analysis JSONB,
    p_knowledge_context JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE leads 
    SET 
        ai_analysis = p_ai_analysis,
        knowledge_context = COALESCE(p_knowledge_context, knowledge_context),
        last_ai_update = NOW()
    WHERE id = p_lead_id;
    
    -- Insert scoring history
    INSERT INTO lead_scoring_history (
        lead_id, 
        score, 
        factors, 
        confidence,
        context_documents
    ) VALUES (
        p_lead_id,
        COALESCE((p_ai_analysis->>'lead_score')::INTEGER, 75),
        p_ai_analysis,
        COALESCE((p_ai_analysis->>'confidence')::FLOAT, 0.8),
        COALESCE((p_knowledge_context->>'documents_found')::INTEGER, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- SAMPLE DATA FOR TESTING
-- =====================================

-- Insert some sample industry embeddings (you'll need to generate actual embeddings)
INSERT INTO industry_embeddings (industry, content, content_type, source, metadata) VALUES
('Technology', 'AI and machine learning adoption is accelerating across enterprises, driving demand for automation solutions.', 'trends', 'industry_report_2024', '{"report_id": "tech_trends_2024", "confidence": 0.9}'),
('Healthcare', 'Digital transformation in healthcare is creating opportunities for SaaS solutions that improve patient outcomes.', 'opportunities', 'healthcare_analysis_2024', '{"sector": "digital_health", "growth_rate": 0.15}'),
('Finance', 'Regulatory compliance requirements are increasing demand for automated reporting and risk management tools.', 'challenges', 'fintech_report_2024', '{"regulation": "Basel_III", "compliance_score": 0.85}');

-- Insert sample playbook templates
INSERT INTO playbook_embeddings (title, content, playbook_type, industry, metadata) VALUES
('Tech Lead Qualification', 'Hi {{first_name}}, I noticed {{company}} is in the {{industry}} space. Many companies like yours are struggling with {{pain_point}}. We''ve helped similar organizations achieve {{benefit}}. Would you be interested in a brief conversation about how this might apply to {{company}}?', 'email_template', 'Technology', '{"conversion_rate": 0.18, "response_rate": 0.12}'),
('Objection Handling - Budget', 'I understand budget is always a consideration. Many of our clients found that the cost of not addressing {{pain_point}} was actually much higher than our solution. For example, {{case_study_example}}. What if we could show you an ROI within {{timeframe}}?', 'objection_handling', NULL, '{"objection_type": "budget", "success_rate": 0.75}');

-- =====================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_embeddings_updated_at 
    BEFORE UPDATE ON lead_embeddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_embeddings_updated_at 
    BEFORE UPDATE ON company_embeddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industry_embeddings_updated_at 
    BEFORE UPDATE ON industry_embeddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbook_embeddings_updated_at 
    BEFORE UPDATE ON playbook_embeddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- PERFORMANCE OPTIMIZATION SETTINGS
-- =====================================

-- Optimize vector search performance
ALTER SYSTEM SET shared_preload_libraries = 'vector';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- =====================================
-- VIEWS FOR COMMON QUERIES
-- =====================================

-- View for lead analysis dashboard
CREATE OR REPLACE VIEW lead_analysis_dashboard AS
SELECT 
    l.id,
    l.email,
    l.company,
    l.industry,
    l.score,
    l.ai_analysis->>'lead_score' as ai_score,
    l.ai_analysis->>'confidence' as ai_confidence,
    l.knowledge_context->>'documents_found' as context_documents,
    l.last_ai_update,
    l.created_at
FROM leads l
WHERE l.ai_analysis IS NOT NULL;

-- View for conversation analytics
CREATE OR REPLACE VIEW conversation_analytics AS
SELECT 
    cm.session_id,
    cm.user_id,
    cm.lead_id,
    COUNT(*) as message_count,
    SUM(cm.token_count) as total_tokens,
    MIN(cm.created_at) as conversation_start,
    MAX(cm.created_at) as conversation_end,
    EXTRACT(EPOCH FROM (MAX(cm.created_at) - MIN(cm.created_at))) as duration_seconds
FROM conversation_memory cm
GROUP BY cm.session_id, cm.user_id, cm.lead_id;

-- Grant necessary permissions
GRANT SELECT ON lead_analysis_dashboard TO authenticated;
GRANT SELECT ON conversation_analytics TO authenticated;

-- =====================================
-- COMPLETION MESSAGE
-- =====================================

DO $$
BEGIN
    RAISE NOTICE 'LeadFly AI Enhanced Vector Database Schema deployed successfully!';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '  ✅ Vector embeddings with OpenAI text-embedding-3-small (1536 dimensions)';
    RAISE NOTICE '  ✅ Multi-turn conversation memory management';
    RAISE NOTICE '  ✅ Company and industry research embeddings';
    RAISE NOTICE '  ✅ Sales playbook and template embeddings';
    RAISE NOTICE '  ✅ Advanced lead scoring with AI analysis';
    RAISE NOTICE '  ✅ Optimized vector similarity search indexes';
    RAISE NOTICE '  ✅ Row-level security for data isolation';
    RAISE NOTICE '  ✅ Utility functions for context retrieval';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Deploy the enhanced n8n workflow';
    RAISE NOTICE '  2. Generate embeddings for existing data';
    RAISE NOTICE '  3. Test vector search functionality';
    RAISE NOTICE '  4. Monitor performance and optimize as needed';
END
$$;