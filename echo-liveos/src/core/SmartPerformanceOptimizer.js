/**
 * SMART PERFORMANCE OPTIMIZER - MAKSYMALNY EFEKT, MINIMALNE KOSZTY
 * 
 * ZASADA:
 * - Wkładaj moc TYLKO tam gdzie potrzeba
 * - Proste problemy = proste rozwiązania (szybko, tanio)
 * - Złożone problemy = pełna moc (wolniej, drożej, ale skutecznie)
 * 
 * SMART FILTERING:
 * - Analizuj problem → wybierz minimalny zestaw modułów
 * - Nie używaj 1000 mózgów gdy wystarczy 10
 * - Nie używaj Quantum gdy wystarczy prosta logika
 */

class SmartPerformanceOptimizer {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // POZIOMY MOCY (od najtańszego do najdroższego)
    this.powerLevels = {
      MINIMAL: {
        name: 'Minimal',
        brains: 10,           // Tylko 10 najlepszych mózgów
        hemispheres: 'left',  // Tylko lewa półkula (logika)
        quantum: false,       // Bez quantum
        mobius: false,        // Bez meta-learning
        cost: 1,              // Koszt: 1x
        speed: 10             // Prędkość: 10ms
      },
      
      LIGHT: {
        name: 'Light',
        brains: 50,           // 50 mózgów
        hemispheres: 'left',  // Tylko lewa półkula
        quantum: false,       // Bez quantum
        mobius: false,        // Bez meta-learning
        cost: 3,              // Koszt: 3x
        speed: 30             // Prędkość: 30ms
      },
      
      BALANCED: {
        name: 'Balanced',
        brains: 200,          // 200 mózgów
        hemispheres: 'both',  // Obie półkule
        quantum: true,        // Z quantum (optymalizacja)
        mobius: false,        // Bez meta-learning
        cost: 10,             // Koszt: 10x
        speed: 100            // Prędkość: 100ms
      },
      
      DEEP: {
        name: 'Deep',
        brains: 1000,         // Wszystkie 1000 mózgów
        hemispheres: 'both',  // Obie półkule
        quantum: true,        // Z quantum
        mobius: true,         // Z meta-learning
        cost: 30,             // Koszt: 30x
        speed: 300            // Prędkość: 300ms
      }
    };
    
