/**
 * BALANCE ENGINE - Dynamiczny Balans Modułów
 * 
 * BALANS = Fundament inteligencji (jak w przyrodzie)
 * 
 * ZASADY:
 * 1. Logika ↔ Kreatywność (Left ↔ Right Hemisphere)
 * 2. Ciężkie ↔ Lekkie głowice (Dokładność ↔ Szybkość)
 * 3. Ryzyko ↔ Bezpieczeństwo (Innovation ↔ Ethics)
 * 4. Szerokość ↔ Głębokość (Breadth ↔ Depth)
 * 
 * MATEMATYKA:
 * Balance_Score = Σ(weight_i * module_i) / Σ(weight_i)
 * Optimal_Balance = argmax(Performance * Accuracy * Speed)
 */

class BalanceEngine {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // WYMIARY BALANSU
    this.balanceDimensions = {
      LOGIC_CREATIVITY: 'logic_creativity',       // Left ↔ Right
      HEAVY_LIGHT: 'heavy_light',                 // Dokładność ↔ Szybkość
      RISK_SAFETY: 'risk_safety',                 // Innowacja ↔ Etyka
      BREADTH_DEPTH: 'breadth_depth'              // Szerokość ↔ Głębokość
    };
    
    // PROFILE BALANSU (predefiniowane)
    this.balanceProfiles = {
      MATHEMATICAL: {
        logic_creativity: { logic: 0.9, creativity: 0.1 },
        heavy_light: { heavy: 0.8, light: 0.2 },
        risk_safety: { risk: 0.2, safety: 0.8 },
        breadth_depth: { breadth: 0.3, depth: 0.7 }
      },
      CREATIVE: {
        logic_creativity: { logic: 0.2, creativity: 0.8 },
        heavy_light: { heavy: 0.5, light: 0.5 },
        risk_safety: { risk: 0.7, safety: 0.3 },
        breadth_depth: { breadth: 0.7, depth: 0.3 }
      },
      STRATEGIC: {
        logic_creativity: { logic: 0.6, creativity: 0.4 },
        heavy_light: { heavy: 0.6, light: 0.4 },
        risk_safety: { risk: 0.5, safety: 0.5 },
        breadth_depth: { breadth: 0.5, depth: 0.5 }
      },
      ANALYTICAL: {
        logic_creativity: { logic: 0.7, creativity: 0.3 },
        heavy_light: { heavy: 0.7, light: 0.3 },
        risk_safety: { risk: 0.3, safety: 0.7 },
        breadth_depth: { breadth: 0.4, depth: 0.6 }
      },
      BALANCED: {
        logic_creativity: { logic: 0.5, creativity: 0.5 },
        heavy_light: { heavy: 0.5, light: 0.5 },
        risk_safety: { risk: 0.5, safety: 0.5 },
        breadth_depth: { breadth: 0.5, depth: 0.5 }
      }
    };
    
    // HISTORIA BALANSU (learning)
    this.balanceHistory = [];
    
