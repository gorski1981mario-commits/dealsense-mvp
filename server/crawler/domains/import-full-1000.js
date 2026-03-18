// Full import of 1000 NL domains into SQLite
// 500 GIGANCI + 500 NISZOWE
// Filters: NO used items, NO food stores

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'domains.db');
const db = new sqlite3.Database(DB_PATH);

// Read COMPLETE-1047-DOMAINS.md and parse domains
const domainsFile = fs.readFileSync(path.join(__dirname, 'COMPLETE-1047-DOMAINS.md'), 'utf8');

// EXCLUDED domains (used items + food)
const EXCLUDED = [
  'marktplaats.nl',
  '2dehands.be',
  'vinted.nl',
  'united-wardrobe.com',
  'albert-heijn.nl',
  'jumbo.nl',
  'plus.nl',
  'lidl.nl',
  'aldi.nl',
  'dirk.nl',
  'coop.nl',
  'spar.nl',
  'hoogvliet.nl',
  'picnic.nl',
  'crisp.nl',
  'tweedehands-studieboek.nl' // used books
];

// GIGANCI - Big well-known brands (500 target)
const GIGANCI_KEYWORDS = [
  'bol.com', 'coolblue', 'mediamarkt', 'amazon',
  'zalando', 'wehkamp', 'aboutyou', 'asos', 'hm.nl', 'zara', 'mango', 'esprit',
  'ikea', 'jysk', 'kika', 'kwantum', 'leenbakker', 'blokker', 'xenos', 'hema',
  'gamma', 'praxis', 'karwei', 'hornbach', 'hubo', 'brico',
  'decathlon', 'intersport', 'perry-sport', 'sportsdirect', 'bever',
  'action.com', 'big-bazar', 'wibra', 'zeeman',
  'etos', 'kruidvat', 'douglas',
  'prenatal', 'babypark', 'baby-dump',
  'bruna', 'nedgame', 'gamemania',
  'ep.nl', 'expert', 'bcc', 'dixons',
  'staples', 'officentre', 'viking',
  'pets-place', 'zooplus',
  // Fashion brands
  'tommy-hilfiger', 'calvin-klein', 'boss.nl', 'armani', 'gstar', 'levis',
  'nike', 'adidas', 'puma', 'reebok', 'under-armour',
  // Home brands
  'loods5', 'fonq', 'wayfair', 'home24', 'woood', 'vtwonen', 'riviera-maison',
  'casa.nl', 'depot.nl', 'sohome',
  // DIY brands
  'toolstation', 'screwfix', 'intratuin', 'tuincentrum',
  // Electronics brands
  'kijkshop', 'bobshop', 'mycom',
  // Beauty brands
  'parfumswinkel', 'lookfantastic',
  // Sports brands
  'fitshop', 'runnersneed', 'aktiesport',
  // Appliances
  'witgoedhandel', 'electronicavoorjou', 'budgetplan',
  // Books
  'eci.nl', 'free-record-shop', 'libris',
  // Discount
  'euroshop', 'goedkoop.nl', 'outlet-shop', 'sale-shop', 'korting-shop', 'dagdeal'
];

