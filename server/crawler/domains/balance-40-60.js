// Adjust balance to 40% GIGANCI / 60% NISZOWE
// Add medium-large stores to giganci to reach 40%

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'domains.db');
const db = new sqlite3.Database(DB_PATH);

// Additional GIGANCI - medium/large well-known stores
// Target: ~404 giganci (40% of 1011)
// Current: 202 giganci
// Need: ~202 more

const ADDITIONAL_GIGANCI = [
  // Fashion - add more known brands
  'boozt.com', 'kleertjes.com', 'fashionchick.nl', 'vimodos.nl', 'torfs.nl',
  'bristol.nl', 'vandaliamode.nl', 'steps.nl', 'ms-mode.nl', 'sting.nl',
  'sissy-boy.nl', 'mexx.nl', 'scotch-soda.nl', 'denham.nl', 'nudie-jeans.nl',
  'replay.nl', 'diesel.nl', 'pepe-jeans.nl', 'garcia.nl', 'pme-legend.nl',
  'cast-iron.nl', 'vanguard.nl', 'no-excess.nl', 'cars-jeans.nl', 'chasin.nl',
  'dstrezzed.nl', 'anerkjendt.nl', 'blend.nl', 'solid.nl', 'produkt.nl',
  'boss.nl', 'armani.nl', 'versace.nl', 'gucci.nl', 'prada.nl', 'burberry.nl',
  'ralph-lauren.nl', 'lacoste.nl', 'fred-perry.nl', 'gant.nl', 'hackett.nl',
  'barbour.nl', 'woolrich.nl', 'canada-goose.nl', 'parajumpers.nl', 'moncler.nl',
  'stone-island.nl', 'cp-company.nl', 'lyle-scott.nl', 'ben-sherman.nl',
  
  // Home - add more furniture/home stores
  'casa.nl', 'depot.nl', 'sohome.nl', 'basiclabel.nl', 'dille-kamille.nl',
  'goossens.nl', 'eijerkamp.nl', 'harvink.nl', 'montel.nl', 'giga-meubel.nl',
  'meubella.nl', 'meubel-online.nl', 'flexa.nl', 'histor.nl', 'sigma.nl',
  'alabastine.nl', 'boss-paints.nl', 'sikkens.nl', 'wijzonol.nl',
  
  // Electronics - add more tech stores
  'informatique.nl', 'compumail.nl', 'afuture.nl', 'sicomputers.nl',
  'maxict.nl', 'pcspecialist.nl', 'laptopshop.nl', 'tabletshop.nl',
  'smartphoneshop.nl', 'cameratools.nl', 'cameranu.nl', 'fotokonijnenberg.nl',
  'kamera-express.nl', 'photospecialist.nl', 'bestebieding.nl', 'prijsbest.nl',
  'allekabels.nl', 'kabeldirect.nl', 'kabelsandmore.nl', 'accessoirexpert.nl',
  'gsmpunt.nl', 'phonecompany.nl', 'notebooksbilliger.nl',
  
  // DIY - add more DIY/garden stores
  'bouwmaat.nl', 'gereedschap-shop.nl', 'tuinmeubel-shop.nl', 'bbq-shop.nl',
  'weber-shop.nl', 'grasmaaier-shop.nl', 'hogedrukreiniger.nl',
  
  // Sports - add more sports stores
  'sportwinkel.nl', 'hardloopshop.nl', 'zwemshop.nl', 'ski-shop.nl',
  'snowboard-shop.nl', 'tennis-shop.nl', 'golf-shop.nl', 'fitness-shop.nl',
  'hometrainer-shop.nl', 'loopband-shop.nl', 'fitnessbank.nl', 'yogamat-shop.nl',
  'fietsen-shop.nl', 'racefiets-shop.nl', 'mountainbike.nl',
  
  // Beauty - add more beauty/health stores
  'supplement-shop.nl', 'proteïne-shop.nl', 'sportvoeding.nl',
  'make-up-shop.nl', 'parfum-shop.nl', 'huidverzorging.nl',
  
  // Baby - add more baby stores
  'babysupermarkt.nl', 'babyonline.nl', 'baby-wereld.nl', 'babykamer-shop.nl',
  'kinderwagen.nl', 'autostoel-shop.nl', 'maxi-cosi.nl',
  
  // Books - add more book/media stores
  'boek.nl', 'managementboek.nl', 'studystore.nl', 'bookspot.nl',
  'comics-shop.nl', 'manga-shop.nl', 'muziek-shop.nl', 'cd-shop.nl',
  'vinyl-shop.nl', 'dvd-shop.nl',
  
  // Appliances - add more appliance stores
  'wasmachine-shop.nl', 'droger-shop.nl', 'vaatwasser.nl', 'koelkast.nl',
  'vriezer.nl', 'oven-shop.nl', 'magnetron.nl', 'kookplaat.nl',
  'afzuigkap.nl', 'stofzuiger.nl', 'strijkijzer.nl', 'koffiezetapparaat.nl',
  
  // Office - add more office stores
  'kantoorartikelen.nl', 'pennen-shop.nl', 'papier-shop.nl',
  
  // Pets - add more pet stores
  'dierenspeciaalzaak.nl', 'dierenshop.nl', 'hondenshop.nl', 'kattenshop.nl',
  'aquarium-shop.nl', 'hondenvoer-shop.nl', 'kattenvoer-shop.nl',
  
  // Discount - add more discount/outlet stores
  'outlet-shop.nl', 'sale-shop.nl', 'korting-shop.nl', 'dagdeal.nl',
  'aanbieding.nl', 'deal-shop.nl', 'flash-sale.nl', 'uitverkoop.nl',
  
  // Diensten - Energy (add more)
  'innogy.nl', 'eon.nl', 'powerpeers.nl', 'mijndomein-energie.nl',
  'anode-energie.nl', 'energie-vnn.nl', 'overstappen-energie.nl',
  'groene-stroom.nl', 'duurzame-energie.nl', 'zonnepanelen.nl',
  'laadpaal.nl', 'warmtepomp.nl', 'cv-ketel.nl', 'thermostaat.nl',
  
  // Diensten - Telecom (add more)
  'lycamobile.nl', 'robin-mobile.nl', 'kruidvat-mobiel.nl', 'action-mobiel.nl',
  'jumbo-mobiel.nl', 'mobiel-vergelijken.nl', 'sim-only.nl',
  'internet-vergelijken.nl', 'glasvezel-vergelijken.nl', 'wifi-vergelijken.nl',
  
  // Diensten - Insurance (add more)
  'promovendum.nl', 'eno.nl', 'aevitae.nl', 'caresq.nl', 'anderzorg.nl',
  'autoverzekering.nl', 'inboedelverzekering.nl', 'rechtsbijstand.nl',
  'levensverzekering.nl', 'uitvaartverzekering.nl', 'aov-verzekering.nl',
  'tandartsverzekering.nl', 'fietsverzekering.nl', 'motorverzekering.nl',
  'reisverzekering.nl', 'annuleringsverzekering.nl', 'verzekering-vergelijken.nl',
  
  // Diensten - Vacation (add more)
  'prijsvrij.nl', 'vakantiediscounter.nl', 'eliza-was-here.nl', 'tjingo.nl',
  'vliegtickets.nl', 'budgetair.nl', 'vlucht-vergelijken.nl',
  'hotel-vergelijken.nl', 'vakantiehuizen.nl', 'bungalow.nl',
  'camping.nl', 'vakantieparken.nl', 'europarcs.nl',
  
  // Finance - add more comparison/application sites
  'hypotheek-rente.nl', 'hypotheek-advies.nl', 'hypotheek-aanvragen.nl',
  'hypotheek-oversluiten.nl', 'starterslening.nl', 'nhg-hypotheek.nl',
  'kredietshop.nl', 'krediet-aanvragen.nl', 'doorlopend-krediet.nl',
  'auto-lening.nl', 'verbouwingslening.nl', 'studielening.nl',
  'zakelijk-lease.nl', 'operational-lease.nl', 'financial-lease.nl',
  'elektrisch-lease.nl', 'auto-lease.nl', 'fiets-lease.nl',
  'lease-berekenen.nl', 'lease-vergelijken.nl', 'lease-aanvragen.nl',
  'creditcard-aanvragen.nl', 'gratis-creditcard.nl', 'zakelijke-creditcard.nl',
  'spaarrekening-vergelijken.nl', 'hoogste-rente.nl', 'beleggen-vergelijken.nl',
  'degiro.nl', 'brand-new-day.nl', 'leaseplan-bank.nl'
];

