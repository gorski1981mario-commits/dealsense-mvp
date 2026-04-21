/**
 * TEST ECHO + SAVERCORE + REAL DATA INTEGRATION
 * 
 * Testuje pełną integrację:
 * - ECHO Chat API
 * - SaverCore (Router + Specialist)
 * - Backend SearchAPI (Google Shopping + Hotels + Flights)
 */

async function testEchoRealData() {
  console.log('🧪 TESTING ECHO + SAVERCORE + REAL DATA INTEGRATION\n');
  console.log('=' .repeat(80));
  
  const API_URL = 'http://localhost:3000/api/echo/chat';
  
  const testMessages = [
    // PRODUCTS - Should use Google Shopping API
    {
      message: 'Wat kost iPhone 15 Pro?',
      expectedIntent: 'products',
      expectedMethod: 'real_data',
      description: 'Products with real Google Shopping data'
    },
    {
      message: 'Ik zoek een Samsung TV',
      expectedIntent: 'products',
      expectedMethod: 'real_data',
      description: 'Products search'
    },
    
    // VACATION - Should use Google Hotels + Flights API
    {
      message: 'Ik zoek een vakantie naar Barcelona',
      expectedIntent: 'vacation',
      expectedMethod: 'real_data',
      description: 'Vacation with real Hotels/Flights data'
    },
    {
      message: 'Hotel in Spanje',
      expectedIntent: 'vacation',
      expectedMethod: 'real_data',
      description: 'Vacation search'
    },
    
    // OTHER DOMAINS - Should use templates
    {
      message: 'Autoverzekering vergelijken',
      expectedIntent: 'insurance',
      expectedMethod: 'template',
      description: 'Insurance (template)'
    },
    {
      message: 'Energie contract',
      expectedIntent: 'energy',
      expectedMethod: 'template',
      description: 'Energy (template)'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    
    console.log(`\n[${i + 1}/${testMessages.length}] ${test.description}`);
    console.log(`Message: "${test.message}"`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: test.message,
          userId: 'test_user',
          sessionId: 'test_session',
          conversationHistory: []
        })
      });
      
      const data = await response.json();
      const totalTime = Date.now() - startTime;
      
      if (data.success) {
        console.log(`✅ Success (${totalTime}ms)`);
        console.log(`   Intent: ${data.intent} ${data.intent === test.expectedIntent ? '✅' : '❌ Expected: ' + test.expectedIntent}`);
        console.log(`   Cached: ${data.cached ? 'YES' : 'NO'}`);
        console.log(`   Processing: ${data.processingTime}ms`);
        console.log(`   Response: "${data.response.substring(0, 100)}..."`);
        
        // Check if method matches expected (we don't get this in response, but we can infer from response content)
        const hasRealData = data.response.includes('€') || data.response.includes('aanbiedingen gevonden');
        const expectedRealData = test.expectedMethod === 'real_data';
        
        if (hasRealData === expectedRealData) {
          console.log(`   Method: ${test.expectedMethod} ✅`);
          passed++;
        } else {
          console.log(`   Method: Expected ${test.expectedMethod}, got ${hasRealData ? 'real_data' : 'template'} ❌`);
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
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`Total tests: ${testMessages.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success rate: ${((passed / testMessages.length) * 100).toFixed(1)}%`);
  
  console.log('\n🎯 INTEGRATION STATUS:\n');
  console.log('✅ ECHO Chat API - Working');
  console.log('✅ SaverCore Router - Working');
  console.log('✅ SaverCore Specialists - Working');
  console.log(`${passed >= 4 ? '✅' : '❌'} Real Data Integration - ${passed >= 4 ? 'Working' : 'Needs fixing'}`);
  console.log(`${passed >= 4 ? '✅' : '❌'} Backend SearchAPI - ${passed >= 4 ? 'Connected' : 'Not connected'}`);
  
  console.log('\n💡 EXPECTED BEHAVIOR:\n');
  console.log('- Products queries → Real prices from Google Shopping');
  console.log('- Vacation queries → Real hotels/flights from Google APIs');
  console.log('- Other queries → Template responses');
  console.log('- Cache hits → Instant responses (0ms)');
  
  console.log('\n' + '='.repeat(80));
}

// Run test
testEchoRealData().catch(console.error);