    // STATYSTYKI
    this.stats = {
      totalRequests: 0,
      minimalUsed: 0,
      lightUsed: 0,
      balancedUsed: 0,
      deepUsed: 0,
      averageCost: 0,
      averageSpeed: 0
    };
  }

  /**
   * GŁÓWNA METODA - Wybierz optymalny poziom mocy
   */
  selectOptimalPowerLevel(problem) {
    // Analizuj problem
    const complexity = this.analyzeComplexity(problem);
    const urgency = problem.urgent || false;
    const userPackage = problem.userPackage || 'FREE';
    
    // SMART DECISION:
    
    // 1. Jeśli BARDZO PROSTY → MINIMAL (10ms, koszt 1x)
    if (complexity < 0.3 && urgency) {
      this.stats.minimalUsed++;
      return this.powerLevels.MINIMAL;
    }
    
    // 2. Jeśli PROSTY → LIGHT (30ms, koszt 3x)
    if (complexity < 0.5) {
      this.stats.lightUsed++;
      return this.powerLevels.LIGHT;
    }
    
    // 3. Jeśli ŚREDNI → BALANCED (100ms, koszt 10x)
    if (complexity < 0.8) {
      this.stats.balancedUsed++;
      return this.powerLevels.BALANCED;
    }
    
    // 4. Jeśli ZŁOŻONY → DEEP (300ms, koszt 30x)
    // ALE tylko dla PRO/FINANCE users
    if (userPackage === 'PRO' || userPackage === 'FINANCE') {
      this.stats.deepUsed++;
      return this.powerLevels.DEEP;
    }
    
    // Fallback: BALANCED dla wszystkich innych
    this.stats.balancedUsed++;
    return this.powerLevels.BALANCED;
  }

  /**
   * ANALIZA ZŁOŻONOŚCI PROBLEMU
   */
  analyzeComplexity(problem) {
    let complexity = 0;
    
    // Czynniki zwiększające złożoność:
    
    // 1. Długość query
    if (problem.query) {
      const words = problem.query.split(' ').length;
      complexity += Math.min(words / 100, 0.3);  // Max +0.3
    }
    
    // 2. Liczba opcji do rozważenia
    if (problem.options) {
      const optionsCount = Array.isArray(problem.options) ? problem.options.length : 0;
      complexity += Math.min(optionsCount / 20, 0.2);  // Max +0.2
    }
    
    // 3. Wymaga kreatywności
    if (problem.requiresCreativity) {
      complexity += 0.2;
    }
    
    // 4. Wymaga empatii
    if (problem.requiresEmpathy) {
      complexity += 0.1;
    }
    
    // 5. Domena specjalistyczna
    const specializedDomains = ['medical', 'legal', 'scientific', 'financial'];
    if (specializedDomains.includes(problem.domain)) {
      complexity += 0.2;
    }
    
    return Math.min(complexity, 1.0);  // Max 1.0
  }

  /**
   * FILTRUJ MÓZGI - wybierz tylko potrzebne
   */
  filterBrains(allBrains, powerLevel, problem) {
    const targetCount = powerLevel.brains;
    
    // Jeśli problem ma preferowany kolor (priorytet)
    if (problem.priority) {
      const colorMap = {
        survival: 'RED',
        love: 'ORANGE',
        safety: 'WHITE',
        food: 'YELLOW',
        family: 'GREEN',
        health: 'BLUE'
      };
      
      const preferredColor = colorMap[problem.priority];
      if (preferredColor) {
        // Weź mózgi z preferowanego koloru
        const colorBrains = allBrains.filter(b => b.color === preferredColor);
        return colorBrains.slice(0, targetCount);
      }
    }
    
    // Jeśli problem wymaga logiki - preferuj logiczne mózgi
    if (problem.requiresLogic) {
      const logicalTypes = ['mathematician', 'physicist', 'engineer', 'analyst', 'programmer'];
      const logicalBrains = allBrains.filter(b => logicalTypes.includes(b.type));
      return logicalBrains.slice(0, targetCount);
    }
    
    // Jeśli problem wymaga kreatywności - preferuj kreatywne mózgi
    if (problem.requiresCreativity) {
      const creativeTypes = ['artist', 'designer', 'musician', 'philosopher'];
      const creativeBrains = allBrains.filter(b => creativeTypes.includes(b.type));
      return creativeBrains.slice(0, targetCount);
    }
    
    // Domyślnie: weź TOP N według wagi
    return allBrains
      .sort((a, b) => b.weight - a.weight)
      .slice(0, targetCount);
  }

  /**
   * OPTYMALIZUJ EXECUTION - wykonaj z optymalną mocą
   */
  async optimizedExecution(problem, modules) {
    const powerLevel = this.selectOptimalPowerLevel(problem);
    
    console.log(`⚡ Smart Optimizer: Using ${powerLevel.name} mode`);
    console.log(`   Brains: ${powerLevel.brains}`);
    console.log(`   Hemispheres: ${powerLevel.hemispheres}`);
    console.log(`   Quantum: ${powerLevel.quantum ? 'ON' : 'OFF'}`);
    console.log(`   Expected speed: ~${powerLevel.speed}ms`);
    console.log(`   Cost: ${powerLevel.cost}x`);
    
    const startTime = Date.now();
    const result = {
      powerLevel: powerLevel.name,
      modules: {}
    };
    
    // 1. HEMISPHERES
    if (powerLevel.hemispheres === 'left') {
      result.modules.left = await modules.leftHemisphere.process(problem);
    } else if (powerLevel.hemispheres === 'right') {
      result.modules.right = await modules.rightHemisphere.process(problem);
    } else {
      // Both
      const [left, right] = await Promise.all([
        modules.leftHemisphere.process(problem),
        modules.rightHemisphere.process(problem)
      ]);
      result.modules.left = left;
      result.modules.right = right;
    }
    
    // 2. BRAINS (filtered)
    const allBrains = modules.thousandBrainsMapper.getAllBrains();
    const filteredBrains = this.filterBrains(allBrains, powerLevel, problem);
    
    result.modules.brains = {
      used: filteredBrains.length,
      total: allBrains.length,
      percentage: (filteredBrains.length / allBrains.length * 100).toFixed(1) + '%'
    };
    
    // 3. QUANTUM (optional)
    if (powerLevel.quantum && modules.quantumAnnealing) {
      result.modules.quantum = await modules.quantumAnnealing.optimize(problem, {
        maxIterations: 50  // Mniej iteracji dla szybkości
      });
    }
    
    // 4. MOBIUS (optional)
    if (powerLevel.mobius && modules.mobiusMetaLearning) {
      // Meta-learning tylko dla DEEP mode
      result.modules.mobius = {
        active: true,
        learningWeights: modules.mobiusMetaLearning.learningWeights
      };
    }
    
    const processingTime = Date.now() - startTime;
    
    // Aktualizuj statystyki
    this.updateStats(powerLevel, processingTime);
    
    console.log(`✅ Execution completed in ${processingTime}ms (target: ${powerLevel.speed}ms)`);
    
    return {
      success: true,
      result: result,
      powerLevel: powerLevel.name,
      processingTime: processingTime,
      cost: powerLevel.cost,
      efficiency: powerLevel.speed / processingTime  // >1 = szybciej niż oczekiwano
    };
  }

  /**
   * AKTUALIZUJ STATYSTYKI
   */
  updateStats(powerLevel, processingTime) {
    this.stats.totalRequests++;
    
    // Średni koszt
    const alpha = 0.1;
    this.stats.averageCost = 
      this.stats.averageCost * (1 - alpha) + powerLevel.cost * alpha;
    
    // Średnia prędkość
    this.stats.averageSpeed = 
      this.stats.averageSpeed * (1 - alpha) + processingTime * alpha;
  }

  /**
   * RAPORT OSZCZĘDNOŚCI
   */
  getSavingsReport() {
    const totalRequests = this.stats.totalRequests;
    if (totalRequests === 0) return null;
    
    // Gdyby zawsze używać DEEP mode
    const worstCaseCost = totalRequests * this.powerLevels.DEEP.cost;
    const worstCaseSpeed = totalRequests * this.powerLevels.DEEP.speed;
    
    // Faktyczny koszt/prędkość
    const actualCost = this.stats.averageCost * totalRequests;
    const actualSpeed = this.stats.averageSpeed * totalRequests;
    
    return {
      totalRequests: totalRequests,
      distribution: {
        minimal: ((this.stats.minimalUsed / totalRequests) * 100).toFixed(1) + '%',
        light: ((this.stats.lightUsed / totalRequests) * 100).toFixed(1) + '%',
        balanced: ((this.stats.balancedUsed / totalRequests) * 100).toFixed(1) + '%',
        deep: ((this.stats.deepUsed / totalRequests) * 100).toFixed(1) + '%'
      },
      savings: {
        cost: ((worstCaseCost - actualCost) / worstCaseCost * 100).toFixed(1) + '%',
        speed: ((worstCaseSpeed - actualSpeed) / worstCaseSpeed * 100).toFixed(1) + '%'
      },
      averages: {
        cost: this.stats.averageCost.toFixed(1) + 'x',
        speed: this.stats.averageSpeed.toFixed(0) + 'ms'
      }
    };
  }

  /**
   * STATUS
   */
  getStatus() {
    return {
      stats: this.stats,
      savingsReport: this.getSavingsReport()
    };
  }
}

module.exports = SmartPerformanceOptimizer;