db.serialize(() => {
  console.log('🔄 Adjusting balance to 40% GIGANCI / 60% NISZOWE...\n');
  
  // Get current stats
  db.get('SELECT COUNT(*) as total FROM domains', (err, row) => {
    const total = row.total;
    const target = Math.round(total * 0.4);
    
    console.log(`📊 Target: ${target} giganci (40% of ${total})\n`);
    
    // Promote additional domains
    const stmt = db.prepare('UPDATE domains SET tier = "giganci" WHERE domain = ? AND tier = "niszowe"');
    
    let promoted = 0;
    ADDITIONAL_GIGANCI.forEach(domain => {
      stmt.run(domain, function(err) {
        if (this.changes > 0) promoted++;
      });
    });
    
    stmt.finalize(() => {
      console.log(`✅ Promoted ${promoted} additional domains to GIGANCI\n`);
      
      // Check final balance
      db.all('SELECT tier, COUNT(*) as count FROM domains GROUP BY tier', (err, rows) => {
        if (!rows) {
          db.close();
          return;
        }
        
        const total = rows.reduce((sum, x) => sum + x.count, 0);
        console.log('📊 FINAL BALANCE:');
        rows.forEach(r => {
          const pct = Math.round(r.count / total * 100);
          console.log(`   ${r.tier.toUpperCase()}: ${r.count} (${pct}%)`);
        });
        
        const giganci = rows.find(r => r.tier === 'giganci')?.count || 0;
        const niszowe = rows.find(r => r.tier === 'niszowe')?.count || 0;
        const giganciPct = Math.round(giganci / total * 100);
        const niszowePct = Math.round(niszowe / total * 100);
        
        console.log(`\n   Total: ${total} domains`);
        
        if (giganciPct >= 38 && giganciPct <= 42) {
          console.log(`   ✅ Perfect balance! (${giganciPct}% / ${niszowePct}%)`);
        } else if (giganciPct < 40) {
          console.log(`   ⚠️  Need ${Math.round(total * 0.4) - giganci} more GIGANCI`);
        } else {
          console.log(`   ⚠️  Too many GIGANCI by ${giganci - Math.round(total * 0.4)}`);
        }
        
        console.log(`\n🎯 Database ready for crawler!\n`);
        db.close();
      });
    });
  });
});
