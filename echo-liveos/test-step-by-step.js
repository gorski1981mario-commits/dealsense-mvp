/**
 * PUNKT 1: PROSTY TEST CAŁEGO SYSTEMU KROK PO KROKU
 * Krótki kij - sprawdzamy czy mózg w ogóle żyje
 */

const EchoLiveOS = require('./src/EchoLiveOS');

async function testStepByStep() {
  console.log('🧪 PUNKT 1: PROSTY TEST KROK PO KROKU\n');
  
  try {
    // KROK 1: Czy system się w ogóle tworzy?
    console.log('📋 KROK 1: Tworzenie systemu...');
    const echo = new EchoLiveOS({
      quantumMode: true,
      ethicalMode: 'strict'
    });
    console.log('   ✅ System stworzony');
    
    // KROK 2: Czy podstawowe komponenty istnieją?
    console.log('\n📋 KROK 2: Sprawdzanie komponentów...');
    
    const components = [
      'ethicsCore',
      'quantumCore', 
      'predictiveConsciousness',
      'collectiveIntelligence',
      'creativeIntuitionEngine',
      'lifeDomainsEngine',
      'learningCurveEngine',
      'thousandBrainsEngine',
      'mobiusTruthEngine',
      'leverageEngine',
      'dualMobiusSystem',
      'rubikCubeEngine'
    ];
    
    let workingComponents = 0;
    for (const component of components) {
      if (echo[component]) {
        console.log(`   ✅ ${component}: istnieje`);
        workingComponents++;
      } else {
        console.log(`   ❌ ${component}: brak`);
      }
    }
    
    console.log(`   📊 Komponenty działające: ${workingComponents}/${components.length}`);
    
    // KROK 3: Czy system się uruchamia (bez zapętlenia)?
    console.log('\n📋 KROK 3: Uruchamianie systemu...');
    
    // Ustawiamy timeout na 10 sekund
    const startupPromise = echo.startup();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Startup timeout - possible infinite loop')), 10000);
    });
    
    try {
      await Promise.race([startupPromise, timeoutPromise]);
      console.log('   ✅ System uruchomiony bez zapętlenia');
    } catch (error) {
      console.log(`   ❌ Problem z uruchomieniem: ${error.message}`);
      return false;
    }
    
    // KROK 4: Czy system ma status?
    console.log('\n📋 KROK 4: Sprawdzanie statusu...');
    const status = echo.getSystemStatus();
    
    console.log('   📊 Status systemu:');
    console.log(`     - Aktywny: ${status.system.active ? '✅' : '❌'}`);
    console.log(`     - Świadomość: ${status.system.consciousness}`);
    console.log(`     - Spójność: ${status.system.coherence}`);
    
    // KROK 5: Czy system przetwarza prosty request?
    console.log('\n📋 KROK 5: Test prostego requestu...');
    
    const simpleRequest = {
      query: 'test',
      userId: 'test-user',
      context: { urgency: 0.5 },
      domain: 'test'
    };
    
    // Timeout na request
    const requestPromise = echo.processRequest(simpleRequest);
    const requestTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - possible infinite loop')), 15000);
    });
    
    try {
      const response = await Promise.race([requestPromise, requestTimeout]);
      console.log('   ✅ Prosty request przetworzony');
      console.log(`   📊 Czas przetwarzania: ${response.meta.processingTime}ms`);
      console.log(`   📊 Długość odpowiedzi: ${response.response.length} znaków`);
    } catch (error) {
      console.log(`   ❌ Problem z requestem: ${error.message}`);
      return false;
    }
    
    // KROK 6: Czy system się zatrzymuje?
    console.log('\n📋 KROK 6: Zatrzymywanie systemu...');
    
    const shutdownPromise = echo.shutdown();
    const shutdownTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Shutdown timeout - possible infinite loop')), 5000);
    });
    
    try {
      await Promise.race([shutdownPromise, shutdownTimeout]);
      console.log('   ✅ System zatrzymany bez zapętlenia');
    } catch (error) {
      console.log(`   ❌ Problem z zatrzymaniem: ${error.message}`);
      return false;
    }
    
    // KROK 7: Podsumowanie
    console.log('\n🎉 PODSUMOWANIE TESTU KROK PO KROKU:');
    console.log(`   ✅ Komponenty: ${workingComponents}/${components.length}`);
    console.log('   ✅ Startup: bez zapętlenia');
    console.log('   ✅ Status: dostępny');
    console.log('   ✅ Request: przetwarzany');
    console.log('   ✅ Shutdown: bez zapętlenia');
    
    if (workingComponents === components.length) {
      console.log('\n🏆 SYSTEM JEST PEŁNY I DZIAŁA!');
      console.log('💥 Mózg ECHO LiveOS 2.0 jest AKTYWNY!');
      return true;
    } else {
      console.log('\n⚠️  SYSTEM DZIAŁA ALE BRAKUJE KOMPONENTÓW');
      console.log('🔧 Potrzebne poprawki przed pełnym działaniem');
      return false;
    }
    
  } catch (error) {
    console.error('❌ KRYTYCZNY BŁĄD TESTU:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Uruchom test
console.log('🚀 ROZPOCZYNAM TEST KROK PO KROKU...');
testStepByStep().then(success => {
  if (success) {
    console.log('\n✅ PUNKT 1 ZAKOŃCZONY SUKCESEM!');
    console.log('🎯 Możemy przejść do PUNKTU 2');
  } else {
    console.log('\n❌ PUNKT 1 ZAKOŃCZONY BŁĘDEM!');
    console.log('🔧 Potrzebne poprawki przed przejściem dalej');
  }
}).catch(error => {
  console.error('💥 KRYTYCZNY BŁĄD:', error);
});
