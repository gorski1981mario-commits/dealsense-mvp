// Add AUTOMOTIVE category - Auto i akcesoria
// Missing from current database

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'domains.db');
const db = new sqlite3.Database(DB_PATH);

// AUTOMOTIVE domains for NL market
const AUTOMOTIVE_DOMAINS = [
  // GIGANCI - big auto parts stores
  { domain: 'halfords.nl', tier: 'giganci', priority: 2, rateLimit: 35, pricing: 'medium', notes: 'Grootste auto/fiets winkel NL' },
  { domain: 'atd.nl', tier: 'giganci', priority: 2, rateLimit: 30, pricing: 'medium', notes: 'Auto Totaal Dienst - grote keten' },
  { domain: 'kwikfit.nl', tier: 'giganci', priority: 2, rateLimit: 30, pricing: 'medium', notes: 'Banden specialist' },
  { domain: 'bandenleader.nl', tier: 'giganci', priority: 2, rateLimit: 30, pricing: 'low', notes: 'Online banden specialist' },
  { domain: 'oponeo.nl', tier: 'giganci', priority: 2, rateLimit: 30, pricing: 'low', notes: 'Banden online' },
  { domain: 'autodoc.nl', tier: 'giganci', priority: 2, rateLimit: 30, pricing: 'low', notes: 'Auto onderdelen online' },
  { domain: 'motorkledingcenter.nl', tier: 'giganci', priority: 2, rateLimit: 25, pricing: 'medium', notes: 'Motorkleding specialist' },
  
  // NISZOWE - specialists with better prices
  { domain: 'autoteile.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'low', notes: 'Auto onderdelen specialist' },
  { domain: 'autodelen.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'low', notes: 'Onderdelen online' },
  { domain: 'autopartsonline.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'low', notes: 'Parts specialist' },
  { domain: 'carparts-online.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'very-low', notes: 'Goedkope onderdelen' },
  { domain: 'autovoordeelshop.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'very-low', notes: 'Discount auto parts' },
  { domain: 'onderdelen-online.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'low', notes: 'Online specialist' },
  { domain: 'autobandenmarkt.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'low', notes: 'Banden specialist' },
  { domain: 'bandenexpert.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'low', notes: 'Banden online' },
  { domain: 'bandenkopen.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'very-low', notes: 'Goedkope banden' },
  { domain: 'autoaccu-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Accu specialist' },
  { domain: 'accu-online.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Batterijen online' },
  { domain: 'ruitenwisser-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'very-low', notes: 'Ruitenwissers' },
  { domain: 'auto-accessoires.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'low', notes: 'Accessoires specialist' },
  { domain: 'autoverzorging-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Verzorging producten' },
  { domain: 'autowax-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Wax en polish' },
  { domain: 'autopoets-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Poetsproducten' },
  { domain: 'dashcam-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Dashcam specialist' },
  { domain: 'navigatie-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'GPS navigatie' },
  { domain: 'autoradio-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Car audio' },
  { domain: 'autostoel-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Autostoelen' },
  { domain: 'kinderzitje-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'medium', notes: 'Kinderzitjes' },
  { domain: 'fietsendrager-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Fietsendragers' },
  { domain: 'dakkoffer-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Dakkoffers' },
  { domain: 'trekhaak-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Trekhaak specialist' },
  { domain: 'motor-onderdelen.nl', tier: 'niszowe', priority: 1, rateLimit: 25, pricing: 'low', notes: 'Motor parts' },
  { domain: 'motorhelm-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'medium', notes: 'Motorhelmen' },
  { domain: 'motorjas-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'medium', notes: 'Motorjassen' },
  { domain: 'motorhandschoen-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'low', notes: 'Handschoenen' },
  { domain: 'motorlaarzen-shop.nl', tier: 'niszowe', priority: 1, rateLimit: 20, pricing: 'medium', notes: 'Motorlaarzen' }
];

db.serialize(() => {
  console.log('🚗 Adding AUTOMOTIVE category...\n');
  
  const stmt = db.prepare(`
    INSERT INTO domains (domain, tier, category, priority, rate_limit, expected_pricing, has_parser, notes, active)
    VALUES (?, ?, 'automotive', ?, ?, ?, 0, ?, 1)
  `);
  
  let inserted = 0;
  AUTOMOTIVE_DOMAINS.forEach(d => {
    stmt.run(d.domain, d.tier, d.priority, d.rateLimit, d.pricing, d.notes, function(err) {
      if (err) {
        console.log(`   ⚠️  ${d.domain} - already exists or error`);
      } else {
        inserted++;
      }
    });
  });
  
  stmt.finalize(() => {
    console.log(`\n✅ Added ${inserted} automotive domains\n`);
    
    // Check balance
    db.all('SELECT tier, COUNT(*) as count FROM domains WHERE active = 1 GROUP BY tier', (err, rows) => {
      if (!rows) {
        db.close();
        return;
      }
      
      const total = rows.reduce((sum, x) => sum + x.count, 0);
      console.log('📊 NEW BALANCE:');
      rows.forEach(r => {
        const pct = Math.round(r.count / total * 100);
        console.log(`   ${r.tier.toUpperCase()}: ${r.count} (${pct}%)`);
      });
      
      // Check automotive category
      db.get('SELECT COUNT(*) as count FROM domains WHERE category = "automotive" AND active = 1', (err, row) => {
        console.log(`\n🚗 AUTOMOTIVE: ${row.count} domains`);
        
        db.all('SELECT tier, COUNT(*) as count FROM domains WHERE category = "automotive" GROUP BY tier', (err, autoRows) => {
          autoRows.forEach(r => {
            console.log(`   ${r.tier}: ${r.count}`);
          });
          
          console.log('\n✅ Category "Auto i akcesoria" added!\n');
          db.close();
        });
      });
    });
  });
});
