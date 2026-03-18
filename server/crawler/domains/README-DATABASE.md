# DealSense Domains Database (SQLite)

## 🎯 Overview

SQLite database containing 1000+ NL e-commerce domains for crawler.

**Balance:** 50% GIGANCI (big brands) + 50% NISZOWE (specialists)

**Excluded:** Used items (marktplaats, 2dehands, vinted), food stores

---

## 📊 Database Schema

### Tables

**domains** - Main domains table
- `id` - Auto-increment primary key
- `domain` - Domain name (unique)
- `tier` - 'giganci' or 'niszowe'
- `category` - electronics, fashion, home, diy, sports, etc.
- `subcategory` - Optional subcategory
- `priority` - 1-5 (1=highest)
- `rate_limit` - Requests per minute
- `expected_pricing` - very-low, low, medium, medium-high, high
- `has_parser` - Boolean (1=specific parser exists)
- `parser_type` - 'specific' or 'generic'
- `market_share` - Percentage (for giganci)
- `notes` - Additional info
- `active` - Boolean (1=active, 0=disabled)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**categories** - Category definitions
- `id` - Primary key
- `name` - Category name
- `description` - Description
- `target_count` - Target number of domains
- `actual_count` - Current count

### Views

**domain_stats** - Statistics per tier/category
**tier_balance** - Balance check (should be 50/50)

---

## 🚀 Usage

### Initialize Database

```bash
cd server/crawler/domains
sqlite3 domains.db < init-database.sql
```

### Import Domains

```bash
node import-domains.js
```

### Query Examples

```sql
-- Get all giganci
SELECT * FROM domains WHERE tier = 'giganci' AND active = 1;

-- Get electronics specialists (niszowe)
SELECT * FROM domains WHERE tier = 'niszowe' AND category = 'electronics';

-- Check balance
SELECT * FROM tier_balance;

-- Get domains needing parsers
SELECT domain, category FROM domains WHERE has_parser = 0 AND tier = 'giganci';

-- Get low-price specialists
SELECT domain, category, expected_pricing 
FROM domains 
WHERE tier = 'niszowe' AND expected_pricing IN ('very-low', 'low');
```

### Crawler Integration

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./domains/domains.db');

// Get all active domains for category
db.all(
  'SELECT * FROM domains WHERE category = ? AND active = 1',
  ['electronics'],
  (err, rows) => {
    rows.forEach(domain => {
      crawler.enqueue(domain.domain, {
        priority: domain.priority,
        rateLimit: domain.rate_limit,
        tier: domain.tier
      });
    });
  }
);
```

---

## 📈 Current Status

**Phase 1 (DONE):**
- ✅ Database schema created
- ✅ ~100 GIGANCI imported (starter set)
- ✅ Categories defined
- ✅ Views created

**Phase 2 (TODO):**
- [ ] Import remaining 400 GIGANCI
- [ ] Import 500 NISZOWE domains
- [ ] Add parsers for top 50 domains
- [ ] Create crawler integration module

---

## 🎯 Target Distribution

### GIGANCI (500 total)
- Electronics: 80
- Fashion: 80
- Home: 80
- DIY: 50
- Sports: 40
- Beauty: 40
- Baby: 20
- Books: 20
- Appliances: 30
- Office: 20
- Discount: 20
- Pets: 20

### NISZOWE (500 total)
- Electronics specialists: 100
- Fashion specialists: 100
- Home specialists: 80
- DIY specialists: 60
- Sports specialists: 50
- Beauty specialists: 40
- Baby specialists: 20
- Books specialists: 20
- Appliances specialists: 20
- Office specialists: 10

---

## 🔧 Maintenance

### Add New Domain

```sql
INSERT INTO domains (domain, tier, category, priority, rate_limit, expected_pricing)
VALUES ('example.nl', 'niszowe', 'electronics', 1, 30, 'low');
```

### Disable Domain

```sql
UPDATE domains SET active = 0 WHERE domain = 'example.nl';
```

### Update Rate Limit

```sql
UPDATE domains SET rate_limit = 50 WHERE domain = 'bol.com';
```

### Check Balance

```sql
SELECT * FROM tier_balance;
-- Should show ~50% giganci, ~50% niszowe
```

---

## 📝 Notes

- Database file: `domains.db`
- Lightweight: ~1-2MB for 1000 domains
- Fast queries: Indexed on tier, category, active
- No server needed: SQLite is embedded
- Easy backup: Just copy `domains.db` file

---

**Status:** Phase 1 Complete ✅

Next: Import full 1000 domains list
