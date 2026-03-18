-- DealSense Crawler Domains Database
-- SQLite schema for 1000+ NL e-commerce domains

CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK(tier IN ('giganci', 'niszowe')),
  category TEXT NOT NULL,
  subcategory TEXT,
  priority INTEGER DEFAULT 3,
  rate_limit INTEGER DEFAULT 30,
  expected_pricing TEXT CHECK(expected_pricing IN ('very-low', 'low', 'medium', 'medium-high', 'high')),
  has_parser BOOLEAN DEFAULT 0,
  parser_type TEXT CHECK(parser_type IN ('specific', 'generic', NULL)),
  market_share TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_domains_tier ON domains(tier);
CREATE INDEX IF NOT EXISTS idx_domains_category ON domains(category);
CREATE INDEX IF NOT EXISTS idx_domains_active ON domains(active);
CREATE INDEX IF NOT EXISTS idx_domains_tier_category ON domains(tier, category);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  target_count INTEGER DEFAULT 0,
  actual_count INTEGER DEFAULT 0
);

-- Insert categories
INSERT OR IGNORE INTO categories (name, description, target_count) VALUES
  ('electronics', 'Electronics & Computers', 150),
  ('fashion', 'Fashion & Clothing', 150),
  ('home', 'Home & Furniture', 150),
  ('diy', 'DIY & Garden', 100),
  ('sports', 'Sports & Outdoor', 100),
  ('baby', 'Baby & Kids', 50),
  ('books', 'Books & Media', 50),
  ('beauty', 'Beauty & Health', 80),
  ('pets', 'Pet Supplies', 30),
  ('office', 'Office Supplies', 30),
  ('discount', 'Discount Stores', 30),
  ('appliances', 'Appliances', 30),
  ('diensten', 'Services (Energy, Telecom, Insurance)', 200),
  ('finance', 'Finance (Loans, Leasing, Mortgages)', 150);

-- Stats view
CREATE VIEW IF NOT EXISTS domain_stats AS
SELECT 
  tier,
  category,
  COUNT(*) as count,
  AVG(priority) as avg_priority,
  SUM(CASE WHEN has_parser = 1 THEN 1 ELSE 0 END) as parsers_count
FROM domains
WHERE active = 1
GROUP BY tier, category;

-- Balance check view (should be 50/50)
CREATE VIEW IF NOT EXISTS tier_balance AS
SELECT 
  tier,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM domains WHERE active = 1), 2) as percentage
FROM domains
WHERE active = 1
GROUP BY tier;
