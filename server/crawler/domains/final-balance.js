// Final balance adjustment - add more GIGANCI to reach 50/50
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'domains.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  // Add more GIGANCI - all major specialist shops
  db.run(`
    UPDATE domains SET tier = 'giganci' 
    WHERE tier = 'niszowe' 
    AND (
      domain LIKE '%shop.nl' OR
      domain LIKE '%-shop.nl' OR
      domain LIKE '%outlet.nl' OR
      domain LIKE '%-outlet.nl' OR
      domain LIKE '%online.nl' OR
      domain LIKE '%vergelijk%' OR
      domain LIKE '%vergelijken%' OR
      domain LIKE '%berekenen%' OR
      domain LIKE '%aanvragen%' OR
      domain IN (
        'kleertjes.com', 'fashionchick.nl', 'vimodos.nl', 'boozt.com',
        'sohome.nl', 'meubella.nl', 'meubel-online.nl', 'giga-meubel.nl',
        'sportwinkel.nl', 'hardloopshop.nl', 'zwemshop.nl', 'fitnessbank.nl',
        'babysupermarkt.nl', 'babyonline.nl', 'baby-wereld.nl',
        'boek.nl', 'managementboek.nl', 'studystore.nl',
        'supplement-shop.nl', 'sportvoeding.nl',
        'dierenspeciaalzaak.nl', 'dierenshop.nl',
        'kantoorartikelen.nl',
        'notebooksbilliger.nl', 'compumail.nl', 'laptopshop.nl', 'tabletshop.nl',
        'kamera-express.nl', 'photospecialist.nl', 'belsimpel.nl',
        'wasmachine-shop.nl', 'koelkast.nl', 'stofzuiger.nl',
        'gereedschap-shop.nl', 'tuinmeubel-shop.nl', 'bbq-shop.nl',
        'grasmaaier-shop.nl', 'hogedrukreiniger.nl'
      )
    )
  `, function(err) {
    console.log(`✅ Promoted ${this.changes} more domains to GIGANCI\n`);
    
    // Check final balance
    db.all('SELECT tier, COUNT(*) as count FROM domains GROUP BY tier', (err, rows) => {
      const total = rows.reduce((sum, x) => sum + x.count, 0);
      console.log('📊 FINAL BALANCE:');
      rows.forEach(r => {
        const pct = Math.round(r.count / total * 100);
        console.log(`   ${r.tier.toUpperCase()}: ${r.count} (${pct}%)`);
      });
      
      const giganci = rows.find(r => r.tier === 'giganci')?.count || 0;
      const niszowe = rows.find(r => r.tier === 'niszowe')?.count || 0;
      const diff = Math.abs(giganci - niszowe);
      const diffPct = Math.round(diff / total * 100);
      
      console.log(`\n   Difference: ${diff} domains (${diffPct}%)`);
      
      if (diffPct <= 10) {
        console.log('   ✅ Balance is GOOD! (within 10%)');
      } else if (giganci < niszowe) {
        console.log(`   ⚠️  Need ${Math.round(total/2) - giganci} more GIGANCI`);
      } else {
        console.log(`   ⚠️  Too many GIGANCI by ${giganci - Math.round(total/2)}`);
      }
      
      console.log(`\n✅ TOTAL DOMAINS: ${total}`);
      console.log('🎯 Database ready for crawler!\n');
    });
  });
});

db.close();
