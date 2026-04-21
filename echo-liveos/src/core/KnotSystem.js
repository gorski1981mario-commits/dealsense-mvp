/**
 * KNOT SYSTEM - MULTI-TEMPORAL PERSPECTIVE ENGINE
 * 
 * KONCEPCJA:
 * - 8-12 mikronotów przetwarzających input równolegle
 * - Każdy knot ma różne parametry (alpha, beta, loops)
 * - Weighted aggregation: najszybsze strumienie = największa waga
 * - Diversity bonus: boost tam gdzie knoty się różnią
 * 
 * MATEMATYKA:
 * - Weight = f(speed) gdzie speed = alpha / loops
 * - Diversity = variance(knotResults)
 * - Final = Σ(result[i] × weight[i]) / Σ(weight[i]) + diversityBonus
 */

/**
 * MICRO KNOT - Pojedynczy knot czasowy
 */
class MicroKnot {
  constructor(config = {}) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.alpha = config.alpha || 0.5;      // Temporal jump strength
    this.beta = config.beta || 0.12;       // Spatial compression
    this.loops = config.loops || 4;        // Loop iterations
    this.mass = config.mass || 1.0;        // Mass (0.3-2.0) - cięższe knoty ciągną mocniej
    this.activation = (x) => Math.tanh(x);
    
    // SPEED (im wyższy alpha i niższy loops, tym szybszy)
    this.speed = this.alpha / this.loops;
    
    // MEMORY (cięższe knoty = trwalsza pamięć)
    this.memory = [];
    this.memoryDecay = 1.0 - (this.mass / 2.5);  // mass=2.0 → decay=0.2, mass=0.3 → decay=0.88
    
    // CHAOS (dla shake system)
    this.chaos = 0.0;
    this.baseChaoLevel = 0.1;
  }

  /**
   * TEMPORAL LOOP - Przetwarzanie przez pętlę czasową
   */
  temporalLoop(state, step) {
    // Szum czasowy
    const noise = Math.tanh(step * 1.7 + state * 0.07);
    
    // Skrócenie przestrzeni
    const shorten = Math.tanh(0.07 * state);
    
    // Przesunięcie w czasie
    const shifted = state + this.alpha * 0.15 + noise;
    
    // Aktywacja
    return this.activation(shifted);
  }

  /**
   * PROCESS - Przepuść stan przez pętlę N razy
   */
  process(inputState) {
    let state = Array.isArray(inputState) ? [...inputState] : [inputState];
    
    // Przepuść przez pętlę N razy
    for (let step = 0; step < this.loops; step++) {
      state = state.map(s => this.temporalLoop(s, step));
    }
    
    return state;
  }
}

/**
 * KNOT SYSTEM - Zarządza wieloma mikronotami
 */
class KnotSystem {
  constructor(ethicsCore, config = {}) {
    this.ethicsCore = ethicsCore;
    
    // KONFIGURACJA
    this.numKnots = config.numKnots || 8;  // 8-12 knotów
    this.diversityMultiplier = config.diversityMultiplier || 2.0;
    this.diversityThreshold = config.diversityThreshold || 0.1;
    
    // SHAKE SYSTEM
    this.shakeInterval = config.shakeInterval || 5;  // Co ile kroków shake
    this.shakeIntensity = config.shakeIntensity || 0.3;  // 30% knotów
    this.shakeMode = config.shakeMode || 'chaos';  // 'reset' lub 'chaos'
    this.stepCounter = 0;
    
    // PARALLEL ARMS
    this.numArms = config.numArms || 3;  // 3-4 ramiona
    this.arms = [];
    
    // KNOTY
    this.knots = [];
    
    // METRYKI
    this.metrics = {
      totalProcessed: 0,
      averageProcessingTime: 0,
      averageDiversity: 0,
      diversityBoosts: 0
    };
    
    // STAN
    this.systemState = {
      active: false,
      coherence: 1.0
    };
  }

