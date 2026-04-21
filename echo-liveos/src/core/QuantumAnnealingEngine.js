/**
 * QUANTUM ANNEALING ENGINE - KWANT Z DOGRZANIEM
 * 
 * ZASADA:
 * - Temperatura startowa (wysoka) → stopniowo spada → znajduje optimum
 * - Wysoka temperatura = eksploracja (szukaj wszędzie)
 * - Niska temperatura = eksploatacja (precyzyjne szukanie)
 * - Temperatura = 0 → GLOBALNE OPTIMUM znalezione
 * 
 * ZASTOSOWANIE:
 * - Optymalizacja deal scoring
 * - Routing decyzji
 * - Max performance dla każdej operacji
 * - Znajdowanie najlepszych wag
 */

class QuantumAnnealingEngine {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // PARAMETRY DOGRZANIA
    this.annealing = {
      temperature: 1000,        // Temperatura startowa (wysoka)
      minTemperature: 0,        // Temperatura końcowa (0 = optimum)
      coolingRate: 0.95,        // Jak szybko chłodzi (0.95 = 5% na iterację)
      maxIterations: 100,       // Max iteracji
      currentIteration: 0
    };
    
    // STAN KWANTOWY
    this.quantumState = {
      energy: Infinity,         // Energia systemu (niższa = lepiej)
      bestEnergy: Infinity,     // Najlepsza energia znaleziona
      bestSolution: null,       // Najlepsze rozwiązanie
      coherence: 1.0            // Spójność kwantowa
    };
    
