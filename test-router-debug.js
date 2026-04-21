/**
 * DEBUG ROUTER - Dlaczego general queries nie działają
 */

const { getSaverCore } = require('./echo-liveos/src/index.js');

async function testRouter() {
  console.log('🔍 DEBUGGING SAVERCORE ROUTER\n');
  console.log('='.repeat(60));

  const saverCore = getSaverCore();
  
  const tests = [
    'Hoe werkt DealSense?',
    'Wat is het verschil tussen PLUS en PRO pakket?',
    'Wat kost iPhone 15 Pro?',
    'Help me met strategie'
  ];

  for (const message of tests) {
    console.log(`\nMessage: "${message}"`);
    
    const routing = await saverCore.router.route(message);
    
    console.log(`  Intent: ${routing.intent}`);
    console.log(`  Confidence: ${routing.confidence}`);
    console.log(`  Method: ${routing.method}`);
  }

  console.log('\n' + '='.repeat(60));
}

testRouter().catch(console.error);
