const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const axios = require("axios");

/**
 * TEST: CZY GOOGLE SHOPPING PAKIETY MAJĄ PEŁNE INFORMACJE?
 * 
 * Sprawdzamy:
 * 1. Nazwa hotelu - czy jest w title?
 * 2. Dokładna cena - czy jest?
 * 3. Seller (biuro podróży) - kto sprzedaje?
 * 4. Link do zakupu - czy możemy przekierować?
 * 5. Szczegóły (all inclusive, daty, etc.)
 */

async function testPackageDetails() {
  const apiKey = 'TxZ91oHM53qcbiMvcWpD8vVQ';
  
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║     TEST: GOOGLE SHOPPING PAKIETY - PEŁNE INFORMACJE                      ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Różne queries - szukamy pakietów
  const queries = [
    'Turkije vakantie all inclusive 7 dagen 2 personen',
    'Antalya all inclusive pakket',
    'Turkije reis all inclusive TUI',
    'Turkije vakantie all inclusive Corendon',
    'Antalya hotel all inclusive 7 dagen vlucht'
  ];
  
  let allPackages = [];
  
  for (const query of queries) {
    console.log(`🔍 Query: "${query}"`);
    console.log('');
    
    try {
      const params = {
        engine: 'google_shopping',
        q: query,
        gl: 'nl',
        hl: 'nl',
        num: 30,
        api_key: apiKey
      };
      
      const response = await axios.get('https://www.searchapi.io/api/v1/search', {
        params,
        timeout: 30000
      });
      
      const results = response.data.shopping_results || [];
      
      // Filter only vacation packages
      const packages = results.filter(item => {
        const title = (item.title || '').toLowerCase();
        const price = item.extracted_price || 0;
        
        const isPackage = (title.includes('vakantie') || title.includes('reis')) &&
                         price >= 300 && price <= 5000;
        
        return isPackage;
      });
      
      if (packages.length > 0) {
        console.log(`✅ Znaleziono ${packages.length} pakietów`);
        allPackages.push(...packages);
      } else {
        console.log(`❌ Brak pakietów`);
      }
      console.log('');
      
      // Wait before next query
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('');
    }
  }
  
  if (allPackages.length === 0) {
    console.log('❌ NIE ZNALEZIONO ŻADNYCH PAKIETÓW!');
    return;
  }
  
  console.log('═'.repeat(80));
  console.log('');
  console.log(`📦 ZNALEZIONO ${allPackages.length} PAKIETÓW WAKACYJNYCH`);
  console.log('');
  console.log('ANALIZA PEŁNYCH INFORMACJI:');
  console.log('');
  
  // Analyze first 5 packages
  allPackages.slice(0, 5).forEach((pkg, i) => {
    console.log(`${i + 1}. PAKIET:`);
    console.log('═'.repeat(80));
    
    // Title
    console.log(`📝 TITLE: ${pkg.title}`);
    
    // Price
    console.log(`💰 CENA: €${pkg.extracted_price || pkg.price || 'BRAK'}`);
    
    // Seller
    console.log(`🏢 SELLER: ${pkg.seller || 'BRAK'}`);
    
    // Link
    console.log(`🔗 LINK: ${pkg.product_link || pkg.link || 'BRAK'}`);
    
    // Extract hotel name from title
    const title = pkg.title || '';
    const hotelMatch = title.match(/hotel\s+([A-Z][a-zA-Z\s]+)/i);
    const hotelName = hotelMatch ? hotelMatch[1].trim() : 'NIE ZNALEZIONO';
    console.log(`🏨 HOTEL (extracted): ${hotelName}`);
    
    // Check what info we have
    console.log('');
    console.log('✅ CO MAMY:');
    if (pkg.extracted_price) console.log('   ✅ Dokładna cena');
    if (pkg.seller) console.log('   ✅ Sprzedawca (biuro podróży)');
    if (pkg.product_link) console.log('   ✅ Link do zakupu');
    if (hotelName !== 'NIE ZNALEZIONO') console.log('   ✅ Nazwa hotelu (w title)');
    
    console.log('');
    console.log('❌ CZEGO BRAKUJE:');
    if (!pkg.extracted_price) console.log('   ❌ Cena');
    if (!pkg.seller) console.log('   ❌ Sprzedawca');
    if (!pkg.product_link) console.log('   ❌ Link');
    if (hotelName === 'NIE ZNALEZIONO') console.log('   ❌ Nazwa hotelu');
    
    console.log('');
    console.log('🔍 FULL OBJECT:');
    console.log(JSON.stringify(pkg, null, 2));
    console.log('');
    console.log('═'.repeat(80));
    console.log('');
  });
  
  // Statistics
  const withPrice = allPackages.filter(p => p.extracted_price).length;
  const withSeller = allPackages.filter(p => p.seller).length;
  const withLink = allPackages.filter(p => p.product_link).length;
  
  console.log('📊 STATYSTYKI:');
  console.log(`   Total pakietów: ${allPackages.length}`);
  console.log(`   Z ceną: ${withPrice} (${Math.round(withPrice/allPackages.length*100)}%)`);
  console.log(`   Z sellerem: ${withSeller} (${Math.round(withSeller/allPackages.length*100)}%)`);
  console.log(`   Z linkiem: ${withLink} (${Math.round(withLink/allPackages.length*100)}%)`);
  console.log('');
  
  // Conclusion
  if (withPrice === allPackages.length && withSeller === allPackages.length && withLink === allPackages.length) {
    console.log('🎉 SUKCES! Wszystkie pakiety mają pełne informacje!');
    console.log('✅ Możemy użyć Google Shopping jako główne źródło!');
  } else {
    console.log('⚠️  PROBLEM: Nie wszystkie pakiety mają pełne informacje');
    console.log(`   Brakuje cen: ${allPackages.length - withPrice}`);
    console.log(`   Brakuje sellerów: ${allPackages.length - withSeller}`);
    console.log(`   Brakuje linków: ${allPackages.length - withLink}`);
  }
}

testPackageDetails().catch(console.error);