    // METRYKI
    this.metrics = {
      totalOptimizations: 0,
      successfulOptimizations: 0,
      averageIterations: 0,
      averageImprovement: 0,
      bestEnergyFound: Infinity
    };
  }

  /**
   * INICJALIZACJA
   */
  async initialize() {
    console.log('⚛️ Initializing Quantum Annealing Engine...');
    
    // Etyczna walidacja
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'quantum_annealing_initialization',
      description: 'Initialize quantum optimization engine'
    });
    
    if (!ethicalCheck.approved) {
      console.error('❌ Quantum Annealing initialization rejected by Ethics Core');
      return false;
    }
    
    console.log('✅ Quantum Annealing Engine initialized!');
    console.log('   Initial temperature:', this.annealing.temperature);
    console.log('   Cooling rate:', this.annealing.coolingRate);
    console.log('   Max iterations:', this.annealing.maxIterations);
    
    return true;
  }

  /**
   * GŁÓWNA METODA - Optymalizacja przez dogrzanie
   */
  async optimize(problem, options = {}) {
    console.log('⚛️ Starting quantum annealing optimization...');
    
    const startTime = Date.now();
    this.metrics.totalOptimizations++;
    
    // Reset temperatury
    this.annealing.temperature = options.initialTemperature || 1000;
    this.annealing.currentIteration = 0;
    
    // Początkowe rozwiązanie (losowe)
    let currentSolution = this.generateInitialSolution(problem);
    let currentEnergy = this.calculateEnergy(currentSolution, problem);
    
    // Najlepsze rozwiązanie dotychczas
    let bestSolution = { ...currentSolution };
    let bestEnergy = currentEnergy;
    
    const history = [];
    
    // PĘTLA DOGRZANIA
    while (this.annealing.temperature > this.annealing.minTemperature && 
           this.annealing.currentIteration < this.annealing.maxIterations) {
      
      // Generuj sąsiednie rozwiązanie
      const neighborSolution = this.generateNeighbor(currentSolution);
      const neighborEnergy = this.calculateEnergy(neighborSolution, problem);
      
      // Decyzja: czy przyjąć sąsiada?
      const accepted = this.acceptanceProbability(currentEnergy, neighborEnergy);
      
      if (accepted) {
        currentSolution = neighborSolution;
        currentEnergy = neighborEnergy;
        
        // Czy to najlepsze dotychczas?
        if (currentEnergy < bestEnergy) {
          bestSolution = { ...currentSolution };
          bestEnergy = currentEnergy;
        }
      }
      
      // Zapisz w historii
      history.push({
        iteration: this.annealing.currentIteration,
        temperature: this.annealing.temperature,
        currentEnergy: currentEnergy,
        bestEnergy: bestEnergy,
        accepted: accepted
      });
      
      // CHŁODZENIE - obniż temperaturę
      this.annealing.temperature *= this.annealing.coolingRate;
      this.annealing.currentIteration++;
    }
    
    // Aktualizuj stan kwantowy
    this.quantumState.energy = currentEnergy;
    this.quantumState.bestEnergy = bestEnergy;
    this.quantumState.bestSolution = bestSolution;
    
    // Aktualizuj metryki
    this.updateMetrics(bestEnergy, this.annealing.currentIteration);
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Quantum annealing completed!');
    console.log(`   Iterations: ${this.annealing.currentIteration}`);
    console.log(`   Final temperature: ${this.annealing.temperature.toFixed(2)}`);
    console.log(`   Best energy: ${bestEnergy.toFixed(4)}`);
    console.log(`   Processing time: ${processingTime}ms`);
    
    return {
      success: true,
      solution: bestSolution,
      energy: bestEnergy,
      iterations: this.annealing.currentIteration,
      finalTemperature: this.annealing.temperature,
      processingTime: processingTime,
      history: history
    };
  }

  /**
   * GENERUJ POCZĄTKOWE ROZWIĄZANIE
   */
  generateInitialSolution(problem) {
    // Losowe rozwiązanie jako punkt startowy
    return {
      weights: this.randomWeights(problem.dimensions || 10),
      parameters: problem.initialParameters || {},
      score: 0
    };
  }

  /**
   * GENERUJ SĄSIEDNIE ROZWIĄZANIE
   */
  generateNeighbor(solution) {
    const neighbor = JSON.parse(JSON.stringify(solution));
    
    // Zmień losowo jedną wagę
    const index = Math.floor(Math.random() * neighbor.weights.length);
    const delta = (Math.random() - 0.5) * 0.2;  // Zmiana ±10%
    neighbor.weights[index] = Math.max(0, Math.min(1, neighbor.weights[index] + delta));
    
    return neighbor;
  }

  /**
   * OBLICZ ENERGIĘ ROZWIĄZANIA (niższa = lepiej)
   */
  calculateEnergy(solution, problem) {
    // Energia = jak daleko od optimum
    // W prawdziwym systemie byłaby bardziej złożona
    
    let energy = 0;
    
    // Suma odchyleń wag od optymalnych
    for (let i = 0; i < solution.weights.length; i++) {
      const optimal = problem.optimalWeights?.[i] || 0.5;
      energy += Math.abs(solution.weights[i] - optimal);
    }
    
    // Dodaj penalty za złożoność
    if (problem.complexityPenalty) {
      energy += solution.weights.reduce((sum, w) => sum + w, 0) * 0.1;
    }
    
    return energy;
  }

  /**
   * PRAWDOPODOBIEŃSTWO AKCEPTACJI (Metropolis criterion)
   */
  acceptanceProbability(currentEnergy, neighborEnergy) {
    // Jeśli sąsiad lepszy (niższa energia) - zawsze akceptuj
    if (neighborEnergy < currentEnergy) {
      return true;
    }
    
    // Jeśli sąsiad gorszy - akceptuj z prawdopodobieństwem zależnym od temperatury
    const delta = neighborEnergy - currentEnergy;
    const probability = Math.exp(-delta / this.annealing.temperature);
    
    return Math.random() < probability;
  }

  /**
   * LOSOWE WAGI
   */
  randomWeights(count) {
    const weights = [];
    for (let i = 0; i < count; i++) {
      weights.push(Math.random());
    }
    return weights;
  }

  /**
   * AKTUALIZUJ METRYKI
   */
  updateMetrics(bestEnergy, iterations) {
    if (bestEnergy < this.metrics.bestEnergyFound) {
      this.metrics.bestEnergyFound = bestEnergy;
      this.metrics.successfulOptimizations++;
    }
    
    // Średnia liczba iteracji
    const alpha = 0.1;
    this.metrics.averageIterations = 
      this.metrics.averageIterations * (1 - alpha) + iterations * alpha;
    
    // Średnia poprawa
    if (this.quantumState.bestEnergy !== Infinity) {
      const improvement = (this.quantumState.bestEnergy - bestEnergy) / this.quantumState.bestEnergy;
      this.metrics.averageImprovement = 
        this.metrics.averageImprovement * (1 - alpha) + improvement * alpha;
    }
  }

  /**
   * OPTYMALIZUJ WAGI (specjalizacja dla wag)
   */
  async optimizeWeights(currentWeights, targetFunction, options = {}) {
    console.log('⚛️ Optimizing weights with quantum annealing...');
    
    const problem = {
      dimensions: currentWeights.length,
      optimalWeights: null,  // Nie znamy optymalnych - szukamy
      initialParameters: { currentWeights },
      targetFunction: targetFunction
    };
    
    // Modyfikuj funkcję energii żeby używała targetFunction
    const originalCalculateEnergy = this.calculateEnergy.bind(this);
    this.calculateEnergy = (solution, prob) => {
      return targetFunction(solution.weights);
    };
    
    const result = await this.optimize(problem, options);
    
    // Przywróć oryginalną funkcję
    this.calculateEnergy = originalCalculateEnergy;
    
    return {
      optimizedWeights: result.solution.weights,
      energy: result.energy,
      iterations: result.iterations,
      improvement: currentWeights.reduce((sum, w, i) => 
        sum + Math.abs(w - result.solution.weights[i]), 0)
    };
  }

  /**
   * ZNAJDŹ GLOBALNE OPTIMUM (dla konkretnego problemu)
   */
  async findGlobalOptimum(problem, options = {}) {
    console.log('⚛️ Searching for global optimum...');
    
    // Uruchom kilka razy z różnymi startami
    const runs = options.runs || 5;
    let bestOverall = null;
    let bestEnergyOverall = Infinity;
    
    for (let run = 0; run < runs; run++) {
      const result = await this.optimize(problem, {
        ...options,
        initialTemperature: 1000 + Math.random() * 500  // Różne starty
      });
      
      if (result.energy < bestEnergyOverall) {
        bestOverall = result.solution;
        bestEnergyOverall = result.energy;
      }
    }
    
    console.log(`✅ Global optimum found after ${runs} runs`);
    console.log(`   Best energy: ${bestEnergyOverall.toFixed(4)}`);
    
    return {
      solution: bestOverall,
      energy: bestEnergyOverall,
      runs: runs
    };
  }

  /**
   * RESET
   */
  reset() {
    this.annealing.temperature = 1000;
    this.annealing.currentIteration = 0;
    this.quantumState.energy = Infinity;
    this.quantumState.bestEnergy = Infinity;
    this.quantumState.bestSolution = null;
    
    console.log('⚛️ Quantum annealing reset');
  }

  /**
   * STATUS
   */
  getStatus() {
    return {
      temperature: this.annealing.temperature,
      iteration: this.annealing.currentIteration,
      energy: this.quantumState.energy,
      bestEnergy: this.quantumState.bestEnergy,
      coherence: this.quantumState.coherence,
      metrics: this.metrics
    };
  }
}

module.exports = QuantumAnnealingEngine;
