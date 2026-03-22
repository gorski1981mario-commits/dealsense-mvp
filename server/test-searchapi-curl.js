"use strict";

/**
 * TEST SearchAPI z dokładnie tym samym requestem co w dokumentacji
 */

require('dotenv').config({ path: '.env.test' });
const axios = require('axios');

const API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

console.log('\n🔑 API Key:', API_KEY);
console.log('\n📡 Test 1: Query params (jak w naszym kodzie)');

async function testQueryParams() {
  try {
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        api_key: API_KEY,
        engine: 'google_shopping',
        q: 'iPhone 15',
        gl: 'nl',
        hl: 'nl'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCCESS with query params!');
    console.log('Status:', response.status);
    console.log('Results:', response.data.shopping_results?.length || 0);
    return true;
  } catch (error) {
    console.log('❌ FAILED with query params');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    return false;
  }
}

console.log('\n📡 Test 2: Bearer token (jak w dokumentacji)');

async function testBearerToken() {
  try {
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        engine: 'google_shopping',
        q: 'iPhone 15',
        gl: 'nl',
        hl: 'nl'
      },
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCCESS with Bearer token!');
    console.log('Status:', response.status);
    console.log('Results:', response.data.shopping_results?.length || 0);
    return true;
  } catch (error) {
    console.log('❌ FAILED with Bearer token');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    return false;
  }
}

async function runTests() {
  const test1 = await testQueryParams();
  console.log('\n---\n');
  const test2 = await testBearerToken();
  
  console.log('\n📊 WYNIKI:');
  console.log('Query params:', test1 ? '✅' : '❌');
  console.log('Bearer token:', test2 ? '✅' : '❌');
  
  if (!test1 && !test2) {
    console.log('\n❌ PROBLEM: Klucz API nie działa w żadnej metodzie!');
    console.log('Sprawdź:');
    console.log('1. Czy klucz jest aktywny na SearchAPI.io');
    console.log('2. Czy masz aktywną subskrypcję');
    console.log('3. Czy nie przekroczyłeś limitu zapytań');
  }
}

runTests();
