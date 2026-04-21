/**
 * MOBIUS META-LEARNING - UCZENIE SIĘ UCZENIA
 * 
 * PĘTLA MÖBIUSA:
 * Problem → Analiza → Wynik → Uczenie → Problem (z lepszymi wagami)
 *     ↑                                        ↓
 *     └────────────── META-UCZENIE ───────────┘
 * 
 * META-LEARNING:
 * - System uczy się KTÓRE UCZENIE działa najlepiej
 * - Każdy cykl = lepsze wagi
 * - Nieskończona pętla doskonalenia
 * - Uczenie się uczenia się uczenia... (rekursja)
 */

class MobiusMetaLearning {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // PĘTLA MÖBIUSA
    this.loop = {
      active: false,
      cycle: 0,
      maxCycles: Infinity,  // Nieskończona pętla
      learningRate: 0.01,   // Jak szybko się uczy
      metaLearningRate: 0.001  // Jak szybko uczy się uczenia
    };
    
    // WAGI UCZENIA (które metody uczenia działają najlepiej)
    this.learningWeights = {
      supervised: 0.5,      // Uczenie nadzorowane
      unsupervised: 0.3,    // Uczenie nienadzorowane
      reinforcement: 0.4,   // Uczenie przez wzmocnienie
      transfer: 0.3,        // Transfer learning
      meta: 0.2             // Meta-learning
    };
    
    // HISTORIA UCZENIA
    this.learningHistory = [];
    
