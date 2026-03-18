// Check categories in database vs user's list
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'domains.db');
const db = new sqlite3.Database(DB_PATH);

// Categories from user's image
const USER_CATEGORIES = [
  'Elektronika',
  'Dom i ogród',
  'Moda',
  'Zdrowie i uroda',
  'Sport i fitnes',
  'Auto i akcesoria',
  'Zabawki i edukacja',
  'Media',
  'Zwierzęta',
  'Narzędzia- diy'
];

// Mapping to our database categories
const CATEGORY_MAPPING = {
  'Elektronika': ['electronics', 'appliances'],
  'Dom i ogród': ['home', 'diy'],
  'Moda': ['fashion'],
  'Zdrowie i uroda': ['beauty'],
  'Sport i fitnes': ['sports'],
  'Auto i akcesoria': [], // MISSING?
  'Zabawki i edukacja': ['baby', 'books'],
  'Media': ['books'],
  'Zwierzęta': ['pets'],
  'Narzędzia- diy': ['diy']
};

db.serialize(() => {
  db.all('SELECT category, COUNT(*) as count FROM domains WHERE active = 1 GROUP BY category ORDER BY category', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    console.log('📊 OBECNE KATEGORIE W BAZIE:\n');
    rows.forEach(r => {
      console.log(`   ${r.category}: ${r.count} domen`);
    });

    console.log('\n📋 KATEGORIE Z OBRAZKA:\n');
    
    USER_CATEGORIES.forEach(userCat => {
      const mapped = CATEGORY_MAPPING[userCat];
      
      if (!mapped || mapped.length === 0) {
        console.log(`   ❌ ${userCat}: BRAK W BAZIE!`);
      } else {
        const counts = mapped.map(dbCat => {
          const row = rows.find(r => r.category === dbCat);
          return row ? row.count : 0;
        });
        const total = counts.reduce((a, b) => a + b, 0);
        console.log(`   ✅ ${userCat}: ${total} domen (${mapped.join(', ')})`);
      }
    });

    console.log('\n⚠️  BRAKUJĄCE KATEGORIE:\n');
    
    // Auto i akcesoria
    console.log('   ❌ Auto i akcesoria - BRAK!');
    console.log('      Potrzebne domeny:');
    console.log('      - autoteile.nl, autodelen.nl, autopartsonline.nl');
    console.log('      - halfords.nl, atd.nl, motorkledingcenter.nl');
    console.log('      - bandenleader.nl, oponeo.nl, kwikfit.nl');
    console.log('      - carparts-online.nl, autodoc.nl');
    console.log('');

    db.close();
  });
});
