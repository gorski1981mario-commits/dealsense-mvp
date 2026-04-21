/**
 * Test KWANT Backend Endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testHealth() {
  console.log('\n🔍 Testing /health...');
  const res = await axios.get(`${BASE_URL}/health`);
  console.log('✅ Health:', res.data);
}

async function testStatus() {
  console.log('\n🔍 Testing /api/status...');
  const res = await axios.get(`${BASE_URL}/api/status`);
  console.log('✅ Status:', res.data);
}

async function testTop3() {
  console.log('\n🔍 Testing /api/top3...');
  const res = await axios.post(`${BASE_URL}/api/top3`, {
    product_name: 'iPhone 15 Pro',
    base_price: 1199,
    ean: null
  });
  console.log('✅ TOP3 Result:');
  console.log('   Product:', res.data.product_name);
  console.log('   Base Price:', res.data.base_price);
  console.log('   Offers Found:', res.data.result?.top3?.length || 0);
  if (res.data.result?.top3?.length > 0) {
    console.log('   Best Offer:', res.data.result.top3[0]);
  }
}

async function testMarket() {
  console.log('\n🔍 Testing /api/market...');
  const res = await axios.post(`${BASE_URL}/api/market`, {
    product_name: 'Samsung Galaxy S24',
    ean: null
  });
  console.log('✅ Market Result:');
  console.log('   Product:', res.data.product_name);
  console.log('   Offers Count:', res.data.count);
}

async function testScan() {
  console.log('\n🔍 Testing /api/scan...');
  const res = await axios.post(`${BASE_URL}/api/scan`, {
    url: 'https://www.bol.com/nl/p/iphone-15-pro/123456',
    price: 1199,
    product_name: 'iPhone 15 Pro',
    packageType: 'pro'
  });
  console.log('✅ Scan Result:');
  console.log('   Package:', res.data.packageType);
  console.log('   Max Offers:', res.data.maxOffers);
  console.log('   Rate Limit Remaining:', res.data.rateLimitRemaining);
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 KWANT BACKEND TESTS');
  console.log('='.repeat(60));

  try {
    await testHealth();
    await testStatus();
    await testTop3();
    await testMarket();
    await testScan();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

runTests();