    // METRYKI
    this.metrics = {
      totalCycles: 0,
      successfulLearnings: 0,
      failedLearnings: 0,
      averageImprovement: 0,
      metaLearningScore: 0
    };
  }

  /**
   * INICJALIZACJA
   */
  async initialize() {
    console.log('🔄 Initializing Mobius Meta-Learning...');
    
    // Etyczna walidacja
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'mobius_meta_learning_initialization',
      description: 'Initialize infinite learning loop'
    });
    
    if (!ethicalCheck.approved) {
      console.error('❌ Mobius Meta-Learning initialization rejected by Ethics Core');
      return false;
    }
    
    this.loop.active = true;
    
    console.log('✅ Mobius Meta-Learning initialized!');
    console.log('   Learning rate:', this.loop.learningRate);
    console.log('   Meta-learning rate:', this.loop.metaLearningRate);
    console.log('   Max cycles: Infinity');
    
    return true;
  }

  /**
   * GŁÓWNA PĘTLA - Uczenie się z wyniku
   */
  async learnFromResult(problem, result, expectedOutcome) {
    if (!this.loop.active) {
      console.warn('⚠️ Mobius loop not active');
      return { success: false, reason: 'loop_inactive' };
    }
    
    this.loop.cycle++;
    this.metrics.totalCycles++;
    
    console.log(`🔄 [MOBIUS CYCLE ${this.loop.cycle}] Learning from result...`);
    
    // 1. OBLICZ BŁĄD (różnica między wynikiem a oczekiwaniem)
    const error = this.calculateError(result, expectedOutcome);
    
    // 2. PODSTAWOWE UCZENIE - popraw wagi na podstawie błędu
    const basicLearning = this.basicLearning(problem, error);
    
    // 3. META-UCZENIE - ucz się KTÓRE UCZENIE działa najlepiej
    const metaLearning = this.metaLearning(basicLearning, error);
    
    // 4. AKTUALIZUJ WAGI UCZENIA
    this.updateLearningWeights(metaLearning);
    
    // 5. ZAPISZ W HISTORII
    this.learningHistory.push({
      cycle: this.loop.cycle,
      problem: problem,
      result: result,
      error: error,
      basicLearning: basicLearning,
      metaLearning: metaLearning,
      timestamp: Date.now()
    });
    
    // 6. AKTUALIZUJ METRYKI
    this.updateMetrics(error, metaLearning);
    
    // 7. PĘTLA MÖBIUSA - wróć do początku z lepszymi wagami
    const improvement = this.calculateImprovement();
    
    console.log(`✅ [CYCLE ${this.loop.cycle}] Learning completed`);
    console.log(`   Error: ${error.toFixed(4)}`);
    console.log(`   Improvement: ${(improvement * 100).toFixed(2)}%`);
    console.log(`   Meta-learning score: ${this.metrics.metaLearningScore.toFixed(4)}`);
    
    return {
      success: true,
      cycle: this.loop.cycle,
      error: error,
      improvement: improvement,
      metaLearningScore: this.metrics.metaLearningScore,
      learningWeights: { ...this.learningWeights }
    };
  }

  /**
   * OBLICZ BŁĄD
   */
  calculateError(result, expectedOutcome) {
    // Prosta metryka błędu (w prawdziwym systemie byłaby bardziej złożona)
    if (typeof result === 'number' && typeof expectedOutcome === 'number') {
      return Math.abs(result - expectedOutcome);
    }
    
    // Dla obiektów - porównaj confidence
    if (result.confidence && expectedOutcome.confidence) {
      return Math.abs(result.confidence - expectedOutcome.confidence);
    }
    
    // Domyślnie
    return 0.5;
  }

  /**
   * PODSTAWOWE UCZENIE - popraw wagi na podstawie błędu
   */
  basicLearning(problem, error) {
    const learnings = {};
    
    // Dla każdej metody uczenia
    for (const [method, weight] of Object.entries(this.learningWeights)) {
      // Oblicz jak bardzo ta metoda powinna się zmienić
      const delta = -error * this.loop.learningRate * weight;
      
      learnings[method] = {
        oldWeight: weight,
        delta: delta,
        newWeight: Math.max(0, Math.min(1, weight + delta))
      };
    }
    
    return learnings;
  }

  /**
   * META-UCZENIE - ucz się KTÓRE UCZENIE działa najlepiej
   */
  metaLearning(basicLearning, error) {
    // Sprawdź które metody uczenia zmniejszyły błąd najbardziej
    const metaScores = {};
    
    for (const [method, learning] of Object.entries(basicLearning)) {
      // Jeśli delta jest ujemne (zmniejsza błąd) = dobra metoda
      const effectiveness = -learning.delta / error;
      metaScores[method] = effectiveness;
    }
    
    // META-WAGA: które metody uczenia są najlepsze
    const bestMethod = Object.entries(metaScores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      metaScores: metaScores,
      bestMethod: bestMethod[0],
      bestScore: bestMethod[1],
      recommendation: `Use ${bestMethod[0]} learning more`
    };
  }

  /**
   * AKTUALIZUJ WAGI UCZENIA (meta-learning)
   */
  updateLearningWeights(metaLearning) {
    // Zwiększ wagę najlepszej metody
    const bestMethod = metaLearning.bestMethod;
    
    for (const method of Object.keys(this.learningWeights)) {
      if (method === bestMethod) {
        // Zwiększ wagę najlepszej metody
        this.learningWeights[method] += this.loop.metaLearningRate;
      } else {
        // Zmniejsz wagę innych metod
        this.learningWeights[method] -= this.loop.metaLearningRate * 0.2;
      }
      
      // Ogranicz do [0, 1]
      this.learningWeights[method] = Math.max(0, Math.min(1, this.learningWeights[method]));
    }
  }

  /**
   * OBLICZ POPRAWĘ (improvement)
   */
  calculateImprovement() {
    if (this.learningHistory.length < 2) {
      return 0;
    }
    
    // Porównaj ostatni błąd z poprzednim
    const current = this.learningHistory[this.learningHistory.length - 1];
    const previous = this.learningHistory[this.learningHistory.length - 2];
    
    const improvement = (previous.error - current.error) / previous.error;
    return improvement;
  }

  /**
   * AKTUALIZUJ METRYKI
   */
  updateMetrics(error, metaLearning) {
    // Czy uczenie było udane (błąd się zmniejszył)
    if (error < 0.5) {
      this.metrics.successfulLearnings++;
    } else {
      this.metrics.failedLearnings++;
    }
    
    // Średnia poprawa
    const improvement = this.calculateImprovement();
    const alpha = 0.1;  // Waga dla nowych pomiarów
    this.metrics.averageImprovement = 
      this.metrics.averageImprovement * (1 - alpha) + improvement * alpha;
    
    // Meta-learning score
    this.metrics.metaLearningScore = metaLearning.bestScore;
  }

  /**
   * SYMULUJ CYKL MÖBIUSA (dla testów)
   */
  async simulateMobiusCycle(initialProblem, cycles = 10) {
    console.log(`🔄 Simulating ${cycles} Mobius cycles...`);
    
    let problem = initialProblem;
    let result = { confidence: 0.5 };
    
    for (let i = 0; i < cycles; i++) {
      // Symuluj wynik (w prawdziwym systemie byłby prawdziwy)
      result.confidence += Math.random() * 0.1 - 0.05;
      result.confidence = Math.max(0, Math.min(1, result.confidence));
      
      // Ucz się z wyniku
      const expectedOutcome = { confidence: 0.9 };
      await this.learnFromResult(problem, result, expectedOutcome);
      
      // Pętla Möbiusa - wróć do początku z lepszymi wagami
      problem = { ...problem, learningWeights: { ...this.learningWeights } };
    }
    
    console.log(`✅ Simulation completed!`);
    console.log(`   Final confidence: ${result.confidence.toFixed(3)}`);
    console.log(`   Average improvement: ${(this.metrics.averageImprovement * 100).toFixed(2)}%`);
    console.log(`   Success rate: ${(this.metrics.successfulLearnings / this.metrics.totalCycles * 100).toFixed(1)}%`);
    
    return {
      cycles: cycles,
      finalResult: result,
      metrics: this.metrics,
      learningWeights: this.learningWeights
    };
  }

  /**
   * RESET PĘTLI
   */
  reset() {
    this.loop.cycle = 0;
    this.learningHistory = [];
    this.metrics = {
      totalCycles: 0,
      successfulLearnings: 0,
      failedLearnings: 0,
      averageImprovement: 0,
      metaLearningScore: 0
    };
    
    console.log('🔄 Mobius loop reset');
  }

  /**
   * STOP PĘTLI
   */
  stop() {
    this.loop.active = false;
    console.log('⏸️ Mobius loop stopped');
  }

  /**
   * STATUS
   */
  getStatus() {
    return {
      active: this.loop.active,
      cycle: this.loop.cycle,
      learningRate: this.loop.learningRate,
      metaLearningRate: this.loop.metaLearningRate,
      learningWeights: this.learningWeights,
      metrics: this.metrics,
      historyLength: this.learningHistory.length
    };
  }
}

module.exports = MobiusMetaLearning;