  /**
   * INICJALIZACJA - Stwórz knoty z różnymi parametrami
   */
  async initialize() {
    console.log('🔗 Initializing Knot System...');
    
    // Etyczna walidacja
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'knot_system_initialization',
      description: `Initialize Knot System with ${this.numKnots} micro-knots`
    });
    
    if (!ethicalCheck.approved) {
      console.error('❌ Knot System initialization rejected by Ethics Core');
      return false;
    }
    
    // Stwórz knoty z różnymi parametrami + MASS
    this.knots = [];
    for (let i = 0; i < this.numKnots; i++) {
      // Mass distribution: ciężkie (2.0) → średnie (1.0) → lekkie (0.3)
      let mass;
      if (i < 2) {
        mass = 1.8 + (Math.random() * 0.4);  // Ciężkie: 1.8-2.2
      } else if (i < 5) {
        mass = 0.8 + (Math.random() * 0.4);  // Średnie: 0.8-1.2
      } else {
        mass = 0.3 + (Math.random() * 0.3);  // Lekkie: 0.3-0.6
      }
      
      const knot = new MicroKnot({
        id: `knot_${i}`,
        alpha: 0.4 + (i * 0.1),
        beta: 0.10 + (i * 0.02),
        loops: 3 + Math.floor(i / 2),
        mass: mass
      });
      
      this.knots.push(knot);
      
      console.log(`   Knot ${i}: alpha=${knot.alpha.toFixed(2)}, beta=${knot.beta.toFixed(2)}, loops=${knot.loops}, mass=${knot.mass.toFixed(2)}, speed=${knot.speed.toFixed(3)}`);
    }
    
    // Stwórz PARALLEL ARMS
    const knotsPerArm = Math.floor(this.numKnots / this.numArms);
    for (let i = 0; i < this.numArms; i++) {
      const startIdx = i * knotsPerArm;
      const endIdx = (i === this.numArms - 1) ? this.numKnots : (i + 1) * knotsPerArm;
      this.arms.push({
        id: `arm_${i}`,
        knots: this.knots.slice(startIdx, endIdx)
      });
      console.log(`   Arm ${i}: knots ${startIdx}-${endIdx - 1}`);
    }
    
    this.systemState.active = true;
    
    console.log('✅ Knot System initialized!');
    console.log(`   Total knots: ${this.knots.length}`);
    console.log(`   Diversity multiplier: ${this.diversityMultiplier}`);
    
    return true;
  }

  /**
   * PROCESS - Przetwórz input przez wszystkie knoty
   */
  async process(inputState) {
    const startTime = Date.now();
    
    console.log('🔗 Processing through Knot System...');
    
    this.stepCounter++;
    
    // SHAKE SYSTEM - co N kroków
    if (this.stepCounter % this.shakeInterval === 0) {
      this.performShake();
    }
    
    // 1. PRZETWÓRZ PRZEZ PARALLEL ARMS
    const armResults = this.arms.map(arm => {
      const knotResults = arm.knots.map(knot => {
        const result = knot.process(inputState);
        return {
          knotId: knot.id,
          speed: knot.speed,
          mass: knot.mass,
          result: result
        };
      });
      return {
        armId: arm.id,
        knotResults: knotResults
      };
    });
    
    // Flatten all knot results
    const knotResults = armResults.flatMap(ar => ar.knotResults);
    
    console.log(`   Processed through ${knotResults.length} knots`);
    
    // 2. OBLICZ WAGI (speed-based)
    const weights = this.calculateWeights(knotResults);
    
    console.log(`   Weights calculated (fastest knot weight: ${Math.max(...weights).toFixed(3)})`);
    
    // 3. WEIGHTED AGGREGATION
    const aggregated = this.weightedAggregation(knotResults, weights);
    
    // 4. OBLICZ DIVERSITY
    const diversity = this.calculateDiversity(knotResults);
    
    console.log(`   Diversity: ${diversity.toFixed(3)}`);
    
    // 5. DIVERSITY BONUS
    let diversityBonus = 0;
    if (diversity > this.diversityThreshold) {
      diversityBonus = diversity * this.diversityMultiplier;
      this.metrics.diversityBoosts++;
      console.log(`   🎯 Diversity bonus activated: +${diversityBonus.toFixed(3)}`);
    }
    
    // 6. FINAL RESULT
    const finalResult = aggregated.map(val => val + diversityBonus);
    
    // METRYKI
    const processingTime = Date.now() - startTime;
    this.metrics.totalProcessed++;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) + processingTime) / 
      this.metrics.totalProcessed;
    this.metrics.averageDiversity = 
      (this.metrics.averageDiversity * (this.metrics.totalProcessed - 1) + diversity) / 
      this.metrics.totalProcessed;
    
    console.log(`   ✅ Processing completed in ${processingTime}ms`);
    
    return {
      result: finalResult,
      knotResults: knotResults,
      weights: weights,
      diversity: diversity,
      diversityBonus: diversityBonus,
      processingTime: processingTime
    };
  }

  /**
   * CALCULATE WEIGHTS - Speed-based weights (najszybsze = największa waga)
   */
  calculateWeights(knotResults) {
    // Weight = speed^2 × mass (cięższe knoty ciągną DUŻO mocniej)
    const rawWeights = knotResults.map(kr => Math.pow(kr.speed, 2) * kr.mass);
    
    // Normalizacja (suma = 1.0)
    const sumWeights = rawWeights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = rawWeights.map(w => w / sumWeights);
    
    return normalizedWeights;
  }
  
  /**
   * PERFORM SHAKE - Wstrząs systemem (reset memory lub chaos boost)
   */
  performShake() {
    console.log('   🎲 SHAKE! Wstrząsanie systemem...');
    
    // Wybierz losowo N% knotów
    const numToShake = Math.floor(this.knots.length * this.shakeIntensity);
    const shuffled = [...this.knots].sort(() => Math.random() - 0.5);
    const toShake = shuffled.slice(0, numToShake);
    
    for (const knot of toShake) {
      if (this.shakeMode === 'reset') {
        // RESET MEMORY
        knot.memory = [];
        console.log(`      Reset memory: ${knot.id}`);
      } else {
        // CHAOS BOOST
        knot.chaos = knot.baseChaoLevel * 3.0;
        console.log(`      Chaos boost: ${knot.id} (chaos=${knot.chaos.toFixed(2)})`);
      }
    }
    
    console.log(`   🎲 Shaken ${toShake.length} knots`);
  }

  /**
   * WEIGHTED AGGREGATION - Łączenie wyników z wagami
   */
  weightedAggregation(knotResults, weights) {
    const numValues = knotResults[0].result.length;
    const aggregated = [];
    
    // Dla każdej wartości w wektorze
    for (let i = 0; i < numValues; i++) {
      let weightedSum = 0;
      let totalWeight = 0;
      
      // Weighted sum
      for (let j = 0; j < knotResults.length; j++) {
        weightedSum += knotResults[j].result[i] * weights[j];
        totalWeight += weights[j];
      }
      
      aggregated.push(weightedSum / totalWeight);
    }
    
    return aggregated;
  }

  /**
   * CALCULATE DIVERSITY - Jak bardzo knoty się różnią
   */
  calculateDiversity(knotResults) {
    const numValues = knotResults[0].result.length;
    let totalVariance = 0;
    
    // Dla każdej wartości w wektorze
    for (let i = 0; i < numValues; i++) {
      const values = knotResults.map(kr => kr.result[i]);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      totalVariance += variance;
    }
    
    // Średnia variance
    const avgVariance = totalVariance / numValues;
    
    return avgVariance;
  }

  /**
   * PROCESS PROBLEM - Przetwarzanie problemu przez Knot System
   */
  async processProblem(problem, context = {}) {
    console.log('🔗 Processing problem through Knot System...');
    
    // Konwersja problemu do stanu numerycznego
    const problemState = this.embedProblem(problem);
    
    // Przetwórz przez knot system
    const result = await this.process(problemState);
    
    // Dekoduj wynik
    const solution = this.decodeSolution(result.result, problem, context, result);
    
    return {
      problem,
      solution,
      knotAnalysis: {
        numKnots: this.knots.length,
        diversity: result.diversity,
        diversityBonus: result.diversityBonus,
        processingTime: result.processingTime,
        fastestKnot: this.knots.reduce((fastest, knot) => 
          knot.speed > fastest.speed ? knot : fastest
        ).id
      },
      confidence: this.calculateConfidence(result),
      timestamp: Date.now()
    };
  }

  /**
   * EMBED PROBLEM - Konwersja problemu do stanu numerycznego
   */
  embedProblem(problem) {
    const words = problem.split(' ');
    const state = [
      words.length / 100,
      problem.length / 1000,
      (problem.match(/\?/g) || []).length,
      (problem.match(/!/g) || []).length,
      Math.random()
    ];
    
    return state;
  }

  /**
   * DECODE SOLUTION - Dekodowanie wyniku
   */
  decodeSolution(state, problem, context, result) {
    const complexity = state[0];
    const intensity = state[1];
    const diversity = result.diversity;
    const diversityBonus = result.diversityBonus;
    
    let solution = '';
    
    if (diversity > this.diversityThreshold) {
      solution += `🎯 Multi-temporal analyse (${this.knots.length} perspectieven): `;
    }
    
    if (complexity > 0.5) {
      solution += 'Complex probleem met meerdere dimensies. ';
    }
    
    if (diversityBonus > 0) {
      solution += `Hoge diversiteit gedetecteerd (+${(diversityBonus * 100).toFixed(1)}% boost). `;
    }
    
    solution += 'Knot System heeft dit probleem gezien vanuit verschillende tijdperspectieven.';
    
    return solution;
  }

  /**
   * CALCULATE CONFIDENCE
   */
  calculateConfidence(result) {
    // Confidence = f(diversity) - wyższa diversity = wyższa confidence
    const diversityConfidence = Math.min(1.0, result.diversity * 5);
    
    return diversityConfidence;
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      active: this.systemState.active,
      numKnots: this.knots.length,
      knots: this.knots.map(k => ({
        id: k.id,
        alpha: k.alpha,
        beta: k.beta,
        loops: k.loops,
        speed: k.speed
      })),
      metrics: this.metrics,
      config: {
        diversityMultiplier: this.diversityMultiplier,
        diversityThreshold: this.diversityThreshold
      }
    };
  }

  /**
   * SHUTDOWN
   */
  async shutdown() {
    console.log('🔗 Shutting down Knot System...');
    this.systemState.active = false;
    console.log('✅ Knot System shut down');
  }
}

module.exports = { KnotSystem, MicroKnot };
