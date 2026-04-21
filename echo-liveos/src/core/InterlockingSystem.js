/**
 * INTERLOCKING SYSTEM - Zazębianie Modułów (Synergy)
 * 
 * ZAZĘBIANIE = Moduły współpracują, wyniki się łączą
 * 
 * ZASADA WIĄZKI ZAPAŁEK:
 * 1 moduł = 1x siły
 * 2 moduły zazębione = 3x siły (synergy!)
 * 3 moduły zazębione = 7x siły (exponential!)
 * 
 * MATEMATYKA:
 * Synergy_Power = Σ(module_i) + Σ(interaction_ij)
 * gdzie interaction_ij = compatibility(i,j) * weight_i * weight_j
 */

class InterlockingSystem {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // KOMPATYBILNOŚĆ MODUŁÓW (0-1)
    this.moduleCompatibility = {
      // Left Hemisphere dobrze współpracuje z:
      leftHemisphere: {
        quantumAnnealing: 0.9,    // Logika + optymalizacja
        rubikCube: 0.8,           // Logika + analiza
        thousandBrains: 0.7,      // Logika + perspektywy
        rightHemisphere: 0.6,     // Balans półkul
        ethicsCore: 0.8           // Logika + etyka
      },
      
      // Right Hemisphere dobrze współpracuje z:
      rightHemisphere: {
        mobiusLoop: 0.9,          // Kreatywność + doskonalenie
        thousandBrains: 0.8,      // Kreatywność + perspektywy
        leverageEngine: 0.7,      // Kreatywność + strategia
        leftHemisphere: 0.6,      // Balans półkul
        ethicsCore: 0.7           // Kreatywność + etyka
      },
      
      // Quantum Annealing dobrze współpracuje z:
      quantumAnnealing: {
        leftHemisphere: 0.9,      // Optymalizacja + logika
        thousandBrains: 0.8,      // Optymalizacja + perspektywy
        rubikCube: 0.7,           // Optymalizacja + analiza
        ethicsCore: 0.6           // Optymalizacja + etyka
      },
      
      // Thousand Brains dobrze współpracuje z:
      thousandBrains: {
        leftHemisphere: 0.7,      // Perspektywy + logika
        rightHemisphere: 0.8,     // Perspektywy + kreatywność
        quantumAnnealing: 0.8,    // Perspektywy + optymalizacja
        mobiusLoop: 0.7,          // Perspektywy + doskonalenie
        ethicsCore: 0.9           // Perspektywy + etyka
      },
      
      // Rubik Cube dobrze współpracuje z:
      rubikCube: {
        leftHemisphere: 0.8,      // Analiza + logika
        quantumAnnealing: 0.7,    // Analiza + optymalizacja
        thousandBrains: 0.6,      // Analiza + perspektywy
        ethicsCore: 0.7           // Analiza + etyka
      },
      
      // Mobius Loop dobrze współpracuje z:
      mobiusLoop: {
        rightHemisphere: 0.9,     // Doskonalenie + kreatywność
        thousandBrains: 0.7,      // Doskonalenie + perspektywy
        leverageEngine: 0.8,      // Doskonalenie + strategia
        ethicsCore: 0.6           // Doskonalenie + etyka
      },
      
      // Leverage Engine dobrze współpracuje z:
      leverageEngine: {
        rightHemisphere: 0.7,     // Strategia + kreatywność
        mobiusLoop: 0.8,          // Strategia + doskonalenie
        thousandBrains: 0.7,      // Strategia + perspektywy
        ethicsCore: 0.8           // Strategia + etyka
      },
      
      // Ethics Core dobrze współpracuje z WSZYSTKIMI
      ethicsCore: {
        leftHemisphere: 0.8,
        rightHemisphere: 0.7,
        quantumAnnealing: 0.6,
        thousandBrains: 0.9,
        rubikCube: 0.7,
        mobiusLoop: 0.6,
        leverageEngine: 0.8
      }
    };
    
    // HISTORIA ZAZĘBIEŃ
    this.interlockingHistory = [];
    
