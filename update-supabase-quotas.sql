-- UPDATE RATE LIMIT QUOTAS - OPTYMALNE LIMITY (99%+ MARŻA)
-- Aktualizacja z nadmiernych limitów na realistyczne i rentowne

UPDATE rate_limit_quotas SET
  echo_requests_per_day = 5,
  echo_requests_per_month = 100,
  gemini_requests_per_day = 0,
  gemini_requests_per_month = 0,
  max_conversation_history = 10,
  max_preferences = 5,
  max_cost_per_day_usd = 0.02,
  max_cost_per_month_usd = 0.50
WHERE package = 'FREE';

UPDATE rate_limit_quotas SET
  echo_requests_per_day = 30,
  echo_requests_per_month = 500,
  gemini_requests_per_day = 0,
  gemini_requests_per_month = 0,
  max_conversation_history = 50,
  max_preferences = 20,
  max_cost_per_day_usd = 0.10,
  max_cost_per_month_usd = 2.00
WHERE package = 'PLUS';

UPDATE rate_limit_quotas SET
  echo_requests_per_day = 100,
  echo_requests_per_month = 2000,
  gemini_requests_per_day = 5,
  gemini_requests_per_month = 100,
  max_conversation_history = 200,
  max_preferences = 50,
  max_cost_per_day_usd = 0.50,
  max_cost_per_month_usd = 10.00
WHERE package = 'PRO';

UPDATE rate_limit_quotas SET
  echo_requests_per_day = 200,
  echo_requests_per_month = 4000,
  gemini_requests_per_day = 10,
  gemini_requests_per_month = 200,
  max_conversation_history = 500,
  max_preferences = 100,
  max_cost_per_day_usd = 1.00,
  max_cost_per_month_usd = 20.00
WHERE package = 'FINANCE';

-- Sprawdź wyniki
SELECT * FROM rate_limit_quotas ORDER BY 
  CASE package 
    WHEN 'FREE' THEN 1 
    WHEN 'PLUS' THEN 2 
    WHEN 'PRO' THEN 3 
    WHEN 'FINANCE' THEN 4 
  END;
