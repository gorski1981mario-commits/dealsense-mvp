"use strict";

/**
 * TEST BEZPOŚREDNI SearchAPI.io
 * Sprawdzamy czy klucz API działa
 */

require('dotenv').config({ path: '.env.test' });
const axios = require('axios');

const API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

console.log('\n🔑 GOOGLE_SHOPPING_API_KEY:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'BRAK!');
console.log('\n📡 Testujemy SearchAPI.io...\n');

async function testSearchAPI() {
  try {
    const url = 'https://www.searchapi.io/api/v1/search';
    const params = {
      engine: 'google_shopping',
      q: 'iPhone 15 Pro',
      api_key: API_KEY,
      gl: 'nl',
      hl: 'nl',
      num: 10
    };
    
    console.log('URL:', url);
    console.log('Params:', { ...params, api_key: '***' });
    console.log('\n⏳ Wysyłam request...\n');
    
    const response = await axios.get(url, { params, timeout: 30000 });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Shopping results:', response.data.shopping_results?.length || 0);
    
    if (response.data.shopping_results && response.data.shopping_results.length > 0) {
      console.log('\n📦 PRZYKŁADOWE OFERTY:');
      response.data.shopping_results.slice(0, 5).forEach((item, i) => {
        console.log(`${i + 1}. ${item.title} - ${item.price} (${item.source})`);
      });
    }
    
    console.log('\n✅ SearchAPI działa poprawnie!');
    
  } catch (error) {
    console.error('\n❌ BŁĄD SearchAPI:');
    console.error('Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n⚠️  PROBLEM: Nieprawidłowy klucz API!');
        console.error('Sprawdź klucz na: https://www.searchapi.io/dashboard');
      } else if (error.response.status === 429) {
        console.error('\n⚠️  PROBLEM: Rate limit exceeded!');
        console.error('Poczekaj chwilę lub zwiększ limit na: https://www.searchapi.io/dashboard');
      } else if (error.response.status === 402) {
        console.error('\n⚠️  PROBLEM: Brak kredytów!');
        console.error('Doładuj konto na: https://www.searchapi.io/dashboard');
      }
    }
  }
}

testSearchAPI();
