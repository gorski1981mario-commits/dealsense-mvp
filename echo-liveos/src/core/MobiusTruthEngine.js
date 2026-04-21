/**
 * MOBIUS TRUTH ENGINE - Pętla Möbiusa + Ekstrakcja Prawdy
 * Inspiracja: insight użytkownika o pętli Möbiusa i wagach prawdy
 * "System dostaje 10k tokenów, waży procent, który się powtarza i uznaje za prawdę"
 * 
 * To jest fundamentalne prawo uczenia się systemu!
 */

class MobiusTruthEngine {
  constructor() {
    this.truthWeights = new Map(); // temat → waga prawdy
    this.tokenBuffer = []; // bufor tokenów
    this.maxBufferSize = 10000; // 10k tokenów jak powiedziałeś
    this.truthThreshold = 0.7; // próg prawdy
    this.stabilityThreshold = 0.95; // próg stabilności
    this.mobiusCycle = 0;
    this.agents = []; // wielu agentów obserwujących z boku
    this.performanceMonitor = new Map(); // wydajność wag
  }

  async processTokens(tokens, topic) {
    // 1. Dodaj tokeny do bufora
    this.addToBuffer(tokens, topic);
    
    // 2. Jeśli bufor pełny, przetwarzaj
    if (this.tokenBuffer.length >= this.maxBufferSize) {
      return await this.processFullBuffer(topic);
    }
    
    return null; // jeszcze nie ma prawdy
  }

  addToBuffer(tokens, topic) {
    for (const token of tokens) {
      this.tokenBuffer.push({
        token,
        topic,
        timestamp: Date.now(),
        weight: 1.0
      });
    }
    
    // Ogranicz bufor
    if (this.tokenBuffer.length > this.maxBufferSize) {
      this.tokenBuffer = this.tokenBuffer.slice(-this.maxBufferSize);
    }
  }

  async processFullBuffer(topic) {
    console.log(`🔄 [MOBIUS CYCLE ${this.mobiusCycle}] Processing ${this.tokenBuffer.length} tokens for topic: ${topic}`);
    
    // 1. Oblicz wagi powtórzeń
    const repetitionWeights = this.calculateRepetitionWeights(topic);
    
    // 2. Wielu agentów obserwuje z boku
    const agentObservations = await this.multiAgentObservation(repetitionWeights);
    
    // 3. Sprawdź stabilność wag
    const stability = this.calculateStability(topic, repetitionWeights);
    
    // 4. Jeśli stabilne → nowa prawda
    if (stability > this.stabilityThreshold) {
      const newTruth = await this.establishNewTruth(topic, repetitionWeights, agentObservations);
      
      // 5. Pętla Möbiusa - ulepsz system
      await this.mobiusImprovement(newTruth);
      
      this.mobiusCycle++;
      return newTruth;
    }
    
    // 6. Jeśli niestabilne → kontynuuj obserwację
    return await this.continueObservation(topic, repetitionWeights);
  }

  calculateRepetitionWeights(topic) {
    // Twoja metoda: "waży procent, który się najbardziej powtarza"
    const tokenCounts = new Map();
    
    // Policz wystąpienia każdego tokena
    for (const item of this.tokenBuffer) {
      if (item.topic === topic) {
        const count = tokenCounts.get(item.token) || 0;
        tokenCounts.set(item.token, count + item.weight);
      }
    }
    
    // Konwertuj na procenty
    const totalTokens = Array.from(tokenCounts.values()).reduce((sum, count) => sum + count, 0);
    const weights = new Map();
    
    for (const [token, count] of tokenCounts) {
      const percentage = (count / totalTokens) * 100;
      weights.set(token, {
        count,
        percentage,
        weight: percentage / 100,
        isTruth: percentage > this.truthThreshold * 100
      });
    }
    
    // Sortuj po procentach
    const sorted = Array.from(weights.entries())
      .sort((a, b) => b[1].percentage - a[1].percentage);
    
    return {
      topic,
      totalTokens,
      weights: new Map(sorted),
      topCandidate: sorted[0],
      truthCandidates: sorted.filter(([_, data]) => data.isTruth)
    };
  }

  async multiAgentObservation(repetitionWeights) {
    // Wielu agentów obserwuje problem z różnych perspektyw
    const agents = [
      new SkepticAgent(),
      new OptimistAgent(),
      new AnalystAgent(),
      new EthicalAgent(),
      new PracticalAgent(),
      new CreativeAgent(),
      new HistoricalAgent(),
      futureAgent
    ];
    
    const observations = [];
    
    for (const agent of agents) {
      const observation = await agent.observe(repetitionWeights);
      observations.push({
        agent: agent.name,
        perspective: observation.perspective,
        confidence: observation.confidence,
        modification: observation.modification,
        reasoning: observation.reasoning
      });
    }
    
    return observations;
  }

