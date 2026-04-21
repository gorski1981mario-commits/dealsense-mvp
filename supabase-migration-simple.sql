-- ECHO MEMORY SYSTEM (bez RLS policies - prostsze dla testów)

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

CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  intent TEXT,
  method TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conv_history ON conversation_history(user_id, session_id);
CREATE INDEX idx_conv_created ON conversation_history(created_at DESC);
CREATE INDEX idx_conv_user_created ON conversation_history(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS echo_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  package TEXT NOT NULL CHECK (package IN ('FREE', 'PLUS', 'PRO', 'FINANCE')),
  request_type TEXT NOT NULL,
  method TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  year_month TEXT NOT NULL
);

CREATE INDEX idx_usage_user ON echo_usage(user_id, year_month);
CREATE INDEX idx_usage_created ON echo_usage(created_at DESC);
CREATE INDEX idx_usage_package ON echo_usage(package, year_month);

CREATE TABLE IF NOT EXISTS rate_limit_quotas (
  package TEXT PRIMARY KEY CHECK (package IN ('FREE', 'PLUS', 'PRO', 'FINANCE')),
  echo_requests_per_day INTEGER NOT NULL,
  echo_requests_per_month INTEGER NOT NULL,
  gemini_requests_per_day INTEGER NOT NULL,
  gemini_requests_per_month INTEGER NOT NULL,
  max_conversation_history INTEGER NOT NULL,
  max_preferences INTEGER NOT NULL,
  max_cost_per_day_usd DECIMAL(10, 2) NOT NULL,
  max_cost_per_month_usd DECIMAL(10, 2) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO rate_limit_quotas (
  package, echo_requests_per_day, echo_requests_per_month,
  gemini_requests_per_day, gemini_requests_per_month,
  max_conversation_history, max_preferences,
  max_cost_per_day_usd, max_cost_per_month_usd
) VALUES
  ('FREE', 10, 100, 0, 0, 10, 5, 0.10, 1.00),
  ('PLUS', 50, 1000, 5, 50, 50, 20, 0.50, 5.00),
  ('PRO', 200, 5000, 20, 200, 200, 50, 2.00, 20.00),
  ('FINANCE', 1000, 20000, 100, 1000, 1000, 100, 10.00, 100.00)
ON CONFLICT (package) DO NOTHING;

CREATE OR REPLACE FUNCTION get_user_usage_today(p_user_id TEXT, p_package TEXT)
RETURNS TABLE(total_requests BIGINT, gemini_requests BIGINT, total_cost_usd DECIMAL(10, 6)) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT, COUNT(*) FILTER (WHERE method = 'gemini')::BIGINT,
         COALESCE(SUM(cost_usd), 0)::DECIMAL(10, 6)
  FROM echo_usage
  WHERE user_id = p_user_id AND package = p_package
    AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_usage_month(p_user_id TEXT, p_package TEXT)
RETURNS TABLE(total_requests BIGINT, gemini_requests BIGINT, total_cost_usd DECIMAL(10, 6)) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT, COUNT(*) FILTER (WHERE method = 'gemini')::BIGINT,
         COALESCE(SUM(cost_usd), 0)::DECIMAL(10, 6)
  FROM echo_usage
  WHERE user_id = p_user_id AND package = p_package
    AND year_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_user_make_request(p_user_id TEXT, p_package TEXT, p_method TEXT)
RETURNS TABLE(allowed BOOLEAN, reason TEXT, daily_usage JSONB, monthly_usage JSONB, quotas JSONB) AS $$
DECLARE
  v_quota RECORD;
  v_usage_today RECORD;
  v_usage_month RECORD;
BEGIN
  SELECT * INTO v_quota FROM rate_limit_quotas WHERE package = p_package;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Invalid package', NULL::JSONB, NULL::JSONB, NULL::JSONB;
    RETURN;
  END IF;
  
  SELECT * INTO v_usage_today FROM get_user_usage_today(p_user_id, p_package);
  SELECT * INTO v_usage_month FROM get_user_usage_month(p_user_id, p_package);
  
  IF v_usage_today.total_requests >= v_quota.echo_requests_per_day THEN
    RETURN QUERY SELECT FALSE, 'Daily ECHO request limit exceeded',
      jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
      jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
      row_to_json(v_quota)::JSONB;
    RETURN;
  END IF;
  
  IF v_usage_month.total_requests >= v_quota.echo_requests_per_month THEN
    RETURN QUERY SELECT FALSE, 'Monthly ECHO request limit exceeded',
      jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
      jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
      row_to_json(v_quota)::JSONB;
    RETURN;
  END IF;
  
  IF p_method = 'gemini' AND v_usage_today.gemini_requests >= v_quota.gemini_requests_per_day THEN
    RETURN QUERY SELECT FALSE, 'Daily Gemini limit exceeded',
      jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
      jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
      row_to_json(v_quota)::JSONB;
    RETURN;
  END IF;
  
  IF p_method = 'gemini' AND v_usage_month.gemini_requests >= v_quota.gemini_requests_per_month THEN
    RETURN QUERY SELECT FALSE, 'Monthly Gemini limit exceeded',
      jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
      jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
      row_to_json(v_quota)::JSONB;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, 'Request allowed',
    jsonb_build_object('total_requests', v_usage_today.total_requests, 'gemini_requests', v_usage_today.gemini_requests, 'total_cost_usd', v_usage_today.total_cost_usd),
    jsonb_build_object('total_requests', v_usage_month.total_requests, 'gemini_requests', v_usage_month.gemini_requests, 'total_cost_usd', v_usage_month.total_cost_usd),
    row_to_json(v_quota)::JSONB;
END;
$$ LANGUAGE plpgsql;
