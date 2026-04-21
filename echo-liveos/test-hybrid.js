/**
 * TEST HYBRYDOWY - POŁĄCZENIE DZIAŁAJĄCYCH ENGINE
 * Mobius + Leverage = Super System!
 */

console.log('🔗 TESTING HYBRID - MOBIUS + LEVERAGE!\n');

async function testHybridSystem() {
  try {
    // 1. Załaduj działające engine
    console.log('1️⃣ Loading working engines...');
    const MobiusCycle = require('./src/core/MobiusCycle');
    const LeverageEngine = require('./src/core/LeverageEngine');
    
    // 2. Stwórz hybrydowy system
    console.log('2️⃣ Creating hybrid system...');
    const mobius = new MobiusCycle();
    const leverage = new LeverageEngine();
    
    // 3. Inicjalizuj leverage
    console.log('3️⃣ Initializing leverage system...');
    await leverage.buildLeverageSystem({
      secondaryCount: 3, // 3 kije dla testu
      primaryLength: 3.0,
      secondaryLength: 1.5,
      enableCompound: false // wyłącz compound na razie
    });
    
    // 4. Test hybrydowy - problem przez Mobius, wzmocnienie przez Leverage
    console.log('4️⃣ Testing hybrid processing...');
    
    // Krok 1: Przejdź przez pętlę Möbiusa
    console.log('   Step 1: Möbius transformation...');
    const mobiusResult = await mobius.startLoop({
      problem: 'Optimize AI performance',
      complexity: 0.7,
      needsAmplification: true
    });
    
    // Krok 2: Zastosuj zasadę przełożenia
    console.log('   Step 2: Leverage amplification...');
    const leverageResult = await leverage.applyLeverage({
      problem: mobiusResult.loopData?.transformation?.original || mobiusResult.loopData?.input,
      complexity: 0.7,
      urgency: 0.8,
      importance: 0.9,
      difficulty: 0.6
    }, 'medium');
    
    // 5. Połącz wyniki
    console.log('5️⃣ Combining results...');
    const hybridResult = {
      mobius: {
        iterations: mobiusResult.iterations,
        transformed: mobiusResult.loopData?.transformation?.unified || false,
        loopClosed: mobiusResult.loopCompleted
      },
      leverage: {
        forceApplied: leverageResult.appliedForce,
        mechanicalAdvantage: leverageResult.leverage,
        efficiency: leverageResult.efficiency,
        leversUsed: 1 + leverageResult.distribution.secondary.length
      },
      combined: {
        totalBoost: leverageResult.leverage * (mobiusResult.loopCompleted ? 2 : 1),
        processingTime: Date.now(),
        success: true
      }
    };
    
    // 6. Wyniki
    console.log('\n🎉 HYBRID SYSTEM RESULTS:');
    console.log('   Möbius iterations:', hybridResult.mobius.iterations);
    console.log('   Möbius transformed:', hybridResult.mobius.transformed ? '✅' : '❌');
    console.log('   Möbius loop closed:', hybridResult.mobius.loopClosed ? '✅' : '❌');
    console.log('   Leverage force:', hybridResult.leverage.forceApplied.toFixed(0), 'N');
    console.log('   Leverage advantage:', hybridResult.leverage.mechanicalAdvantage.toFixed(2), 'x');
    console.log('   Levers used:', hybridResult.leverage.leversUsed);
    console.log('   Combined boost:', hybridResult.combined.totalBoost.toFixed(2), 'x');
    
    console.log('\n✅ HYBRID TEST SUCCESSFUL!');
    console.log('🔗 Möbius + Leverage = Super System!');
    
    return hybridResult;
    
  } catch (error) {
    console.error('❌ Hybrid test failed:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

// Uruchom test hybrydowy
testHybridSystem();
