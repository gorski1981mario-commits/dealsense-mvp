// Rebalance database to 50% GIGANCI / 50% NISZOWE
// Strategy: Classify bigger/known brands as GIGANCI

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'domains.db');
const db = new sqlite3.Database(DB_PATH);

// Extended GIGANCI patterns - any domain matching these should be GIGANCI
const GIGANCI_PATTERNS = [
  // Already classified
  'bol.com', 'coolblue', 'mediamarkt', 'amazon',
  
  // Major fashion
  'zalando', 'wehkamp', 'aboutyou', 'asos', 'boozt', 'hm.nl', 'zara', 'mango', 
  'esprit', 'gstar', 'tommy', 'calvin', 'boss', 'armani', 'versace', 'gucci',
  'prada', 'burberry', 'ralph-lauren', 'lacoste', 'nike', 'adidas', 'puma',
  'levis', 'diesel', 'replay', 'scotch-soda', 'denham', 'garcia', 'pme-legend',
  'suitsupply', 'vangraaf', 'suitable', 'mexx', 'only.nl', 'jack-jones',
  'vero-moda', 'selected', 'pieces', 'vila', 'sissy-boy', 'sting.nl',
  'steps.nl', 'ms-mode', 'bristol', 'omoda', 'vanharen', 'torfs', 'manfield',
  
  // Major home
  'ikea', 'jysk', 'kika', 'kwantum', 'leenbakker', 'blokker', 'xenos', 'hema',
  'loods5', 'fonq', 'wayfair', 'home24', 'woood', 'vtwonen', 'riviera-maison',
  'casa.nl', 'depot.nl', 'basiclabel', 'dille-kamille', 'goossens', 'eijerkamp',
  'harvink', 'giga-meubel',
  
  // Major DIY
  'gamma', 'praxis', 'karwei', 'hornbach', 'hubo', 'brico', 'toolstation',
  'screwfix', 'intratuin', 'tuincentrum', 'flexa', 'histor', 'sigma',
  'alabastine', 'sikkens', 'bouwmaat',
  
  // Major sports
  'decathlon', 'intersport', 'perry-sport', 'sportsdirect', 'bever', 'aktiesport',
  'fitshop', 'runnersneed',
  
  // Major discount
  'action.com', 'big-bazar', 'wibra', 'zeeman', 'euroshop',
  
  // Major beauty
  'etos', 'kruidvat', 'douglas', 'parfumswinkel', 'lookfantastic',
  
  // Major baby
  'prenatal', 'babypark', 'babyplanet', 'baby-dump', 'toys.nl',
  
  // Major books
  'bruna', 'nedgame', 'gamemania', 'eci.nl', 'libris', 'free-record-shop',
  
  // Major electronics
  'bcc', 'dixons', 'kijkshop', 'bobshop', 'mycom', 'alternate', 'azerty',
  'megekko', 'paradigit', 'centralpoint', 'informatique',
  
  // Major appliances
  'ep.nl', 'expert', 'witgoedhandel', 'electronicavoorjou', 'budgetplan',
  
  // Major office
  'staples', 'officentre', 'viking',
  
  // Major pets
  'pets-place', 'zooplus',
  
  // Major diensten (energy)
  'essent', 'eneco', 'vattenfall', 'greenchoice', 'budget-energie', 'oxxio',
  'energiedirect', 'nuon', 'delta.nl', 'engie', 'innogy', 'eon.nl',
  'pure-energie', 'qurrent', 'vandebron', 'zonneplan', 'gaslicht',
  'independer', 'energievergelijk', 'pricewise',
  
  // Major diensten (telecom)
  'kpn.com', 'ziggo', 'odido', 't-mobile', 'vodafone', 'tele2', 'youfone',
  'simyo', 'ben.nl', 'hollandsnieuwe', 'lebara', 'belsimpel', 'mobiel.nl',
  
  // Major diensten (insurance)
  'centraal-beheer', 'interpolis', 'nationale-nederlanden', 'aegon', 'reaal',
  'ditzo', 'inshared', 'ohra', 'fbto', 'unive', 'zilveren-kruis', 'vgz',
  'cz.nl', 'menzis', 'onvz', 'dsw', 'zorg-en-zekerheid', 'anwb',
  
  // Major diensten (vacation)
  'booking.com', 'tui.nl', 'corendon', 'd-reizen', 'sunweb', 'kras.nl',
  'transavia', 'skyscanner', 'cheaptickets', 'center-parcs', 'landal', 'roompot',
  
  // Major finance (banks)
  'ing.nl', 'rabobank', 'abn-amro', 'sns.nl', 'asn-bank', 'triodos', 'knab',
  'bunq', 'revolut', 'n26.nl', 'moneyou',
  
  // Major finance (hypotheken)
  'hypotheker', 'dehypotheekshop', 'obvion', 'florius', 'aegon-hypotheken',
  'nn-hypotheken',
  
  // Major finance (leasing)
  'directlease', 'leaseplan', 'alphabet', 'athlon', 'ald-automotive', 'arval',
  
  // Major finance (leningen)
  'geldshop', 'santander', 'ferratum', 'credivance',
  
  // Major finance (creditcards)
  'ics.nl', 'americanexpress', 'visa.nl', 'mastercard'
];

