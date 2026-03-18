// Import 1000 NL domains into SQLite database
// Filters out: used items (marktplaats, 2dehands, vinted) and food stores
// Balance: 50% giganci, 50% niszowe

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'domains.db');

// Initialize database
const db = new sqlite3.Database(DB_PATH);

// GIGANCI - Big brands (500 domains target)
const GIGANCI = [
  // E-commerce giants (4)
  { domain: 'bol.com', category: 'electronics', priority: 2, rateLimit: 50, pricing: 'high', marketShare: '35%', hasParser: true },
  { domain: 'coolblue.nl', category: 'electronics', priority: 2, rateLimit: 40, pricing: 'high', marketShare: '15%', hasParser: true },
  { domain: 'mediamarkt.nl', category: 'electronics', priority: 2, rateLimit: 40, pricing: 'high', marketShare: '12%', hasParser: true },
  { domain: 'amazon.nl', category: 'electronics', priority: 3, rateLimit: 30, pricing: 'medium-high', marketShare: '8%', hasParser: true },
  
  // Fashion giants (10)
  { domain: 'zalando.nl', category: 'fashion', priority: 2, rateLimit: 40, pricing: 'high', hasParser: false },
  { domain: 'wehkamp.nl', category: 'fashion', priority: 2, rateLimit: 40, pricing: 'high', hasParser: true },
  { domain: 'aboutyou.nl', category: 'fashion', priority: 2, rateLimit: 30, pricing: 'medium-high', hasParser: false },
  { domain: 'asos.com', category: 'fashion', priority: 2, rateLimit: 30, pricing: 'medium-high', hasParser: false },
  { domain: 'hm.nl', category: 'fashion', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'zara.nl', category: 'fashion', priority: 2, rateLimit: 35, pricing: 'medium-high', hasParser: false },
  { domain: 'mango.nl', category: 'fashion', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'esprit.nl', category: 'fashion', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'gstar.nl', category: 'fashion', priority: 2, rateLimit: 30, pricing: 'medium-high', hasParser: false },
  { domain: 'tommy-hilfiger.nl', category: 'fashion', priority: 2, rateLimit: 30, pricing: 'high', hasParser: false },
  
  // Home & Furniture giants (15)
  { domain: 'ikea.nl', category: 'home', priority: 2, rateLimit: 40, pricing: 'medium', hasParser: true },
  { domain: 'jysk.nl', category: 'home', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'kika.nl', category: 'home', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'kwantum.nl', category: 'home', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'leenbakker.nl', category: 'home', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'blokker.nl', category: 'home', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'xenos.nl', category: 'home', priority: 2, rateLimit: 35, pricing: 'low', hasParser: false },
  { domain: 'hema.nl', category: 'home', priority: 2, rateLimit: 40, pricing: 'medium', hasParser: false },
  { domain: 'loods5.nl', category: 'home', priority: 2, rateLimit: 30, pricing: 'medium-high', hasParser: false },
  { domain: 'fonq.nl', category: 'home', priority: 2, rateLimit: 30, pricing: 'medium-high', hasParser: false },
  { domain: 'wayfair.nl', category: 'home', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'home24.nl', category: 'home', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'woood.nl', category: 'home', priority: 2, rateLimit: 25, pricing: 'medium-high', hasParser: false },
  { domain: 'vtwonen.nl', category: 'home', priority: 2, rateLimit: 25, pricing: 'medium-high', hasParser: false },
  { domain: 'riviera-maison.nl', category: 'home', priority: 2, rateLimit: 25, pricing: 'high', hasParser: false },
  
  // DIY giants (10)
  { domain: 'gamma.nl', category: 'diy', priority: 2, rateLimit: 40, pricing: 'medium', hasParser: false },
  { domain: 'praxis.nl', category: 'diy', priority: 2, rateLimit: 40, pricing: 'medium', hasParser: false },
  { domain: 'karwei.nl', category: 'diy', priority: 2, rateLimit: 40, pricing: 'medium', hasParser: false },
  { domain: 'hornbach.nl', category: 'diy', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'hubo.nl', category: 'diy', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'brico.nl', category: 'diy', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'toolstation.nl', category: 'diy', priority: 2, rateLimit: 30, pricing: 'low', hasParser: false },
  { domain: 'screwfix.nl', category: 'diy', priority: 2, rateLimit: 30, pricing: 'low', hasParser: false },
  { domain: 'intratuin.nl', category: 'diy', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'tuincentrum.nl', category: 'diy', priority: 2, rateLimit: 25, pricing: 'medium', hasParser: false },
  
  // Sports giants (8)
  { domain: 'decathlon.nl', category: 'sports', priority: 2, rateLimit: 40, pricing: 'low', hasParser: true },
  { domain: 'intersport.nl', category: 'sports', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'perry-sport.nl', category: 'sports', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'sportsdirect.nl', category: 'sports', priority: 2, rateLimit: 30, pricing: 'low', hasParser: false },
  { domain: 'bever.nl', category: 'sports', priority: 2, rateLimit: 30, pricing: 'medium-high', hasParser: false },
  { domain: 'aktiesport.nl', category: 'sports', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'fitshop.nl', category: 'sports', priority: 2, rateLimit: 25, pricing: 'medium', hasParser: false },
  { domain: 'runnersneed.nl', category: 'sports', priority: 2, rateLimit: 25, pricing: 'medium', hasParser: false },
  
  // Discount stores (10)
  { domain: 'action.com', category: 'discount', priority: 2, rateLimit: 40, pricing: 'very-low', hasParser: false },
  { domain: 'big-bazar.nl', category: 'discount', priority: 2, rateLimit: 35, pricing: 'very-low', hasParser: false },
  { domain: 'wibra.nl', category: 'discount', priority: 2, rateLimit: 35, pricing: 'very-low', hasParser: false },
  { domain: 'zeeman.com', category: 'discount', priority: 2, rateLimit: 35, pricing: 'very-low', hasParser: false },
  { domain: 'euroshop.nl', category: 'discount', priority: 2, rateLimit: 30, pricing: 'very-low', hasParser: false },
  { domain: 'goedkoop.nl', category: 'discount', priority: 2, rateLimit: 25, pricing: 'very-low', hasParser: false },
  { domain: 'outlet-shop.nl', category: 'discount', priority: 2, rateLimit: 25, pricing: 'low', hasParser: false },
  { domain: 'sale-shop.nl', category: 'discount', priority: 2, rateLimit: 25, pricing: 'low', hasParser: false },
  { domain: 'korting-shop.nl', category: 'discount', priority: 2, rateLimit: 25, pricing: 'low', hasParser: false },
  { domain: 'dagdeal.nl', category: 'discount', priority: 2, rateLimit: 25, pricing: 'low', hasParser: false },
  
  // Beauty giants (8)
  { domain: 'etos.nl', category: 'beauty', priority: 2, rateLimit: 40, pricing: 'medium', hasParser: false },
  { domain: 'kruidvat.nl', category: 'beauty', priority: 2, rateLimit: 40, pricing: 'medium', hasParser: false },
  { domain: 'douglas.nl', category: 'beauty', priority: 2, rateLimit: 35, pricing: 'high', hasParser: false },
  { domain: 'parfumswinkel.nl', category: 'beauty', priority: 2, rateLimit: 30, pricing: 'medium-high', hasParser: false },
  { domain: 'lookfantastic.nl', category: 'beauty', priority: 2, rateLimit: 30, pricing: 'medium-high', hasParser: false },
  { domain: 'parfum-shop.nl', category: 'beauty', priority: 2, rateLimit: 25, pricing: 'medium', hasParser: false },
  { domain: 'huidverzorging.nl', category: 'beauty', priority: 2, rateLimit: 25, pricing: 'medium', hasParser: false },
  { domain: 'vitamine-shop.nl', category: 'beauty', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  
  // Baby & Kids giants (5)
  { domain: 'prenatal.nl', category: 'baby', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'babypark.nl', category: 'baby', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'babyplanet.nl', category: 'baby', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'baby-dump.nl', category: 'baby', priority: 2, rateLimit: 30, pricing: 'low', hasParser: false },
  { domain: 'toys.nl', category: 'baby', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  
  // Books & Media giants (5)
  { domain: 'bruna.nl', category: 'books', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'nedgame.nl', category: 'books', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'gamemania.nl', category: 'books', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'eci.nl', category: 'books', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'free-record-shop.nl', category: 'books', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  
  // Appliances giants (5)
  { domain: 'ep.nl', category: 'appliances', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'expert.nl', category: 'appliances', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'witgoedhandel.nl', category: 'appliances', priority: 2, rateLimit: 30, pricing: 'low', hasParser: false },
  { domain: 'electronicavoorjou.nl', category: 'appliances', priority: 2, rateLimit: 30, pricing: 'low', hasParser: false },
  { domain: 'budgetplan.nl', category: 'appliances', priority: 2, rateLimit: 30, pricing: 'low', hasParser: false },
  
  // Office giants (3)
  { domain: 'staples.nl', category: 'office', priority: 2, rateLimit: 35, pricing: 'medium', hasParser: false },
  { domain: 'officentre.nl', category: 'office', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'viking.nl', category: 'office', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  
  // Pets giants (2)
  { domain: 'pets-place.nl', category: 'pets', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false },
  { domain: 'zooplus.nl', category: 'pets', priority: 2, rateLimit: 30, pricing: 'medium', hasParser: false }
];

console.log(`Total GIGANCI: ${GIGANCI.length}`);
console.log('Target: 100-120 giganci for products');
console.log('\nNote: This is a starter set. Full 500 giganci will include:');
console.log('- More fashion brands (Calvin Klein, Boss, Armani, etc.)');
console.log('- More electronics (BCC, Dixons, Kijkshop, etc.)');
console.log('- More home brands (Casa, Depot, Sohome, etc.)');
console.log('- Diensten giants (KPN, Ziggo, Independer, etc.)');
console.log('- Finance giants (ING, Rabobank, ABN AMRO, etc.)');
console.log('\nRun full import script to add all 1000 domains');

// Initialize database and insert sample data
db.serialize(() => {
  // Read and execute schema
  const fs = require('fs');
  const schema = fs.readFileSync(path.join(__dirname, 'init-database.sql'), 'utf8');
  db.exec(schema);
  
  // Insert GIGANCI
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO domains (domain, tier, category, priority, rate_limit, expected_pricing, has_parser, market_share)
    VALUES (?, 'giganci', ?, ?, ?, ?, ?, ?)
  `);
  
  GIGANCI.forEach(d => {
    stmt.run(d.domain, d.category, d.priority, d.rateLimit, d.pricing, d.hasParser ? 1 : 0, d.marketShare || null);
  });
  
  stmt.finalize();
  
  // Show stats
  db.get('SELECT COUNT(*) as count FROM domains WHERE tier = "giganci"', (err, row) => {
    console.log(`\n✅ Imported ${row.count} GIGANCI domains`);
  });
  
  db.all('SELECT * FROM tier_balance', (err, rows) => {
    console.log('\n📊 Current balance:');
    rows.forEach(r => {
      console.log(`  ${r.tier}: ${r.count} (${r.percentage}%)`);
    });
  });
});

db.close();
