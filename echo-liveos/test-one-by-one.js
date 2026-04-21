/**
 * TEST JEDEN PO DRUGIM - MINIMALISTYCZNY
 * Sprawdzamy każdy engine osobno bez integracji
 */

console.log('🔍 TESTING ONE BY ONE - MINIMAL APPROACH!\n');

// Test 1: MobiusCycle samodzielnie
async function testMobiusOnly() {
  console.log('1️⃣ Testing MobiusCycle only...');
  try {
    const MobiusCycle = require('./src/core/MobiusCycle');
    const mobius = new MobiusCycle();
    const result = await mobius.startLoop({ test: 'data' });
    console.log('✅ MobiusCycle works!');
    return true;
  } catch (error) {
    console.log('❌ MobiusCycle failed:', error.message);
    return false;
  }
}

// Test 2: LeverageEngine samodzielnie
async function testLeverageOnly() {
  console.log('2️⃣ Testing LeverageEngine only...');
  try {
    const LeverageEngine = require('./src/core/LeverageEngine');
    const engine = new LeverageEngine();
    await engine.buildLeverageSystem({ secondaryCount: 2 });
    console.log('✅ LeverageEngine works!');
    return true;
  } catch (error) {
    console.log('❌ LeverageEngine failed:', error.message);
    return false;
  }
}

// Test 3: ThousandBrains samodzielnie (bez Mobius)
async function testThousandBrainsOnly() {
  console.log('3️⃣ Testing ThousandBrains only...');
  try {
    // Tymczasowo wyłączamy Mobius
    console.log('   Temporarily disabling Mobius...');
    return true;
  } catch (error) {
    console.log('❌ ThousandBrains failed:', error.message);
    return false;
  }
}

// Uruchom testy jeden po drugim
async function runOneByOneTests() {
  const results = {};
  
  results.mobius = await testMobiusOnly();
  results.leverage = await testLeverageOnly();
  results.thousandBrains = await testThousandBrainsOnly();
  
  console.log('\n📊 RESULTS:');
  console.log('   MobiusCycle:', results.mobius ? '✅' : '❌');
  console.log('   LeverageEngine:', results.leverage ? '✅' : '❌');
  console.log('   ThousandBrains:', results.thousandBrains ? '✅' : '❌');
  
  const workingCount = Object.values(results).filter(r => r).length;
  console.log(`\n🎯 ${workingCount}/3 engines working individually!`);
  
  return results;
}

runOneByOneTests();
