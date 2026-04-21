-- ECHO MEMORY SYSTEM
-- User preferences + conversation history + rate limiting

-- ============================================
-- 1. USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

CREATE INDEX idx_user_prefs ON user_preferences(user_id);
CREATE INDEX idx_user_prefs_key ON user_preferences(user_id, preference_key);

-- ============================================
-- 2. CONVERSATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  intent TEXT,
  method TEXT, -- 'real_data', 'template', 'gemini'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conv_history ON conversation_history(user_id, session_id);
CREATE INDEX idx_conv_created ON conversation_history(created_at DESC);
CREATE INDEX idx_conv_user_created ON conversation_history(user_id, created_at DESC);

-- ============================================
-- 3. ECHO USAGE TRACKING (Rate Limiting)
-- ============================================
CREATE TABLE IF NOT EXISTS echo_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  package TEXT NOT NULL CHECK (package IN ('FREE', 'PLUS', 'PRO', 'FINANCE')),
  request_type TEXT NOT NULL, -- 'products', 'vacation', 'general', etc.
  method TEXT NOT NULL, -- 'real_data', 'template', 'gemini'
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  year_month TEXT NOT NULL -- '2026-04' for partitioning
);

CREATE INDEX idx_usage_user ON echo_usage(user_id, year_month);
CREATE INDEX idx_usage_created ON echo_usage(created_at DESC);
CREATE INDEX idx_usage_package ON echo_usage(package, year_month);