    // STATYSTYKI
    this.stats = {
      totalBalances: 0,
      averageLogic: 0.5,
      averageCreativity: 0.5,
      optimalBalanceFound: 0
    };
  }

  /**
   * GŁÓWNA METODA - Oblicz Optymalny Balans
   */
  calculateOptimalBalance(regentDecision) {
    console.log('⚖️ BALANCE ENGINE: Calculating optimal balance...');
    
    const balance = {
      timestamp: Date.now(),
      questionType: regentDecision.questionType,
      complexity: regentDecision.complexity
    };
    
    // KROK 1: Wybierz bazowy profil
    const baseProfile = this.selectBaseProfile(regentDecision.questionType);
    balance.baseProfile = baseProfile;
    console.log(`   Base profile: ${baseProfile}`);
    
    // KROK 2: Adaptuj do złożoności
    const adapted = this.adaptToComplexity(
      this.balanceProfiles[baseProfile],
      regentDecision.complexity
    );
    balance.adapted = adapted;
    
    // KROK 3: Optymalizuj balans
    const optimized = this.optimizeBalance(adapted, regentDecision);
    balance.optimized = optimized;
    
    // KROK 4: Oblicz wagi modułów
    const moduleWeights = this.calculateModuleWeights(optimized);
    balance.moduleWeights = moduleWeights;
    console.log(`   Logic: ${(optimized.logic_creativity.logic * 100).toFixed(0)}%, Creativity: ${(optimized.logic_creativity.creativity * 100).toFixed(0)}%`);
    console.log(`   Heavy: ${(optimized.heavy_light.heavy * 100).toFixed(0)}%, Light: ${(optimized.heavy_light.light * 100).toFixed(0)}%`);
    
    // KROK 5: Oblicz performance score
    const performanceScore = this.calculatePerformanceScore(optimized);
    balance.performanceScore = performanceScore;
    console.log(`   Performance score: ${performanceScore.toFixed(2)}`);
    
    // ZAPISZ
    this.balanceHistory.push(balance);
    this.updateStats(balance);
    
    console.log('✅ BALANCE ENGINE: Balance calculated');
    
    return balance;
  }

  /**
   * WYBIERZ BAZOWY PROFIL
   */
  selectBaseProfile(questionType) {
    const mapping = {
      'mathematical': 'MATHEMATICAL',
      'logical': 'MATHEMATICAL',
      'creative': 'CREATIVE',
      'analytical': 'ANALYTICAL',
      'strategic': 'STRATEGIC',
      'ethical': 'ANALYTICAL',
      'emotional': 'CREATIVE',
      'technical': 'ANALYTICAL'
    };
    
    return mapping[questionType] || 'BALANCED';
  }

  /**
   * ADAPTUJ DO ZŁOŻONOŚCI
   * 
   * ZASADA:
   * - Im bardziej złożone, tym więcej:
   *   - Kreatywności (potrzeba nowych pomysłów)
   *   - Ciężkich głowic (potrzeba dokładności)
   *   - Głębokości (potrzeba szczegółów)
   */
  adaptToComplexity(baseProfile, complexity) {
    const adapted = JSON.parse(JSON.stringify(baseProfile)); // deep copy
    
    // Complexity bonus (0-0.2)
    const complexityBonus = (complexity - 1) * 0.05;
    
    // Więcej kreatywności dla złożonych problemów
    adapted.logic_creativity.creativity += complexityBonus;
    adapted.logic_creativity.logic -= complexityBonus;
    
    // Więcej ciężkich głowic dla złożonych problemów
    adapted.heavy_light.heavy += complexityBonus;
    adapted.heavy_light.light -= complexityBonus;
    
    // Więcej głębokości dla złożonych problemów
    adapted.breadth_depth.depth += complexityBonus;
    adapted.breadth_depth.breadth -= complexityBonus;
    
    // Normalizuj (suma = 1.0)
    this.normalizeBalance(adapted);
    
    return adapted;
  }

  /**
   * OPTYMALIZUJ BALANS
   * 
   * MATEMATYKA:
   * Optimal = argmax(Performance * Accuracy * Speed)
   */
  optimizeBalance(adapted, regentDecision) {
    const optimized = JSON.parse(JSON.stringify(adapted));
    
    // Użyj historii do optymalizacji
    const similarHistory = this.balanceHistory.filter(h => 
      h.questionType === regentDecision.questionType &&
      Math.abs(h.complexity - regentDecision.complexity) <= 1
    );
    
    if (similarHistory.length > 0) {
      // Znajdź najlepszy balans z historii
      const best = similarHistory.reduce((best, current) => 
        current.performanceScore > best.performanceScore ? current : best
      );
      
      // Przesuń w stronę najlepszego (learning)
      const learningRate = 0.1;
      
      for (const dim of Object.keys(optimized)) {
        for (const key of Object.keys(optimized[dim])) {
          const current = optimized[dim][key];
          const target = best.optimized[dim][key];
          optimized[dim][key] = current + (target - current) * learningRate;
        }
      }
      
      // Normalizuj
      this.normalizeBalance(optimized);
    }
    
    return optimized;
  }

  /**
   * OBLICZ WAGI MODUŁÓW
   */
  calculateModuleWeights(balance) {
    const weights = {};
    
    // Left Hemisphere (logika)
    weights.leftHemisphere = balance.logic_creativity.logic;
    
    // Right Hemisphere (kreatywność)
    weights.rightHemisphere = balance.logic_creativity.creativity;
    
    // Quantum Annealing (ciężka głowica)
    weights.quantumAnnealing = balance.heavy_light.heavy * balance.logic_creativity.logic;
    
    // Thousand Brains (adaptacyjna)
    weights.thousandBrains = balance.heavy_light.heavy * 0.8 + balance.heavy_light.light * 0.2;
    
    // Rubik Cube (logika + głębokość)
    weights.rubikCube = balance.logic_creativity.logic * balance.breadth_depth.depth;
    
    // Mobius Loop (kreatywność + ryzyko)
    weights.mobiusLoop = balance.logic_creativity.creativity * balance.risk_safety.risk;
    
    // Ethics Core (bezpieczeństwo)
    weights.ethicsCore = balance.risk_safety.safety;
    
    return weights;
  }

  /**
   * OBLICZ PERFORMANCE SCORE
   * 
   * MATEMATYKA:
   * Score = (1 - |0.5 - logic|) * (1 - |0.5 - heavy|) * (1 - |0.5 - risk|)
   * 
   * Im bliżej balansu (0.5), tym wyższy score
   */
  calculatePerformanceScore(balance) {
    // Balans = bliskość do 0.5
    const logicBalance = 1 - Math.abs(0.5 - balance.logic_creativity.logic);
    const heavyBalance = 1 - Math.abs(0.5 - balance.heavy_light.heavy);
    const riskBalance = 1 - Math.abs(0.5 - balance.risk_safety.risk);
    const depthBalance = 1 - Math.abs(0.5 - balance.breadth_depth.depth);
    
    // Średnia geometryczna (wszystkie wymiary równie ważne)
    const score = Math.pow(
      logicBalance * heavyBalance * riskBalance * depthBalance,
      1/4
    );
    
    return score;
  }

  /**
   * NORMALIZUJ BALANS (suma = 1.0)
   */
  normalizeBalance(balance) {
    for (const dim of Object.keys(balance)) {
      const keys = Object.keys(balance[dim]);
      const sum = keys.reduce((s, k) => s + balance[dim][k], 0);
      
      for (const key of keys) {
        balance[dim][key] /= sum;
      }
    }
  }

  /**
   * UPDATE STATS
   */
  updateStats(balance) {
    this.stats.totalBalances++;
    
    // Średnia logika/kreatywność
    this.stats.averageLogic = 
      (this.stats.averageLogic * (this.stats.totalBalances - 1) + balance.optimized.logic_creativity.logic) 
      / this.stats.totalBalances;
    
    this.stats.averageCreativity = 
      (this.stats.averageCreativity * (this.stats.totalBalances - 1) + balance.optimized.logic_creativity.creativity) 
      / this.stats.totalBalances;
    
    // Optymalny balans (score > 0.8)
    if (balance.performanceScore > 0.8) {
      this.stats.optimalBalanceFound++;
    }
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      totalBalances: this.stats.totalBalances,
      averageLogic: (this.stats.averageLogic * 100).toFixed(0) + '%',
      averageCreativity: (this.stats.averageCreativity * 100).toFixed(0) + '%',
      optimalBalanceFound: this.stats.optimalBalanceFound,
      historySize: this.balanceHistory.length
    };
  }
}

module.exports = BalanceEngine;