    // STATYSTYKI
    this.stats = {
      totalInterlockings: 0,
      averageSynergyPower: 1.0,
      maxSynergyPower: 1.0,
      optimalCombinations: []
    };
  }

  /**
   * GŁÓWNA METODA - Zazęb Moduły
   */
  interlockModules(activeModules, moduleWeights) {
    console.log('🔗 INTERLOCKING: Interlocking modules...');
    
    const interlocking = {
      timestamp: Date.now(),
      activeModules: activeModules,
      moduleWeights: moduleWeights
    };
    
    // KROK 1: Oblicz interakcje między modułami
    const interactions = this.calculateInteractions(activeModules, moduleWeights);
    interlocking.interactions = interactions;
    console.log(`   Interactions: ${interactions.length}`);
    
    // KROK 2: Oblicz synergy power
    const synergyPower = this.calculateSynergyPower(activeModules, interactions);
    interlocking.synergyPower = synergyPower;
    console.log(`   Synergy power: ${synergyPower.toFixed(2)}x`);
    
    // KROK 3: Zbuduj graf zazębień
    const interlockingGraph = this.buildInterlockingGraph(activeModules, interactions);
    interlocking.graph = interlockingGraph;
    
    // KROK 4: Znajdź najsilniejsze połączenia
    const strongestConnections = this.findStrongestConnections(interactions);
    interlocking.strongestConnections = strongestConnections;
    console.log(`   Strongest: ${strongestConnections.slice(0, 3).map(c => `${c.from}-${c.to}`).join(', ')}`);
    
    // KROK 5: Optymalizuj kolejność wykonania
    const executionOrder = this.optimizeExecutionOrder(activeModules, interlockingGraph);
    interlocking.executionOrder = executionOrder;
    console.log(`   Execution order: ${executionOrder.join(' → ')}`);
    
    // ZAPISZ
    this.interlockingHistory.push(interlocking);
    this.updateStats(interlocking);
    
    console.log('✅ INTERLOCKING: Modules interlocked');
    
    return interlocking;
  }

  /**
   * OBLICZ INTERAKCJE
   * 
   * MATEMATYKA:
   * Interaction(i,j) = compatibility(i,j) * weight_i * weight_j
   */
  calculateInteractions(activeModules, moduleWeights) {
    const interactions = [];
    
    for (let i = 0; i < activeModules.length; i++) {
      for (let j = i + 1; j < activeModules.length; j++) {
        const moduleA = activeModules[i];
        const moduleB = activeModules[j];
        
        // Kompatybilność (0-1)
        const compatibility = this.getCompatibility(moduleA, moduleB);
        
        // Wagi
        const weightA = moduleWeights[moduleA] || 0.5;
        const weightB = moduleWeights[moduleB] || 0.5;
        
        // INTERACTION STRENGTH
        const strength = compatibility * weightA * weightB;
        
        interactions.push({
          from: moduleA,
          to: moduleB,
          compatibility: compatibility,
          strength: strength
        });
      }
    }
    
    // Sortuj po sile
    return interactions.sort((a, b) => b.strength - a.strength);
  }

  /**
   * OBLICZ SYNERGY POWER
   * 
   * ZASADA WIĄZKI ZAPAŁEK:
   * Power = Σ(module_i) + Σ(interaction_ij)
   * 
   * 1 moduł = 1.0x
   * 2 moduły + interakcja = 2.0 + 0.5 = 2.5x
   * 3 moduły + interakcje = 3.0 + 1.5 = 4.5x
   * etc.
   */
  calculateSynergyPower(activeModules, interactions) {
    // Bazowa siła (liczba modułów)
    let power = activeModules.length;
    
    // Dodaj interakcje (synergy!)
    const interactionBonus = interactions.reduce((sum, i) => sum + i.strength, 0);
    power += interactionBonus;
    
    // Normalizuj (1 moduł = 1.0x)
    power = power / activeModules.length;
    
    return power;
  }

  /**
   * ZBUDUJ GRAF ZAZĘBIEŃ
   */
  buildInterlockingGraph(activeModules, interactions) {
    const graph = {};
    
    // Inicjalizuj węzły
    for (const module of activeModules) {
      graph[module] = {
        connections: [],
        totalStrength: 0
      };
    }
    
    // Dodaj krawędzie
    for (const interaction of interactions) {
      graph[interaction.from].connections.push({
        to: interaction.to,
        strength: interaction.strength
      });
      graph[interaction.from].totalStrength += interaction.strength;
      
      graph[interaction.to].connections.push({
        to: interaction.from,
        strength: interaction.strength
      });
      graph[interaction.to].totalStrength += interaction.strength;
    }
    
    return graph;
  }

  /**
   * ZNAJDŹ NAJSILNIEJSZE POŁĄCZENIA
   */
  findStrongestConnections(interactions) {
    // Top 5 najsilniejszych
    return interactions.slice(0, 5);
  }

  /**
   * OPTYMALIZUJ KOLEJNOŚĆ WYKONANIA
   * 
   * STRATEGIA:
   * 1. Zacznij od modułu z najsilniejszymi połączeniami
   * 2. Następnie moduły które się z nim zazębiają
   * 3. Potem kolejne zazębione
   * 
   * = Maksymalna synergy!
   */
  optimizeExecutionOrder(activeModules, graph) {
    const order = [];
    const visited = new Set();
    
    // Znajdź moduł z najsilniejszymi połączeniami
    let strongest = activeModules[0];
    let maxStrength = 0;
    
    for (const module of activeModules) {
      if (graph[module].totalStrength > maxStrength) {
        maxStrength = graph[module].totalStrength;
        strongest = module;
      }
    }
    
    // DFS (Depth-First Search) od najsilniejszego
    const dfs = (module) => {
      if (visited.has(module)) return;
      
      visited.add(module);
      order.push(module);
      
      // Sortuj połączenia po sile
      const connections = graph[module].connections
        .sort((a, b) => b.strength - a.strength);
      
      for (const conn of connections) {
        dfs(conn.to);
      }
    };
    
    dfs(strongest);
    
    // Dodaj pozostałe (jeśli jakieś)
    for (const module of activeModules) {
      if (!visited.has(module)) {
        order.push(module);
      }
    }
    
    return order;
  }

  /**
   * GET COMPATIBILITY
   */
  getCompatibility(moduleA, moduleB) {
    if (this.moduleCompatibility[moduleA] && 
        this.moduleCompatibility[moduleA][moduleB]) {
      return this.moduleCompatibility[moduleA][moduleB];
    }
    
    if (this.moduleCompatibility[moduleB] && 
        this.moduleCompatibility[moduleB][moduleA]) {
      return this.moduleCompatibility[moduleB][moduleA];
    }
    
    // Domyślna kompatybilność
    return 0.5;
  }

  /**
   * UPDATE STATS
   */
  updateStats(interlocking) {
    this.stats.totalInterlockings++;
    
    // Średnia synergy power
    this.stats.averageSynergyPower = 
      (this.stats.averageSynergyPower * (this.stats.totalInterlockings - 1) + interlocking.synergyPower) 
      / this.stats.totalInterlockings;
    
    // Max synergy power
    if (interlocking.synergyPower > this.stats.maxSynergyPower) {
      this.stats.maxSynergyPower = interlocking.synergyPower;
    }
    
    // Optymalne kombinacje (synergy > 2.0x)
    if (interlocking.synergyPower > 2.0) {
      this.stats.optimalCombinations.push({
        modules: interlocking.activeModules,
        synergyPower: interlocking.synergyPower
      });
    }
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      totalInterlockings: this.stats.totalInterlockings,
      averageSynergyPower: this.stats.averageSynergyPower.toFixed(2) + 'x',
      maxSynergyPower: this.stats.maxSynergyPower.toFixed(2) + 'x',
      optimalCombinations: this.stats.optimalCombinations.length
    };
  }
}

module.exports = InterlockingSystem;
