/**
 * SPRAWDZAM TYLKO KOMPONENTY - BEZ URUCHAMIANIA
 */

const components = {
  EthicsCore: require('./src/core/EthicsCore'),
  QuantumCore: require('./src/core/QuantumCore'),
  PredictiveConsciousness: require('./src/core/PredictiveConsciousness'),
  CollectiveIntelligence: require('./src/core/CollectiveIntelligence'),
  CreativeIntuitionEngine: require('./src/core/CreativeIntuitionEngine'),
  LifeDomainsEngine: require('./src/core/LifeDomainsEngine'),
  LearningCurveEngine: require('./src/core/LearningCurveEngine'),
  ThousandBrainsEngine: require('./src/core/ThousandBrainsEngine'),
  MobiusTruthEngine: require('./src/core/MobiusTruthEngine'),
  LeverageEngine: require('./src/core/LeverageEngine'),
  DualMobiusSystem: require('./src/core/DualMobiusSystem'),
  RubikCubeEngine: require('./src/core/RubikCubeEngine'),
  MobiusCycle: require('./src/core/MobiusCycle'),
  EchoLiveOSCore: require('./src/core/EchoLiveOSCore'),
  SimpleBrain: require('./src/core/SimpleBrain')
};

console.log('🔍 SPRAWDZAM KOMPONENTY ECHO LIVEOS 2.0\n');

let workingComponents = 0;
let totalComponents = Object.keys(components).length;

for (const [name, ComponentClass] of Object.entries(components)) {
  try {
    console.log(`📋 Sprawdzanie: ${name}`);
    
    // Sprawdź czy klasa istnieje
    if (typeof ComponentClass !== 'function') {
      console.log(`   ❌ ${name}: nie jest klasą`);
      continue;
    }
    
    // Sprawdź czy można stworzyć instancję
    let instance;
    if (name === 'EthicsCore' || name === 'MobiusTruthEngine' || name === 'EchoLiveOSCore' || name === 'SimpleBrain') {
      instance = new ComponentClass();
    } else {
      instance = new ComponentClass({}); // pusty ethics core
    }
    
    console.log(`   ✅ ${name}: instancja stworzona`);
    
    // Sprawdź wymagane metody
    const requiredMethods = ['initialize'];
    let hasRequiredMethods = true;
    
    for (const method of requiredMethods) {
      if (typeof instance[method] === 'function') {
        console.log(`   ✅ ${name}: ma metodę ${method}`);
      } else {
        console.log(`   ⚠️  ${name}: brak metody ${method}`);
        hasRequiredMethods = false;
      }
    }
    
    if (hasRequiredMethods) {
      workingComponents++;
    }
    
  } catch (error) {
    console.log(`   ❌ ${name}: błąd - ${error.message}`);
  }
  
  console.log('');
}

console.log('📊 PODSUMOWANIE:');
console.log(`   Działające komponenty: ${workingComponents}/${totalComponents}`);
console.log(`   Procent działania: ${(workingComponents/totalComponents*100).toFixed(1)}%`);

if (workingComponents === totalComponents) {
  console.log('🎉 WSZYSTKIE KOMPONENTY DZIAŁAJĄ!');
} else {
  console.log('⚠️  POTRZEBNE POPRAWKI W KOMPONENTACH');
}
