// Check final database balance
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'domains.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.all('SELECT tier, COUNT(*) as count FROM domains WHERE active = 1 GROUP BY tier', (err, rows) => {
    if (err || !rows || rows.length === 0) {
      console.log('❌ Error reading database');
      return;
    }
    
    const total = rows.reduce((sum, x) => sum + x.count, 0);
    console.log('📊 FINAL DATABASE BALANCE:\n');
    rows.forEach(r => {
      const pct = Math.round(r.count / total * 100);
      console.log(`   ${r.tier.toUpperCase()}: ${r.count} (${pct}%)`);
    });
    
    const giganci = rows.find(r => r.tier === 'giganci')?.count || 0;
    const niszowe = rows.find(r => r.tier === 'niszowe')?.count || 0;
    const diff = Math.abs(giganci - niszowe);
    const diffPct = Math.round(diff / total * 100);
    
    console.log(`\n   Total: ${total} domains`);
    console.log(`   Difference: ${diff} domains (${diffPct}%)`);
    
    if (diffPct <= 10) {
      console.log('\n   ✅ Balance is GOOD! (within 10%)');
    } else {
      console.log(`\n   ⚠️  Balance is off by ${diffPct}%`);
    }
    
    // Category breakdown
    db.all(`
      SELECT category, tier, COUNT(*) as count 
      FROM domains WHERE active = 1
      GROUP BY category, tier 
      ORDER BY category, tier
    `, (err, catRows) => {
      console.log('\n📦 BREAKDOWN BY CATEGORY:\n');
      let currentCat = '';
      catRows.forEach(r => {
        if (r.category !== currentCat) {
          console.log(`   ${r.category.toUpperCase()}:`);
          currentCat = r.category;
        }
        console.log(`      ${r.tier}: ${r.count}`);
      });
      
      console.log('\n🎯 Database ready for crawler integration!\n');
    });
  });
});

db.close();
