// Fix balance - move specialist shops back to NISZOWE
// Only TRUE giants should be GIGANCI
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'domains.db');
const db = new sqlite3.Database(DB_PATH);

// TRUE GIGANCI - only the biggest, most well-known brands
const TRUE_GIGANCI = [
  // E-commerce giants
  'bol.com', 'coolblue.nl', 'mediamarkt.nl', 'amazon.nl',
  
  // Fashion giants (top 20)
  'zalando.nl', 'wehkamp.nl', 'aboutyou.nl', 'asos.com', 'hm.nl', 'zara.nl',
  'mango.nl', 'esprit.nl', 'gstar.nl', 'tommy-hilfiger.nl', 'calvin-klein.nl',
  'nike.nl', 'adidas.nl', 'levis.nl', 'only.nl', 'jack-jones.nl',
  'vero-moda.nl', 'selected.nl', 'omoda.nl', 'vanharen.nl',
  
  // Home giants (top 15)
  'ikea.nl', 'jysk.nl', 'kika.nl', 'kwantum.nl', 'leenbakker.nl',
  'blokker.nl', 'xenos.nl', 'hema.nl', 'loods5.nl', 'fonq.nl',
  'wayfair.nl', 'home24.nl', 'woood.nl', 'vtwonen.nl', 'riviera-maison.nl',
  
  // DIY giants (top 10)
  'gamma.nl', 'praxis.nl', 'karwei.nl', 'hornbach.nl', 'hubo.nl',
  'brico.nl', 'toolstation.nl', 'screwfix.nl', 'intratuin.nl', 'tuincentrum.nl',
  
  // Sports giants (top 8)
  'decathlon.nl', 'intersport.nl', 'perry-sport.nl', 'sportsdirect.nl',
  'bever.nl', 'aktiesport.nl', 'fitshop.nl', 'runnersneed.nl',
  
  // Discount giants (top 8)
  'action.com', 'big-bazar.nl', 'wibra.nl', 'zeeman.com',
  'euroshop.nl', 'hema.nl', 'blokker.nl', 'xenos.nl',
  
  // Beauty giants (top 6)
  'etos.nl', 'kruidvat.nl', 'douglas.nl', 'parfumswinkel.nl',
  'lookfantastic.nl', 'vitamine-shop.nl',
  
  // Baby giants (top 5)
  'prenatal.nl', 'babypark.nl', 'babyplanet.nl', 'baby-dump.nl', 'toys.nl',
  
  // Books giants (top 5)
  'bruna.nl', 'nedgame.nl', 'gamemania.nl', 'eci.nl', 'libris.nl',
  
  // Electronics giants (top 10)
  'bcc.nl', 'dixons.nl', 'kijkshop.nl', 'bobshop.nl', 'mycom.nl',
  'alternate.nl', 'azerty.nl', 'megekko.nl', 'paradigit.nl', 'centralpoint.nl',
  
  // Appliances giants (top 5)
  'ep.nl', 'expert.nl', 'witgoedhandel.nl', 'electronicavoorjou.nl', 'budgetplan.nl',
  
  // Office giants (top 3)
  'staples.nl', 'officentre.nl', 'viking.nl',
  
  // Pets giants (top 2)
  'pets-place.nl', 'zooplus.nl',
  
  // Energy giants (top 20)
  'essent.nl', 'eneco.nl', 'vattenfall.nl', 'greenchoice.nl', 'budget-energie.nl',
  'oxxio.nl', 'energiedirect.nl', 'nuon.nl', 'delta.nl', 'engie.nl',
  'gaslicht.com', 'independer.nl', 'energievergelijk.nl', 'pricewise.nl',
  'pure-energie.nl', 'qurrent.nl', 'vandebron.nl', 'zonneplan.nl',
  'coolblue-energie.nl', 'hollandse-energie.nl',
  
  // Telecom giants (top 15)
  'kpn.com', 'ziggo.nl', 'odido.nl', 't-mobile.nl', 'vodafone.nl',
  'tele2.nl', 'youfone.nl', 'simyo.nl', 'ben.nl', 'hollandsnieuwe.nl',
  'lebara.nl', 'belsimpel.nl', 'mobiel.nl', 'simpel.nl', 'ah-mobiel.nl',
  
  // Insurance giants (top 25)
  'centraal-beheer.nl', 'interpolis.nl', 'nationale-nederlanden.nl', 'aegon.nl',
  'reaal.nl', 'ditzo.nl', 'inshared.nl', 'ohra.nl', 'fbto.nl', 'unive.nl',
  'zilveren-kruis.nl', 'vgz.nl', 'cz.nl', 'menzis.nl', 'onvz.nl', 'dsw.nl',
  'zorg-en-zekerheid.nl', 'anwb.nl', 'independer.nl', 'pricewise.nl',
  'zorgwijzer.nl', 'autoverzekering.nl', 'zorgverzekering.nl', 'woonverzekering.nl',
  'reisverzekering.nl',
  
  // Vacation giants (top 12)
  'booking.com', 'tui.nl', 'corendon.nl', 'd-reizen.nl', 'sunweb.nl',
  'kras.nl', 'transavia-holidays.nl', 'skyscanner.nl', 'cheaptickets.nl',
  'center-parcs.nl', 'landal.nl', 'roompot.nl',
  
  // Finance - Banks (top 10)
  'ing.nl', 'rabobank.nl', 'abn-amro.nl', 'sns.nl', 'asn-bank.nl',
  'triodos.nl', 'knab.nl', 'bunq.nl', 'revolut.nl', 'moneyou.nl',
  
  // Finance - Hypotheken (top 8)
  'hypotheker.nl', 'dehypotheekshop.nl', 'obvion.nl', 'florius.nl',
  'aegon-hypotheken.nl', 'nn-hypotheken.nl', 'hypotheek-vergelijken.nl', 'hypotheek-berekenen.nl',
  
  // Finance - Leasing (top 8)
  'directlease.nl', 'leaseplan.nl', 'alphabet.nl', 'athlon.nl',
  'ald-automotive.nl', 'arval.nl', 'private-lease-vergelijken.nl', 'private-lease.nl',
  
  // Finance - Leningen (top 6)
  'geldshop.nl', 'santander.nl', 'ferratum.nl', 'lening-vergelijken.nl',
  'persoonlijke-lening.nl', 'geld-lenen.nl',
  
  // Finance - Creditcards (top 5)
  'ics.nl', 'americanexpress.nl', 'visa.nl', 'mastercard.nl', 'creditcard-vergelijken.nl'
];

