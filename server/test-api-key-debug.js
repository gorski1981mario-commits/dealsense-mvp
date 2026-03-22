"use strict";

/**
 * DEBUG: Sprawdzamy dokładnie jaki klucz API jest ładowany i wysyłany
 */

// Load .env.test
const fs = require('fs');
const path = require('path');
const envTestPath = path.join(__dirname, '.env.test');

console.log('\n🔍 DEBUG: Ładowanie klucza API\n');
console.log('1. Ścieżka .env.test:', envTestPath);
console.log('2. Plik istnieje?', fs.existsSync(envTestPath));

if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath });
  console.log('3. Załadowano .env.test');
} else {
  require('dotenv').config();
  console.log('3. Załadowano .env (domyślny)');
}

console.log('\n4. Klucz z process.env:');
const key = process.env.GOOGLE_SHOPPING_API_KEY;
console.log('   Długość:', key ? key.length : 0);
console.log('   Pierwsze 10 znaków:', key ? key.substring(0, 10) : 'BRAK');
console.log('   Ostatnie 10 znaków:', key ? key.substring(key.length - 10) : 'BRAK');
console.log('   Pełny klucz:', key);

console.log('\n5. Sprawdzenie market-api.js:');
const marketApi = require('./market-api');
// market-api.js ładuje klucz przy inicjalizacji modułu

console.log('\n6. Test bezpośredniego requesta do SearchAPI:');

const axios = require('axios');

async function testDirect() {
  try {
    console.log('\n   Wysyłam request z kluczem:', key);
    
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        api_key: key,
        engine: 'google_shopping',
        q: 'test',
        gl: 'nl',
        hl: 'nl'
      },
      timeout: 10000
    });
    
    console.log('\n✅ SUCCESS!');
    console.log('   Status:', response.status);
    console.log('   Results:', response.data.shopping_results?.length || 0);
    
  } catch (error) {
    console.log('\n❌ FAILED!');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
    console.log('   Message:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 ANALIZA BŁĘDU 401:');
      console.log('   - Klucz który wysłaliśmy:', key);
      console.log('   - Długość klucza:', key?.length);
      console.log('   - Czy klucz ma spacje?', key?.includes(' '));
      console.log('   - Czy klucz ma \n?', key?.includes('\n'));
      console.log('   - Czy klucz ma \r?', key?.includes('\r'));
    }
  }
}

testDirect();