  calculateStability(topic, currentWeights) {
    // Sprawdź czy wagi się zmieniają czy są stabilne
    const previousWeights = this.truthWeights.get(topic);
    
    if (!previousWeights) {
      return 0; // brak poprzednich wag
    }
    
    // Porównaj aktualne i poprzednie wagi
    let totalChange = 0;
    let comparisons = 0;
    
    for (const [token, currentData] of currentWeights.weights) {
      const previousData = previousWeights.get(token);
      
      if (previousData) {
        const change = Math.abs(currentData.percentage - previousData.percentage);
        totalChange += change;
        comparisons++;
      }
    }
    
    if (comparisons === 0) return 0;
    
    const averageChange = totalChange / comparisons;
    const stability = 1 - (averageChange / 100); // odwrócenie: mniej zmian = więcej stabilności
    
    return stability;
  }

  async establishNewTruth(topic, repetitionWeights, agentObservations) {
    // Ustanów nową prawdę
    const topCandidate = repetitionWeights.topCandidate;
    
    // Waż agentów w decyzji
    const agentWeight = this.calculateAgentWeight(agentObservations);
    
    // Ostateczna waga prawdy
    const finalWeight = (topCandidate[1].percentage + agentWeight) / 2;
    
    const newTruth = {
      topic,
      truth: topCandidate[0],
      weight: finalWeight / 100,
      confidence: Math.min(1.0, finalWeight / 100),
      established: Date.now(),
      cycle: this.mobiusCycle,
      supportingData: {
        repetitionPercentage: topCandidate[1].percentage,
        agentConsensus: agentWeight,
        tokenCount: topCandidate[1].count,
        totalTokens: repetitionWeights.totalTokens
      },
      agentObservations,
      isDefinitive: finalWeight > 0.9 // 90%+ = ostateczna prawda
    };
    
    // Zapisz prawdę
    this.truthWeights.set(topic, new Map(repetitionWeights.weights));
    
    console.log(`🎯 NEW TRUTH ESTABLISHED: "${newTruth.truth}" with weight ${newTruth.weight}`);
    
    return newTruth;
  }

  calculateAgentWeight(observations) {
    // Oblicz wagę agentów
    let totalWeight = 0;
    let supportCount = 0;
    
    for (const observation of observations) {
      if (observation.modification > 0) { // agent wspiera
        totalWeight += observation.confidence;
        supportCount++;
      }
    }
    
    if (supportCount === 0) return 0;
    
    return (totalWeight / supportCount) * 100; // konwertuj na procenty
  }

  async continueObservation(topic, repetitionWeights) {
    // Kontynuuj obserwację - modyfikuj wagi
    const modifications = await this.applyModifications(repetitionWeights);
    
    // Zapisz zmodyfikowane wagi
    this.truthWeights.set(topic, new Map(modifications));
    
    return {
      status: 'observing',
      topic,
      cycle: this.mobiusCycle,
      modifications: modifications.length,
      nextCycle: this.mobiusCycle + 1
    };
  }

  async applyModifications(repetitionWeights) {
    // Zastosuj modyfikacje od agentów
    const modified = new Map(repetitionWeights.weights);
    
    for (const observation of this.agents) {
      if (observation.modification > 0) {
        // Zwiększ wagę wspieranych tokenów
        for (const token of observation.supportedTokens) {
          const current = modified.get(token);
          if (current) {
            current.weight *= (1 + observation.modification);
            current.percentage *= (1 + observation.modification);
          }
        }
      }
    }
    
    return modified;
  }

  async mobiusImprovement(newTruth) {
    // Pętla Möbiusa - system uczy się z nowej prawdy
    console.log(`🔄 Mobius improvement for truth: ${newTruth.truth}`);
    
    // 1. Aktualizuj wydajność systemu
    this.updatePerformanceMetrics(newTruth);
    
    // 2. Optymalizuj przyszłe przetwarzanie
    await this.optimizeFutureProcessing(newTruth);
    
    // 3. Podziel się prawdą z innymi modułami
    await this.shareTruth(newTruth);
    
    // 4. Przygotuj na następny cykl
    this.prepareNextCycle();
  }