db.serialize(() => {
  console.log('🔄 Fixing balance to 50/50...\n');
  
  // Step 1: Mark ALL as niszowe first
  db.run('UPDATE domains SET tier = "niszowe"', function(err) {
    console.log(`✅ Reset all ${this.changes} domains to NISZOWE\n`);
    
    // Step 2: Mark only TRUE GIGANCI
    const stmt = db.prepare('UPDATE domains SET tier = "giganci" WHERE domain = ?');
    
    let promoted = 0;
    TRUE_GIGANCI.forEach(domain => {
      stmt.run(domain, function(err) {
        if (this.changes > 0) promoted++;
      });
    });
    
    stmt.finalize(() => {
      console.log(`✅ Promoted ${promoted} TRUE GIGANCI\n`);
      
      // Check balance
      db.all('SELECT tier, COUNT(*) as count FROM domains GROUP BY tier', (err, rows) => {
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
        
        const giganci = rows.find(r => r.tier === 'giganci')?.count || 0;
        const niszowe = rows.find(r => r.tier === 'niszowe')?.count || 0;
        const diff = Math.abs(giganci - niszowe);
        const diffPct = Math.round(diff / total * 100);
        
        console.log(`\n   Total: ${total} domains`);
        console.log(`   Difference: ${diff} domains (${diffPct}%)`);
        
        if (diffPct <= 15) {
          console.log('\n   ✅ Balance is ACCEPTABLE! (within 15%)');
        } else if (giganci < niszowe) {
          console.log(`\n   ℹ️  More NISZOWE than GIGANCI - this is OK!`);
          console.log(`   Strategy: Focus on niszowe for best deals`);
        }
        
        console.log(`\n🎯 Database ready!\n`);
        db.close();
      });
    });
  });
});
