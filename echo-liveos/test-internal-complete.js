/**
 * KOMPLEKSOWY TEST WEWNĘTRZNY ECHO LiveOS 2.0
 * 
 * Testuje WSZYSTKIE moduły i ich integrację
 * 
 * Uruchom: node test-internal-complete.js
 */

const EchoLiveOS = require('./src/EchoLiveOS');

// Kolory dla konsoli
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function testInternalComplete() {
  log('\n' + '='.repeat(70), 'cyan');
  log('🧪 ECHO LiveOS 2.0 - KOMPLEKSOWY TEST WEWNĘTRZNY', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // ===== TEST 1: INICJALIZACJA =====
    log('\n📦 TEST 1: Inicjalizacja systemu', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    const echo = new EchoLiveOS({
      quantumMode: true,
      ethicalMode: 'strict',
      learningMode: 'continuous'
    });
    
    if (echo) {
      log('✅ PASS: EchoLiveOS instance created', 'green');
      results.passed++;
    } else {
      throw new Error('Failed to create EchoLiveOS instance');
    }
    
    // ===== TEST 2: STARTUP =====
    log('\n🚀 TEST 2: System startup', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    const startupResult = await echo.startup();
    
    if (startupResult && startupResult.success) {
      log('✅ PASS: System startup successful', 'green');
      results.passed++;
    } else {
      throw new Error('System startup failed');
    }
    
    // ===== TEST 3: ETHICS CORE =====
    log('\n🛡️ TEST 3: Ethics Core', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.ethicsCore) {
      // Test ethical decision
      const ethicalTest = await echo.ethicsCore.validateDecision({
        type: 'test_decision',
        description: 'Test ethical validation'
      });
      
      if (ethicalTest && ethicalTest.approved !== undefined) {
        log('✅ PASS: Ethics Core working', 'green');
        log(`   Ethical score: ${ethicalTest.ethicalScore?.toFixed(2) || 'N/A'}`);
        results.passed++;
      } else {
        throw new Error('Ethics Core validation failed');
      }
    } else {
      throw new Error('Ethics Core not initialized');
    }
    
    // ===== TEST 4: INTELLIGENCE LIMITER =====
    log('\n⚠️ TEST 4: Intelligence Limiter', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.ethicsCore && echo.ethicsCore.intelligenceLimiter) {
      const limiter = echo.ethicsCore.intelligenceLimiter;
      
      if (limiter.maxIntelligenceLevel === 0.95) {
        log('✅ PASS: Intelligence Limiter configured', 'green');
        log(`   Max level: ${limiter.maxIntelligenceLevel * 100}%`);
        log(`   Warning threshold: ${limiter.warningThreshold * 100}%`);
        results.passed++;
      } else {
        throw new Error('Intelligence Limiter not configured');
      }
    } else {
      throw new Error('Intelligence Limiter not found');
    }
    
    // ===== TEST 5: ORKIESTRATOR =====
    log('\n🎼 TEST 5: Orkiestrator', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.orchestrator) {
      const status = echo.orchestrator.getStatus();
      
      if (status && status.active) {
        log('✅ PASS: Orkiestrator active', 'green');
        log(`   Modules loaded: ${Object.keys(status.modules || {}).length}`);
        results.passed++;
      } else {
        throw new Error('Orkiestrator not active');
      }
    } else {
      throw new Error('Orkiestrator not initialized');
    }
    
    // ===== TEST 6: DWIE PÓŁKULE =====
    log('\n🧠 TEST 6: Dwie Półkule Mózgu', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.leftHemisphere && echo.rightHemisphere && echo.corpusCallosum) {
      log('✅ PASS: Brain Hemispheres initialized', 'green');
      log(`   Left Hemisphere: ${echo.leftHemisphere.type}`);
      log(`   Right Hemisphere: ${echo.rightHemisphere.type}`);
      results.passed++;
    } else {
      throw new Error('Brain Hemispheres not initialized');
    }
    
    // ===== TEST 7: RUBIK CUBE =====
    log('\n🎲 TEST 7: Rubik Cube Engine', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.rubikCubeEngine && echo.rubikCubeEngine.cube) {
      const cube = echo.rubikCubeEngine.cube;
      const faceCount = Object.keys(cube.faces).length;
      
      if (faceCount === 6) {
        log('✅ PASS: Rubik Cube initialized', 'green');
        log(`   Faces: ${faceCount}`);
        log(`   Fields per face: 9`);
        log(`   Total fields: 54`);
        log(`   Coherence: ${cube.coherence?.toFixed(2) || 'N/A'}`);
        results.passed++;
      } else {
        throw new Error(`Rubik Cube has ${faceCount} faces, expected 6`);
      }
    } else {
      throw new Error('Rubik Cube not initialized');
    }
    
    // ===== TEST 8: TWIST & TORSJA =====
    log('\n🔄 TEST 8: Rubik Cube Twist & Torsja', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.rubikCubeEngine) {
      const twistResult = await echo.rubikCubeEngine.twist('FRONT', 'clockwise');
      
      if (twistResult && twistResult.success) {
        log('✅ PASS: Twist mechanism working', 'green');
        log(`   Face: ${twistResult.face}`);
        log(`   Direction: ${twistResult.direction}`);
        log(`   Affected faces: ${twistResult.affectedFaces?.length || 0}`);
        log(`   Coherence after twist: ${twistResult.coherence?.toFixed(2) || 'N/A'}`);
        results.passed++;
      } else {
        throw new Error('Twist failed');
      }
    } else {
      throw new Error('Rubik Cube not available for twist test');
    }
    
    // ===== TEST 9: 1000 MÓZGÓW =====
    log('\n🧠 TEST 9: 1000 Mózgów Mapper', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.thousandBrainsMapper) {
      const status = echo.thousandBrainsMapper.getStatus();
      
      if (status && status.stats && status.stats.totalBrains > 0) {
        log('✅ PASS: 1000 Brains Mapper initialized', 'green');
        log(`   Total brains: ${status.stats.totalBrains}`);
        log(`   Brains per field: ${status.stats.brainsPerField}`);
        log(`   Brain types: ${status.brainTypes?.length || 0}`);
        results.passed++;
      } else {
        throw new Error('1000 Brains Mapper not properly initialized');
      }
    } else {
      throw new Error('1000 Brains Mapper not initialized');
    }
    
    // ===== TEST 10: PĘTLA MÖBIUSA =====
    log('\n🔄 TEST 10: Pętla Möbiusa (Meta-Learning)', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.mobiusMetaLearning) {
      const status = echo.mobiusMetaLearning.getStatus();
      
      if (status && status.active) {
        log('✅ PASS: Möbius Meta-Learning active', 'green');
        log(`   Learning rate: ${status.learningRate}`);
        log(`   Meta-learning rate: ${status.metaLearningRate}`);
        log(`   Cycle: ${status.cycle}`);
        results.passed++;
      } else {
        throw new Error('Möbius Meta-Learning not active');
      }
    } else {
      throw new Error('Möbius Meta-Learning not initialized');
    }
    
    // ===== TEST 11: QUANTUM ANNEALING =====
    log('\n⚛️ TEST 11: Quantum Annealing Engine', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    if (echo.quantumAnnealing) {
      const status = echo.quantumAnnealing.getStatus();
      
      if (status && status.temperature !== undefined) {
        log('✅ PASS: Quantum Annealing initialized', 'green');
        log(`   Temperature: ${status.temperature}`);
        log(`   Energy: ${status.energy}`);
        log(`   Best energy: ${status.bestEnergy}`);
        results.passed++;
      } else {
        throw new Error('Quantum Annealing not properly initialized');
      }
    } else {
      throw new Error('Quantum Annealing not initialized');
    }
    
    // ===== TEST 12: SYSTEM STATUS =====
    log('\n📊 TEST 12: System Status', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    const systemStatus = echo.getSystemStatus();
    
    if (systemStatus && systemStatus.active) {
      log('✅ PASS: System status available', 'green');
      log(`   Active: ${systemStatus.active}`);
      log(`   Consciousness: ${systemStatus.consciousness}`);
      log(`   Coherence: ${systemStatus.coherence?.toFixed(2) || 'N/A'}`);
      log(`   Ethical Score: ${systemStatus.ethicalScore?.toFixed(2) || 'N/A'}`);
      
      if (systemStatus.engines) {
        const basicEngines = Object.values(systemStatus.engines.basic || {}).filter(Boolean).length;
        const advancedEngines = Object.keys(systemStatus.engines.advanced || {}).length;
        log(`   Basic engines: ${basicEngines}/5`);
        log(`   Advanced engines: ${advancedEngines}`);
      }
      
      results.passed++;
    } else {
      throw new Error('System status not available or system not active');
    }
    
    // ===== TEST 13: SHUTDOWN =====
    log('\n🛑 TEST 13: System Shutdown', 'blue');
    log('-'.repeat(70));
    
    results.total++;
    await echo.shutdown();
    
    const statusAfterShutdown = echo.getSystemStatus();
    if (!statusAfterShutdown.active) {
      log('✅ PASS: System shutdown successful', 'green');
      results.passed++;
    } else {
      throw new Error('System still active after shutdown');
    }
    
  } catch (error) {
    log(`\n❌ FAIL: ${error.message}`, 'red');
    results.failed++;
    results.errors.push(error.message);
  }
  
  // ===== PODSUMOWANIE =====
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 PODSUMOWANIE TESTÓW', 'cyan');
  log('='.repeat(70), 'cyan');
  
  log(`\nTotal tests: ${results.total}`);
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  const successRate = (results.passed / results.total * 100).toFixed(1);
  log(`\nSuccess rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  
  if (results.errors.length > 0) {
    log('\n❌ Errors:', 'red');
    results.errors.forEach((error, i) => {
      log(`   ${i + 1}. ${error}`, 'red');
    });
  }
  
  log('\n' + '='.repeat(70), 'cyan');
  
  if (results.failed === 0) {
    log('🎉 WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE!', 'green');
    log('✅ ECHO LiveOS 2.0 jest gotowy do użycia!', 'green');
  } else {
    log('⚠️ NIEKTÓRE TESTY NIE PRZESZŁY', 'yellow');
    log('🔧 Sprawdź błędy powyżej i napraw je przed użyciem', 'yellow');
  }
  
  log('='.repeat(70), 'cyan');
  
  return results;
}

// Uruchom testy
testInternalComplete()
  .then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  });