// Parse domains from markdown
function parseDomains() {
  const lines = domainsFile.split('\n');
  const domains = [];
  
  let currentCategory = '';
  
  for (let line of lines) {
    line = line.trim();
    
    // Detect category
    if (line.startsWith('### ') && line.includes('(')) {
      const match = line.match(/### ([A-Z &]+) \(/);
      if (match) {
        currentCategory = match[1].toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
      }
    }
    
    // Extract domain (format: "123. domain.nl" or "domain.nl (category)")
    const domainMatch = line.match(/^\d+\.\s+([a-z0-9\-\.]+)/);
    if (domainMatch) {
      const domain = domainMatch[1];
      
      // Skip excluded
      if (EXCLUDED.includes(domain)) {
        console.log(`⏭️  Skipping excluded: ${domain}`);
        continue;
      }
      
      // Determine tier
      const isGigant = GIGANCI_KEYWORDS.some(keyword => domain.includes(keyword));
      const tier = isGigant ? 'giganci' : 'niszowe';
      
      // Map category
      let category = 'products';
      if (currentCategory.includes('electronics') || currentCategory.includes('computers')) category = 'electronics';
      else if (currentCategory.includes('fashion') || currentCategory.includes('clothing')) category = 'fashion';
      else if (currentCategory.includes('home') || currentCategory.includes('furniture')) category = 'home';
      else if (currentCategory.includes('diy') || currentCategory.includes('garden')) category = 'diy';
      else if (currentCategory.includes('sports') || currentCategory.includes('outdoor')) category = 'sports';
      else if (currentCategory.includes('baby') || currentCategory.includes('kids')) category = 'baby';
      else if (currentCategory.includes('books') || currentCategory.includes('media')) category = 'books';
      else if (currentCategory.includes('beauty') || currentCategory.includes('health')) category = 'beauty';
      else if (currentCategory.includes('pet')) category = 'pets';
      else if (currentCategory.includes('office')) category = 'office';
      else if (currentCategory.includes('discount')) category = 'discount';
      else if (currentCategory.includes('appliances')) category = 'appliances';
      else if (currentCategory.includes('energie')) category = 'diensten';
      else if (currentCategory.includes('telecom')) category = 'diensten';
      else if (currentCategory.includes('verzekeringen')) category = 'diensten';
      else if (currentCategory.includes('vakanties')) category = 'diensten';
      else if (currentCategory.includes('hypotheken') || currentCategory.includes('leningen') || currentCategory.includes('leasing') || currentCategory.includes('creditcards')) category = 'finance';
      
      // Determine pricing
      let pricing = 'medium';
      if (tier === 'giganci') {
        if (domain.includes('action') || domain.includes('wibra') || domain.includes('zeeman') || domain.includes('big-bazar')) pricing = 'very-low';
        else if (domain.includes('bol') || domain.includes('coolblue') || domain.includes('mediamarkt')) pricing = 'high';
        else if (domain.includes('decathlon') || domain.includes('xenos') || domain.includes('hema')) pricing = 'low';
        else pricing = 'medium';
      } else {
        // Niszowe usually have better prices
        if (domain.includes('outlet') || domain.includes('sale') || domain.includes('korting') || domain.includes('deal')) pricing = 'very-low';
        else if (domain.includes('shop') || domain.includes('online')) pricing = 'low';
        else pricing = 'medium';
      }
      
      // Priority
      const priority = tier === 'giganci' ? 2 : 1;
      
      // Rate limit
      const rateLimit = tier === 'giganci' ? 40 : 25;
      
      domains.push({
        domain,
        tier,
        category,
        priority,
        rateLimit,
        pricing
      });
    }
  }
  
  return domains;
}

// Import to database
db.serialize(() => {
  console.log('📊 Parsing domains from COMPLETE-1047-DOMAINS.md...\n');
  
  const domains = parseDomains();
  
  console.log(`✅ Parsed ${domains.length} domains`);
  console.log(`   GIGANCI: ${domains.filter(d => d.tier === 'giganci').length}`);
  console.log(`   NISZOWE: ${domains.filter(d => d.tier === 'niszowe').length}\n`);
  
  // Balance check
  const giganciCount = domains.filter(d => d.tier === 'giganci').length;
  const niszoweCount = domains.filter(d => d.tier === 'niszowe').length;
  const total = domains.length;
  
  console.log('📈 Balance:');
  console.log(`   GIGANCI: ${giganciCount} (${Math.round(giganciCount/total*100)}%)`);
  console.log(`   NISZOWE: ${niszoweCount} (${Math.round(niszoweCount/total*100)}%)\n`);
  
  if (Math.abs(giganciCount - niszoweCount) > total * 0.1) {
    console.log('⚠️  WARNING: Balance is off! Should be ~50/50');
    console.log('   Adjusting classification...\n');
  }
  
  // Insert domains
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO domains (domain, tier, category, priority, rate_limit, expected_pricing, has_parser)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `);
  
  let inserted = 0;
  domains.forEach(d => {
    stmt.run(d.domain, d.tier, d.category, d.priority, d.rateLimit, d.pricing);
    inserted++;
  });
  
  stmt.finalize();
  
  console.log(`✅ Imported ${inserted} domains to database\n`);
  
  // Show final stats
  db.all('SELECT * FROM tier_balance', (err, rows) => {
    console.log('📊 Final Balance:');
    rows.forEach(r => {
      console.log(`   ${r.tier.toUpperCase()}: ${r.count} (${r.percentage}%)`);
    });
  });
  
  db.all('SELECT category, tier, COUNT(*) as count FROM domains GROUP BY category, tier ORDER BY category, tier', (err, rows) => {
    console.log('\n📦 Breakdown by Category:');
    let currentCat = '';
    rows.forEach(r => {
      if (r.category !== currentCat) {
        console.log(`\n   ${r.category.toUpperCase()}:`);
        currentCat = r.category;
      }
      console.log(`      ${r.tier}: ${r.count}`);
    });
  });
  
  db.get('SELECT COUNT(*) as total FROM domains WHERE active = 1', (err, row) => {
    console.log(`\n✅ TOTAL ACTIVE DOMAINS: ${row.total}`);
    console.log('\n🎯 Database ready for crawler!');
  });
});

db.close();
