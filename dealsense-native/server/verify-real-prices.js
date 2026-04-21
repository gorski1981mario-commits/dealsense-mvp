const https = require('https');

const RENDER_URL = 'https://dealsense-aplikacja.onrender.com';

function makeRequest(path, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, RENDER_URL);
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (postData) req.write(postData);
    req.end();
  });
}

async function verifyRealPrices() {
  console.log('='.repeat(70));
  console.log('WERYFIKACJA: Czy ceny z Google Shopping API są PRAWDZIWE?');
  console.log('='.repeat(70));
  
  const response = await makeRequest('/api/search', 'POST', {
    query: 'iPhone 15 Pro 256GB',
    basePrice: 1329
  });
  
  if (response.status === 200) {
    const result = response.data;
    
    console.log(`\nProdukt: iPhone 15 Pro 256GB`);
    console.log(`Base Price: €${result.basePrice}`);
    console.log(`Total Offers z Google Shopping: ${result.totalOffers}`);
    console.log(`Filtered Offers (po filtrach): ${result.filteredOffers}`);
    
    if (result.topOffers && result.topOffers.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('TOP 3 OFERTY (po filtrach):');
      console.log('='.repeat(70));
      
      result.topOffers.forEach((offer, idx) => {
        console.log(`\n${idx + 1}. ${offer.store || 'Unknown'}`);
        console.log(`   Cena: €${offer.price}`);
        console.log(`   Rating: ${offer.rating}★`);
        console.log(`   Reviews: ${offer.reviews}`);
        console.log(`   Oszczędność: €${(result.basePrice - offer.price).toFixed(2)} (${(((result.basePrice - offer.price) / result.basePrice) * 100).toFixed(1)}%)`);
        if (offer.link) {
          console.log(`   Link: ${offer.link}`);
        }
      });
      
      console.log('\n' + '='.repeat(70));
      console.log('⚠️ PROBLEM ZIDENTYFIKOWANY:');
      console.log('='.repeat(70));
      console.log('\nStore = "Unknown" - Google Shopping API NIE ZWRACA nazw sklepów!');
      console.log('To oznacza że:');
      console.log('1. API zwraca dane ale bez pełnych informacji o sklepie');
      console.log('2. Ceny mogą być z różnych krajów (nie tylko NL)');
      console.log('3. Brak możliwości weryfikacji czy to prawdziwe sklepy NL');
      
      console.log('\n💡 ROZWIĄZANIE:');
      console.log('Musimy sprawdzić RAW response z Google Shopping API');
      console.log('i zobaczyć co faktycznie zwraca SearchAPI.');
      
    } else {
      console.log('\n⚠️ Brak ofert po filtrach!');
    }
    
  } else {
    console.log(`\n❌ Error: ${response.status}`);
    console.log(response.data);
  }
}

verifyRealPrices().catch(console.error);