  updatePerformanceMetrics(newTruth) {
    // Monitoruj wydajność ekstrakcji prawdy
    const topic = newTruth.topic;
    
    if (!this.performanceMonitor.has(topic)) {
      this.performanceMonitor.set(topic, {
        truthsEstablished: 0,
        averageWeight: 0,
        cycles: 0,
        efficiency: 0
      });
    }
    
    const metrics = this.performanceMonitor.get(topic);
    metrics.truthsEstablished++;
    metrics.averageWeight = (metrics.averageWeight + newTruth.weight) / 2;
    metrics.cycles = this.mobiusCycle;
    metrics.efficiency = metrics.truthsEstablished / metrics.cycles;
  }

  async optimizeFutureProcessing(newTruth) {
    // Optymalizuj przyszłe przetwarzanie na podstawie nowej prawdy
    // TODO: Implement optimization logic
  }

  async shareTruth(newTruth) {
    // Podziel się prawdą z innymi modułami ECHO
    console.log(`📡 Sharing truth: ${newTruth.truth} with other modules`);
  }

  prepareNextCycle() {
    // Przygotuj system na następny cykl
    this.tokenBuffer = []; // wyczyść bufor
    this.mobiusCycle++;
  }

  // Agent obserwujący z boku
  async createSideAgent(problem, perspective) {
    return {
      id: Date.now() + Math.random(),
      problem,
      perspective,
      observations: [],
      confidence: 0.5,
      lastUpdate: Date.now()
    };
  }

  async observeFromMultiplePerspectives(problem) {
    // Twój pomysł: "wielu agentów stoi z boku i przygląda się problemowi"
    const perspectives = [
      'logical', 'emotional', 'practical', 'ethical', 'creative',
      'historical', 'future', 'systemic', 'detailed', 'global'
    ];
    
    const agents = [];
    
    for (const perspective of perspectives) {
      const agent = await this.createSideAgent(problem, perspective);
      agents.push(agent);
    }
    
    return agents;
  }

  getTruth(topic) {
    const weights = this.truthWeights.get(topic);
    if (!weights) return null;
    
    // Zwróć top kandydata na prawdę
    const sorted = Array.from(weights.entries())
      .sort((a, b) => b[1].percentage - a[1].percentage);
    
    return sorted[0];
  }

  getAllTruths() {
    const allTruths = {};
    
    for (const [topic, weights] of this.truthWeights) {
      const top = this.getTruth(topic);
      if (top) {
        allTruths[topic] = {
          truth: top[0],
          weight: top[1].weight,
          confidence: top[1].confidence
        };
      }
    }
    
    return allTruths;
  }

  async initialize() {
    console.log('🔄 Mobius Truth Engine initialized - ready to extract truth from tokens');
  }

  async stop() {
    console.log('⏹️ Mobius Truth Engine stopped');
  }

  getStatus() {
    return {
      cycle: this.mobiusCycle,
      bufferSize: this.tokenBuffer.length,
      truthCount: this.truthWeights.size,
      performanceMetrics: Object.fromEntries(this.performanceMonitor),
      truthThreshold: this.truthThreshold,
      stabilityThreshold: this.stabilityThreshold
    };
  }
}

// AGENT OBERSWATORÓW

class SkepticAgent {
  constructor() {
    this.name = 'skeptic';
  }

  async observe(repetitionWeights) {
    // Sceptyczny agent - szuka dziur w logice
    const topCandidate = repetitionWeights.topCandidate;
    
    return {
      perspective: 'skeptic',
      confidence: 0.3, // niska ufność
      modification: topCandidate[1].percentage > 80 ? -0.1 : 0.1,
      reasoning: 'This seems too good to be true',
      supportedTokens: []
    };
  }
}

class OptimistAgent {
  constructor() {
    this.name = 'optimist';
  }

  async observe(repetitionWeights) {
    // Optymistyczny agent - widzi możliwości
    const topCandidate = repetitionWeights.topCandidate;
    
    return {
      perspective: 'optimist',
      confidence: 0.8,
      modification: 0.2,
      reasoning: 'This looks promising!',
      supportedTokens: [topCandidate[0]]
    };
  }
}

class AnalystAgent {
  constructor() {
    this.name = 'analyst';
  }

  async observe(repetitionWeights) {
    // Analityk - patrzy na dane
    const variance = this.calculateVariance(repetitionWeights);
    
    return {
      perspective: 'analytical',
      confidence: 0.7,
      modification: variance < 0.1 ? 0.15 : 0.05,
      reasoning: `Data variance is ${variance}`,
      supportedTokens: variance < 0.1 ? [repetitionWeights.topCandidate[0]] : []
    };
  }

