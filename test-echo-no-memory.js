/**
 * ECHO TEST - BEZ MEMORY (tylko SaverCore routing)
 * 
 * Testuje:
 * 1. Products queries (routing do 'products')
 * 2. Vacation queries (routing do 'vacation')
 * 3. General queries (routing do 'general')
 * 4. Other domains (insurance, energy, telecom)
 */

const API_URL = 'http://localhost:3000/api/echo/chat';

const TEST_SCENARIOS = [
  // PRODUCTS
  {
    category: 'PRODUCTS',
    message: 'Wat kost iPhone 15 Pro?',
    expectedIntent: 'products'
  },
  {
    category: 'PRODUCTS',
    message: 'Samsung TV 55 inch prijs',
    expectedIntent: 'products'
  },
  
  // VACATION
  {
    category: 'VACATION',
    message: 'Vakantie naar Barcelona',
    expectedIntent: 'vacation'
  },
  {
    category: 'VACATION',
    message: 'Hotel in Griekenland',
    expectedIntent: 'vacation'
  },
  
  // GENERAL
  {
    category: 'GENERAL',
    message: 'Hoe werkt DealSense?',
    expectedIntent: 'general'
  },
  {
    category: 'GENERAL',
    message: 'Help me met strategie',
    expectedIntent: 'general'
  },
  
  // OTHER
  {
    category: 'INSURANCE',
    message: 'Autoverzekering vergelijken',
    expectedIntent: 'insurance'
  },
  {
    category: 'ENERGY',
    message: 'Energie contract',
    expectedIntent: 'energy'
  }
];

async function testScenario(scenario, index, total) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${index + 1}/${total}] ${scenario.category}: ${scenario.message}`);
  console.log(`${'='.repeat(60)}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: scenario.message,
        userId: 'test_user',
        sessionId: 'test_session',
        packageType: 'PRO'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ SUCCESS`);
      console.log(`   Intent: ${data.intent} ${data.intent === scenario.expectedIntent ? '✅' : '❌ Expected: ' + scenario.expectedIntent}`);
      console.log(`   Method: ${data.method || 'N/A'}`);
      console.log(`   Response: "${data.response.substring(0, 100)}..."`);
      
      return {
        success: true,
        intentMatch: data.intent === scenario.expectedIntent
      };
    } else {
      console.log(`❌ FAILED: ${data.error}`);
      console.log(`   ${data.errorMessage || ''}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false };
  }
}

async function runTests() {
  console.log('\n🧪 ECHO TEST - BEZ MEMORY (SaverCore Routing)');
  console.log('='.repeat(60));

  const results = {
    total: TEST_SCENARIOS.length,
    passed: 0,
    failed: 0,
    intentMatches: 0
  };

  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const result = await testScenario(TEST_SCENARIOS[i], i, TEST_SCENARIOS.length);
    
    if (result.success) {
      results.passed++;
      if (result.intentMatch) results.intentMatches++;
    } else {
      results.failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Intent matches: ${results.intentMatches}/${results.total} (${((results.intentMatches / results.total) * 100).toFixed(1)}%)`);
  
  if (results.passed >= results.total * 0.8) {
    console.log(`\n✅ ECHO ROUTING: DZIAŁA!`);
  } else {
    console.log(`\n❌ ECHO ROUTING: NEEDS FIXES`);
  }
  
  console.log(`${'='.repeat(60)}\n`);
}

runTests().catch(console.error);
