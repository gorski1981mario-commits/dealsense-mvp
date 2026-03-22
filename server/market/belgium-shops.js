/**
 * BELGIUM SHOPS MODULE
 * 
 * Lista sklepów belgijskich (.be) - 100+ sklepów
 * Cel: Rozszerzyć coverage poza NL gigantów (bol.com, Amazon.nl)
 * 
 * UNFAIR ADVANTAGE: Belgia często ma tańsze ceny niż Holandia!
 */

/**
 * TOP 100 SKLEPÓW BELGIJSKICH (.be)
 * Kategoryzowane per sektor
 */
const BELGIUM_SHOPS = {
  // GIGANCI BELGIJSCY (20)
  giants: [
    'bol.com/be',           // Bol.com Belgia
    'coolblue.be',          // Coolblue Belgia
    'mediamarkt.be',        // MediaMarkt Belgia
    'vanden borre',         // Vanden Borre (największy elektro BE)
    'vandenborre',
    'krefel',               // Krefel (elektro BE)
    'collishop',            // Collishop (online BE)
    'dreamland',            // Dreamland (zabawki BE)
    'fnac.be',              // FNAC Belgia
    'carrefour.be',         // Carrefour Belgia
    'delhaize',             // Delhaize (supermarket BE)
    'colruyt',              // Colruyt (supermarket BE)
    'makro.be',             // Makro Belgia
    'torfs',                // Torfs (obuwie BE)
    'jbc',                  // JBC (moda BE)
    'as adventure',         // AS Adventure (outdoor BE)
    'decathlon.be',         // Decathlon Belgia
    'brico',                // Brico (DIY BE)
    'hubo.be',              // Hubo Belgia
    'gamma.be'              // Gamma Belgia
  ],

  // ELEKTRONIKA & TECH (20)
  electronics: [
    'alternate.be',         // Alternate Belgia
    'azerty.be',            // Azerty Belgia
    'tones.be',             // Tones (audio BE)
    'hifi corner',          // Hifi Corner
    'hificorner',
    'pixmania.be',          // Pixmania Belgia
    'computerstore.be',     // Computer Store BE
    'bytes.be',             // Bytes Belgia
    'paradigit.be',         // Paradigit Belgia
    'informatique.be',      // Informatique Belgia
    'centralpoint.be',      // Centralpoint Belgia
    'mycom.be',             // Mycom Belgia
    'allekabels.be',        // Allekabels Belgia
    'kabelshop.be',         // Kabelshop Belgia
    'elektro world',        // Elektro World BE
    'elektroworld',
    'eldi',                 // Eldi (elektro BE)
    'vandenborre.be',       // Vanden Borre online
    'krefel.be',            // Krefel online
    'euronics.be',          // Euronics Belgia
    'expert.be'             // Expert Belgia
  ],

  // GSM & TELECOM (15)
  telecom: [
    'proximus',             // Proximus (operator BE)
    'base.be',              // Base (operator BE)
    'orange.be',            // Orange Belgia
    'mobile vikings',       // Mobile Vikings
    'mobilevikings',
    'scarlet',              // Scarlet (telecom BE)
    'gsm shop',             // GSM Shop BE
    'gsmshop',
    'gsm4you',              // GSM4You
    'mobistar',             // Mobistar (stary Base)
    'telenet',              // Telenet
    'voo.be',               // VOO (telecom BE)
    'edpnet',               // EDPnet
    'hey!',                 // Hey! (telecom BE)
    'mobile.be'             // Mobile.be
  ],

  // MODA & LIFESTYLE (15)
  fashion: [
    'zalando.be',           // Zalando Belgia
    'about you.be',         // About You Belgia
    'jbc.be',               // JBC online
    'e5 mode',              // E5 Mode
    'e5mode',
    'zeb',                  // ZEB (moda BE)
    'bristol',              // Bristol (obuwie BE)
    'torfs.be',             // Torfs online
    'schoenen torfs',       // Schoenen Torfs
    'schoentorfs',
    'maniet luxus',         // Maniet Luxus
    'manietluxus',
    'essentiel antwerp',    // Essentiel Antwerp
    'essentielantwerp',
    'mayerline',            // Mayerline
    'didi',                 // Didi (moda BE)
    'pointcarré'            // Pointcarré
  ],

  // SPORT & OUTDOOR (10)
  sport: [
    'as adventure.be',      // AS Adventure online
    'asadventure',
    'decathlon.be',         // Decathlon Belgia
    'sport 2000',           // Sport 2000 BE
    'sport2000',
    'intersport.be',        // Intersport Belgia
    'aktiesport.be',        // Aktiesport Belgia
    'a.s.adventure',        // AS Adventure (variant)
    'bike store',           // Bike Store BE
    'bikestore',
    'fietsen',              // Fietsen BE
    'mantel.be'             // Mantel Belgia
  ],

  // DOM & OGRÓD (10)
  home: [
    'brico.be',             // Brico online
    'hubo.be',              // Hubo online
    'gamma.be',             // Gamma Belgia
    'bouwcenter',           // Bouwcenter BE
    'aveve',                // Aveve (tuin BE)
    'tuincentrum',          // Tuincentrum BE
    'intratuin.be',         // Intratuin Belgia
    'casa',                 // Casa (dom BE)
    'kwantum.be',           // Kwantum Belgia
    'ikea.be'               // IKEA Belgia (tylko dla completeness)
  ],

  // BEAUTY & HEALTH (10)
  beauty: [
    'di',                   // Di (drogeria BE)
    'kruidvat.be',          // Kruidvat Belgia
    'ici paris xl.be',      // ICI Paris XL Belgia
    'iciparisxl.be',
    'douglas.be',           // Douglas Belgia
    'planet parfum',        // Planet Parfum BE
    'planetparfum',
    'parfuma',              // Parfuma BE
    'newpharma',            // Newpharma (apteka online BE)
    'farmaline',            // Farmaline (apteka BE)
    'viata'                 // Viata (zdrowie BE)
  ]
};

/**
 * Zwraca pełną listę sklepów belgijskich (flat array)
 */
function getAllBelgiumShops() {
  const allShops = [];
  
  Object.values(BELGIUM_SHOPS).forEach(category => {
    allShops.push(...category);
  });
  
  return allShops;
}

/**
 * Sprawdza czy sklep jest belgijski
 */
function isBelgiumShop(seller, url) {
  const sellerLower = (seller || '').toLowerCase();
  const urlLower = (url || '').toLowerCase();
  
  // Sprawdź .be domenę
  if (urlLower.includes('.be') || sellerLower.includes('.be')) {
    return true;
  }
  
  // Sprawdź whitelist
  const allShops = getAllBelgiumShops();
  return allShops.some(shop => 
    sellerLower.includes(shop) || urlLower.includes(shop)
  );
}

/**
 * Zwraca statystyki
 */
function getBelgiumShopsStats() {
  const stats = {};
  let total = 0;
  
  Object.entries(BELGIUM_SHOPS).forEach(([category, shops]) => {
    stats[category] = shops.length;
    total += shops.length;
  });
  
  stats.total = total;
  return stats;
}

module.exports = {
  BELGIUM_SHOPS,
  getAllBelgiumShops,
  isBelgiumShop,
  getBelgiumShopsStats
};