  calculateVariance(weights) {
    // Oblicz wariancję wag
    const percentages = Array.from(weights.weights.values()).map(w => w.percentage);
    const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    
    const variance = percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / percentages.length;
    return variance;
  }
}

class EthicalAgent {
  constructor() {
    this.name = 'ethical';
  }

  async observe(repetitionWeights) {
    // Etyczny agent - ocenia moralność
    const topCandidate = repetitionWeights.topCandidate;
    const isEthical = this.evaluateEthics(topCandidate[0]);
    
    return {
      perspective: 'ethical',
      confidence: 0.9,
      modification: isEthical ? 0.25 : -0.3,
      reasoning: isEthical ? 'This aligns with ethical principles' : 'This raises ethical concerns',
      supportedTokens: isEthical ? [topCandidate[0]] : []
    };
  }

  evaluateEthics(token) {
    // Prosta ocena etyczna
    const unethical = ['harm', 'damage', 'exploit', 'manipulate'];
    const tokenLower = token.toLowerCase();
    
    return !unethical.some(word => tokenLower.includes(word));
  }
}

class PracticalAgent {
  constructor() {
    this.name = 'practical';
  }

  async observe(repetitionWeights) {
    // Praktyczny agent - czy da się wdrożyć?
    const topCandidate = repetitionWeights.topCandidate;
    const isPractical = this.evaluatePracticality(topCandidate[0]);
    
    return {
      perspective: 'practical',
      confidence: 0.6,
      modification: isPractical ? 0.1 : -0.1,
      reasoning: isPractical ? 'This is practical' : 'This seems impractical',
      supportedTokens: isPractical ? [topCandidate[0]] : []
    };
  }

  evaluatePracticality(token) {
    // Prosta ocena praktyczności
    const impractical = ['impossible', 'unrealistic', 'theoretical'];
    const tokenLower = token.toLowerCase();
    
    return !impractical.some(word => tokenLower.includes(word));
  }
}

class CreativeAgent {
  constructor() {
    this.name = 'creative';
  }

  async observe(repetitionWeights) {
    // Kreatywny agent - szuka innowacji
    const novelty = this.calculateNovelty(repetitionWeights);
    
    return {
      perspective: 'creative',
      confidence: 0.5,
      modification: novelty > 0.7 ? 0.2 : 0.05,
      reasoning: `Novelty score: ${novelty}`,
      supportedTokens: novelty > 0.7 ? [repetitionWeights.topCandidate[0]] : []
    };
  }

  calculateNovelty(weights) {
    // Oblicz nowość
    const uniqueTokens = weights.weights.size;
    const totalTokens = weights.totalTokens;
    
    return uniqueTokens / totalTokens;
  }
}

class HistoricalAgent {
  constructor() {
    this.name = 'historical';
  }

  async observe(repetitionWeights) {
    // Historyczny agent - porównuje z przeszłością
    const topCandidate = repetitionWeights.topCandidate;
    const hasHistoricalPrecedent = this.checkHistory(topCandidate[0]);
    
    return {
      perspective: 'historical',
      confidence: 0.7,
      modification: hasHistoricalPrecedent ? 0.15 : 0.0,
      reasoning: hasHistoricalPrecedent ? 'This has worked before' : 'This is unprecedented',
      supportedTokens: hasHistoricalPrecedent ? [topCandidate[0]] : []
    };
  }

  checkHistory(token) {
    // Sprawdź historyczne precedenty
    // TODO: Implement historical check
    return Math.random() > 0.5; // placeholder
  }
}

const futureAgent = {
  name: 'future',
  async observe(repetitionWeights) {
    // Agent przyszłościowy - patrzy w przyszłość
    const topCandidate = repetitionWeights.topCandidate;
    const futurePotential = this.evaluateFuturePotential(topCandidate[0]);
    
    return {
      perspective: 'future',
      confidence: 0.6,
      modification: futurePotential > 0.8 ? 0.2 : 0.05,
      reasoning: `Future potential: ${futurePotential}`,
      supportedTokens: futurePotential > 0.8 ? [topCandidate[0]] : []
    };
  },

  evaluateFuturePotential(token) {
    // Oceń potencjał przyszłościowy
    const futureKeywords = ['growth', 'scalable', 'sustainable', 'innovative'];
    const tokenLower = token.toLowerCase();
    
    const matches = futureKeywords.filter(keyword => tokenLower.includes(keyword));
    return matches.length / futureKeywords.length;
  }
};

module.exports = MobiusTruthEngine;
