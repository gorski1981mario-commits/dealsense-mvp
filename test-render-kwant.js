/**
 * Test KWANT Backend na Render
 */

const axios = require('axios');

const BASE_URL = 'https://dealsense-aplikacja.onrender.com';

async function testTop3() {
  console.log('\n🔍 Testing /api/top3 (KWANT Engine)...');
  try {
    const res = await axios.post(`${BASE_URL}/api/top3`, {
      product_name: 'iPhone 15 Pro',
      base_price: 1199,
      ean: null
    }, {
      timeout: 30000 // 30s timeout
    });
    
    console.log('✅ TOP3 Result:');
    console.log('   Product:', res.data.product_name);
    console.log('   Base Price:', res.data.base_price);
    console.log('   Success:', res.data.success);
    
    if (res.data.result) {
      console.log('   Result:', JSON.stringify(res.data.result, null, 2));
    }
  } catch (error) {
    console.error('❌ TOP3 FAILED:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

async function testMarket() {
  console.log('\n🔍 Testing /api/market (Market API)...');
  try {
    const res = await axios.post(`${BASE_URL}/api/market`, {
      product_name: 'Samsung Galaxy S24',
      ean: null
    }, {
      timeout: 30000
    });
    
    console.log('✅ Market Result:');
    console.log('   Product:', res.data.product_name);
    console.log('   Offers Count:', res.data.count);
    console.log('   Success:', res.data.success);
  } catch (error) {
    console.error('❌ Market FAILED:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 KWANT BACKEND TESTS - RENDER PRODUCTION');
  console.log('='.repeat(60));
  console.log('URL:', BASE_URL);

  await testTop3();
  await testMarket();

  console.log('\n' + '='.repeat(60));
  console.log('✅ TESTS COMPLETE');
  console.log('='.repeat(60));
}

runTests();