db.serialize(() => {
  console.log('🔄 Rebalancing database to 50/50...\n');
  
  // Get current stats
  db.all('SELECT tier, COUNT(*) as count FROM domains GROUP BY tier', (err, rows) => {
    console.log('📊 BEFORE rebalance:');
    rows.forEach(r => {
      const pct = Math.round(r.count / rows.reduce((sum, x) => sum + x.count, 0) * 100);
      console.log(`   ${r.tier}: ${r.count} (${pct}%)`);
    });
    console.log('');
  });
  
  // Update domains matching GIGANCI patterns
  const stmt = db.prepare(`UPDATE domains SET tier = 'giganci' WHERE domain LIKE ? AND tier = 'niszowe'`);
  
  let updated = 0;
  GIGANCI_PATTERNS.forEach(pattern => {
    stmt.run(`%${pattern}%`, function(err) {
      if (this.changes > 0) {
        updated += this.changes;
      }
    });
  });
  
  stmt.finalize(() => {
    console.log(`✅ Updated ${updated} domains to GIGANCI\n`);
    
    // Check new balance
    db.all('SELECT tier, COUNT(*) as count FROM domains GROUP BY tier', (err, rows) => {
      console.log('📊 AFTER rebalance:');
      const total = rows.reduce((sum, x) => sum + x.count, 0);
      rows.forEach(r => {
        const pct = Math.round(r.count / total * 100);
        console.log(`   ${r.tier}: ${r.count} (${pct}%)`);
      });
      
      const giganci = rows.find(r => r.tier === 'giganci')?.count || 0;
      const niszowe = rows.find(r => r.tier === 'niszowe')?.count || 0;
      
      if (Math.abs(giganci - niszowe) < total * 0.1) {
        console.log('\n✅ Balance is good! (~50/50)');
      } else if (giganci < niszowe) {
        console.log('\n⚠️  Still need more GIGANCI');
        console.log(`   Target: ~${Math.round(total/2)} giganci`);
        console.log(`   Current: ${giganci} giganci`);
        console.log(`   Missing: ${Math.round(total/2) - giganci} domains`);
      } else {
        console.log('\n⚠️  Too many GIGANCI');
      }
    });
    
    // Show category breakdown
    db.all(`
      SELECT category, tier, COUNT(*) as count 
      FROM domains 
      GROUP BY category, tier 
      ORDER BY category, tier
    `, (err, rows) => {
      console.log('\n📦 Category Breakdown:');
      let currentCat = '';
      rows.forEach(r => {
        if (r.category !== currentCat) {
          console.log(`\n   ${r.category.toUpperCase()}:`);
          currentCat = r.category;
        }
        console.log(`      ${r.tier}: ${r.count}`);
      });
    });
  });
});

db.close();
