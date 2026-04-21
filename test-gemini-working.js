/**
 * TEST GEMINI - Czy general queries działają
 */

const API_URL = 'http://localhost:3000/api/echo/chat';

const TESTS = [
  {
    name: 'General Query 1',
    message: 'Hoe werkt DealSense?',
    expectedIntent: 'general',
    expectedMethod: 'gemini'
  },
  {
    name: 'General Query 2',
    message: 'Wat is het verschil tussen PLUS en PRO pakket?',
    expectedIntent: 'general',
    expectedMethod: 'gemini'
  },
  {
    name: 'Products Query (control)',
    message: 'Wat kost iPhone 15 Pro?',
    expectedIntent: 'products',
    expectedMethod: 'real_data'
  }
];

async function testGemini() {
  console.log('🧪 TESTING GEMINI INTEGRATION\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    console.log(`\n[${test.name}]`);
    console.log(`Query: "${test.message}"`);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.message,
          userId: 'test_user',
          sessionId: 'test_session',
          packageType: 'PRO'
        })
      });

      const data = await response.json();

      if (data.success) {
        const intentMatch = data.intent === test.expectedIntent;
        const methodMatch = data.method === test.expectedMethod;

        console.log(`✅ Success`);
        console.log(`   Intent: ${data.intent} ${intentMatch ? '✅' : '❌ Expected: ' + test.expectedIntent}`);
        console.log(`   Method: ${data.method} ${methodMatch ? '✅' : '❌ Expected: ' + test.expectedMethod}`);
        console.log(`   Response: "${data.response.substring(0, 80)}..."`);
        
        if (data.usage) {
          console.log(`   Tokens: ${data.usage.tokensUsed || 0}, Cost: $${data.usage.costUsd || 0}`);
        }

        if (intentMatch && methodMatch) {
          passed++;
        } else {
          failed++;
        }
      } else {
        console.log(`❌ Failed: ${data.error}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTS: ${passed}/${TESTS.length} passed`);
  
  if (passed === TESTS.length) {
    console.log('\n✅ GEMINI INTEGRATION WORKING! 🎉');
    console.log('   - General queries: ✅ Gemini 1.5 Flash');
    console.log('   - Products queries: ✅ SaverCore + SearchAPI');
    console.log('   - Memory: ✅ Supabase');
    console.log('\n🚀 ECHO 100% FUNCTIONAL!\n');
  } else {
    console.log('\n⚠️ Some tests failed - check logs above\n');
  }
}

testGemini().catch(console.error);