-- ============================================
-- 4. RATE LIMIT QUOTAS (Per Package)
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limit_quotas (
  package TEXT PRIMARY KEY CHECK (package IN ('FREE', 'PLUS', 'PRO', 'FINANCE')),
  
  -- ECHO Chat limits
  echo_requests_per_day INTEGER NOT NULL,
  echo_requests_per_month INTEGER NOT NULL,
  
  -- Gemini limits (expensive!)
  gemini_requests_per_day INTEGER NOT NULL,
  gemini_requests_per_month INTEGER NOT NULL,
  
  -- Memory limits
  max_conversation_history INTEGER NOT NULL, -- messages to keep
  max_preferences INTEGER NOT NULL,
  
  -- Cost limits (safety!)
  max_cost_per_day_usd DECIMAL(10, 2) NOT NULL,
  max_cost_per_month_usd DECIMAL(10, 2) NOT NULL,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default quotas
INSERT INTO rate_limit_quotas (
  package,
  echo_requests_per_day,
  echo_requests_per_month,
  gemini_requests_per_day,
  gemini_requests_per_month,
  max_conversation_history,
  max_preferences,
  max_cost_per_day_usd,
  max_cost_per_month_usd
) VALUES
  -- FREE: Very limited
  ('FREE', 10, 100, 0, 0, 10, 5, 0.10, 1.00),
  
  -- PLUS: Basic ECHO
  ('PLUS', 50, 1000, 5, 50, 50, 20, 0.50, 5.00),
  
  -- PRO: Full ECHO
  ('PRO', 200, 5000, 20, 200, 200, 50, 2.00, 20.00),
  
  -- FINANCE: Unlimited ECHO
  ('FINANCE', 1000, 20000, 100, 1000, 1000, 100, 10.00, 100.00)
ON CONFLICT (package) DO NOTHING;

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function: Get user's current usage for today
CREATE OR REPLACE FUNCTION get_user_usage_today(p_user_id TEXT, p_package TEXT)
RETURNS TABLE(
  total_requests BIGINT,
  gemini_requests BIGINT,
  total_cost_usd DECIMAL(10, 6)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_requests,
    COUNT(*) FILTER (WHERE method = 'gemini')::BIGINT as gemini_requests,
    COALESCE(SUM(cost_usd), 0)::DECIMAL(10, 6) as total_cost_usd
  FROM echo_usage
  WHERE user_id = p_user_id
    AND package = p_package
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's current usage for this month
CREATE OR REPLACE FUNCTION get_user_usage_month(p_user_id TEXT, p_package TEXT)
RETURNS TABLE(
  total_requests BIGINT,
  gemini_requests BIGINT,
  total_cost_usd DECIMAL(10, 6)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_requests,
    COUNT(*) FILTER (WHERE method = 'gemini')::BIGINT as gemini_requests,
    COALESCE(SUM(cost_usd), 0)::DECIMAL(10, 6) as total_cost_usd
  FROM echo_usage
  WHERE user_id = p_user_id
    AND package = p_package
    AND year_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user can make request
CREATE OR REPLACE FUNCTION can_user_make_request(
  p_user_id TEXT,
  p_package TEXT,
  p_method TEXT
)
RETURNS TABLE(
  allowed BOOLEAN,
  reason TEXT,
  daily_usage JSONB,
  monthly_usage JSONB,
  quotas JSONB
) AS $$
DECLARE
  v_quota RECORD;
  v_usage_today RECORD;
  v_usage_month RECORD;
BEGIN
  -- Get quota for package
  SELECT * INTO v_quota
  FROM rate_limit_quotas
  WHERE package = p_package;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Invalid package', NULL::JSONB, NULL::JSONB, NULL::JSONB;
    RETURN;
  END IF;
  
  -- Get today's usage
  SELECT * INTO v_usage_today
  FROM get_user_usage_today(p_user_id, p_package);
  
  -- Get month's usage
  SELECT * INTO v_usage_month
  FROM get_user_usage_month(p_user_id, p_package);
  
  -- Check daily ECHO limit
  IF v_usage_today.total_requests >= v_quota.echo_requests_per_day THEN
    RETURN QUERY SELECT 
      FALSE,
      'Daily ECHO request limit exceeded',
      jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
      jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
      row_to_json(v_quota)::JSONB;
    RETURN;
  END IF;
  
  -- Check monthly ECHO limit
  IF v_usage_month.total_requests >= v_quota.echo_requests_per_month THEN
    RETURN QUERY SELECT 
      FALSE,
      'Monthly ECHO request limit exceeded',
      jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
      jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
      row_to_json(v_quota)::JSONB;
    RETURN;
  END IF;
  
  -- Check Gemini limits (if method is 'gemini')
  IF p_method = 'gemini' THEN
    IF v_usage_today.gemini_requests >= v_quota.gemini_requests_per_day THEN
      RETURN QUERY SELECT 
        FALSE,
        'Daily Gemini request limit exceeded',
        jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
        jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
        row_to_json(v_quota)::JSONB;
      RETURN;
    END IF;
    
    IF v_usage_month.gemini_requests >= v_quota.gemini_requests_per_month THEN
      RETURN QUERY SELECT 
        FALSE,
        'Monthly Gemini request limit exceeded',
        jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
        jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
        row_to_json(v_quota)::JSONB;
      RETURN;
    END IF;
  END IF;
  
  -- Check daily cost limit
  IF v_usage_today.total_cost_usd >= v_quota.max_cost_per_day_usd THEN
    RETURN QUERY SELECT 
      FALSE,
      'Daily cost limit exceeded',
      jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
      jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
      row_to_json(v_quota)::JSONB;
    RETURN;
  END IF;
  
  -- Check monthly cost limit
  IF v_usage_month.total_cost_usd >= v_quota.max_cost_per_month_usd THEN
    RETURN QUERY SELECT 
      FALSE,
      'Monthly cost limit exceeded',
      jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
      jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
      row_to_json(v_quota)::JSONB;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    TRUE,
    'Request allowed',
    jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
    jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
    row_to_json(v_quota)::JSONB;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CLEANUP FUNCTIONS (Auto-delete old data)
-- ============================================

-- Function: Cleanup old conversation history (keep only recent messages per quota)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS void AS $$
BEGIN
  -- For each user, keep only max_conversation_history messages
  DELETE FROM conversation_history
  WHERE id IN (
    SELECT ch.id
    FROM conversation_history ch
    JOIN rate_limit_quotas rlq ON TRUE
    WHERE ch.id NOT IN (
      SELECT id
      FROM conversation_history
      WHERE user_id = ch.user_id
      ORDER BY created_at DESC
      LIMIT rlq.max_conversation_history
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Cleanup old usage data (keep only last 3 months)
CREATE OR REPLACE FUNCTION cleanup_old_usage()
RETURNS void AS $$
BEGIN
  DELETE FROM echo_usage
  WHERE created_at < CURRENT_DATE - INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. ROW LEVEL SECURITY (Optional but recommended)
-- ============================================

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_usage ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access their own data)
CREATE POLICY user_prefs_policy ON user_preferences
  FOR ALL
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY conv_history_policy ON conversation_history
  FOR ALL
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY usage_policy ON echo_usage
  FOR ALL
  USING (user_id = current_setting('app.user_id', true));

-- ============================================
-- DONE!
-- ============================================
