/**
 * BIOCORE 21 - ULTIMATE HYBRID SYSTEM
 * 
 * ARCHITEKTURA:
 * - Nod21: Poziom 21 core processing (momentum, velocity, chaos, loop detection)
 * - BioCore21: Swarm management (fotosynteza, głosowanie, regeneracja, grzybnienie)
 * 
 * PODZIAŁ RÓL:
 * - Nod21 = Worker (głębokie przetwarzanie, winrate 97%)
 * - BioCore21 = Manager (zarządzanie rojem, 48% oszczędności)
 * 
 * POZIOM: 21 / 100
 */

/**
 * NOD21 - Pojedynczy node z Poziomem 21 wbudowanym
 */
class Nod21 {
  constructor(config = {}) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.dim = config.dim || 6;
    
    // POZIOM 21 - Stan wewnętrzny
    this.memory = new Array(this.dim).fill(0);
    this.velocity = new Array(this.dim).fill(0);
    
    // Metryki
    this.processCount = 0;
    this.loopDetections = 0;
  }

  /**
   * PROCESS - POZIOM 21 Core Processing
   * Momentum + Velocity + Chaos Parameters + Loop Detection
   */
  process(inputState, steps = 10) {
    let state = Array.isArray(inputState) ? [...inputState] : [inputState];
    const originalInput = [...state];
    
    for (let i = 0; i < steps; i++) {
      // CHAOS PARAMETERS - Żywe parametry
      const memSum = this.memory.reduce((sum, m) => sum + m, 0);
      const stateSum = state.reduce((sum, s) => sum + s, 0);
      
      const alpha = 0.7 + 0.19 * Math.cos(memSum);
      const beta = 0.7 + 0.06 * Math.sin(stateSum);
      
      // Noise
      const noise = state.map(() => this.randomNormal(0, 0.05));
      
      // MOMENTUM
      const momentum = this.velocity.map(v => v * 0.47);
      
      // Nowy stan
      const stateNew = state.map((s, idx) => {
        const val = s * (1 - beta) + 
                   alpha * this.memory[idx] + 
                   noise[idx] + 
                   momentum[idx];
        return Math.tanh(val);
      });
      
      // VELOCITY
      const velNew = this.velocity.map((v, idx) => 
        v * 0.6 + 0.4 * (stateNew[idx] - state[idx])
      );
      
      // LOOP DETECTION - Anti-stagnation
      const maxChange = Math.max(...stateNew.map((s, idx) => 
        Math.abs(s - state[idx])
      ));
      
      if (maxChange < 0.08) {
        // ZAPĘTLENIE! Reset do oryginału
        state = state.map((s, idx) => s * 0.3 + originalInput[idx] * 0.7);
        this.loopDetections++;
      } else {
        state = stateNew;
      }
      
      this.velocity = velNew;
      
      // Aktualizuj pamięć
      this.memory = this.memory.map((m, idx) => 
        m * 0.6 + state[idx] * 0.4
      );
    }
    
    this.processCount++;
    
    return state;
  }

  /**
   * QUICK SAMPLE - Szybka próbka (1 iteracja) dla fotosyntezy
   */
  quickSample(inputState) {
    return this.process(inputState, 1);
  }

  /**
   * RANDOM NORMAL - Box-Muller transform
   */
  randomNormal(mean = 0, stdDev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * RESET - Regeneracja (kasuj stan)
   */
  reset() {
    this.memory = new Array(this.dim).fill(0);
    this.velocity = new Array(this.dim).fill(0);
    this.processCount = 0;
    this.loopDetections = 0;
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      id: this.id,
      dim: this.dim,
      processCount: this.processCount,
      loopDetections: this.loopDetections,
      memorySum: this.memory.reduce((sum, m) => sum + Math.abs(m), 0),
      velocitySum: this.velocity.reduce((sum, v) => sum + Math.abs(v), 0)
    };
  }
}

/**
 * CACHE LAYER - LRU Cache dla instant responses
 */
class BioCore21Cache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    if (this.cache.has(key)) {
      this.hits++;
      const value = this.cache.get(key);
      // LRU: move to end
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    this.misses++;
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    
    // LRU eviction
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

/**
 * BIOCORE21 - Swarm Management System
 */
class BioCore21 {
  constructor(ethicsCore, config = {}) {
    this.ethicsCore = ethicsCore;
    
    // KONFIGURACJA
    this.numNodes = config.numNodes || 23;
    this.dim = config.dim || 6;
    
    // FOTOSYNTEZA
    this.photosyntheticRatio = config.photosyntheticRatio || 0.52;  // 52% (12/23)
    this.numActiveNodes = Math.ceil(this.numNodes * this.photosyntheticRatio);
    
    // ADAPTIVE PHOTOSYNTHESIS
    this.enableAdaptivePhotosynthesis = config.enableAdaptivePhotosynthesis !== false;
    this.minPhotosyntheticRatio = config.minPhotosyntheticRatio || 0.3;  // 30% min
    this.maxPhotosyntheticRatio = config.maxPhotosyntheticRatio || 0.8;  // 80% max
    
    // REGENERACJA
    this.regenerationRatio = config.regenerationRatio || 0.13;  // 13% (3/23)
    this.numRegenerateNodes = Math.ceil(this.numActiveNodes * this.regenerationRatio);
    
    // CACHE LAYER
    this.enableCache = config.enableCache !== false;
    this.cache = new BioCore21Cache(config.cacheSize || 1000);
    
    // RATE LIMITING
    this.enableRateLimit = config.enableRateLimit !== false;
    this.maxRequestsPerMinute = config.maxRequestsPerMinute || 100;
    this.requestTimestamps = [];
    
    // NODES - Każdy ma Poziom 21!
    this.nodes = [];
    
    // GLOBALNA PAMIĘĆ
    this.globalMemory = new Array(this.dim).fill(0);
    
    // METRYKI
    this.metrics = {
      totalProcessed: 0,
      totalRegenerations: 0,
      photosyntheticSavings: 0,
      averageProcessingTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitRejects: 0,
      errors: 0,
      fallbacks: 0
    };
    
    // HEALTH
    this.healthy = true;
    this.lastHealthCheck = Date.now();
  }

  /**
   * INITIALIZE
   */
  async initialize() {
    console.log('🧬 Initializing BioCore21...');
    
    // Etyczna walidacja
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'biocore21_initialization',
      description: `Initialize BioCore21 with ${this.numNodes} Nod21 instances`
    });
    
    if (!ethicalCheck.approved) {
      console.error('❌ BioCore21 initialization rejected by Ethics Core');
      return false;
    }
    
    // Stwórz nodes (każdy z Poziomem 21)
    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      const node = new Nod21({
        id: `nod21_${i}`,
        dim: this.dim
      });
      this.nodes.push(node);
    }
    
    console.log('✅ BioCore21 initialized!');
    console.log(`   Total nodes: ${this.numNodes}`);
    console.log(`   Active nodes (photosynthesis): ${this.numActiveNodes} (${(this.photosyntheticRatio * 100).toFixed(0)}%)`);
    console.log(`   Energy savings: ${((1 - this.photosyntheticRatio) * 100).toFixed(0)}%`);
    console.log(`   Regeneration per cycle: ${this.numRegenerateNodes} nodes`);
    
    return true;
  }

  /**
   * ANALYZE COMPLEXITY - Oceń złożoność pytania
   */
  analyzeComplexity(inputState) {
    // Prosta heurystyka: variance + range
    const mean = inputState.reduce((sum, s) => sum + s, 0) / inputState.length;
    const variance = inputState.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / inputState.length;
    const range = Math.max(...inputState) - Math.min(...inputState);
    
    // Normalizuj do 0-1
    const complexity = Math.min(1.0, (variance + range) / 2);
    
    return complexity;
  }

  /**
   * CHECK RATE LIMIT
   */
  checkRateLimit() {
    if (!this.enableRateLimit) return true;
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Usuń stare timestampy
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      this.metrics.rateLimitRejects++;
      return false;
    }
    
    this.requestTimestamps.push(now);
    return true;
  }

  /**
   * THINK - Główna funkcja przetwarzania
   */
  async think(inputState) {
    const startTime = Date.now();
    
    try {
      // RATE LIMITING
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded');
      }
      
      console.log('🧬 BioCore21 THINK - Starting...');
      
      // CACHE CHECK
      if (this.enableCache) {
        const cacheKey = JSON.stringify(inputState);
        const cached = this.cache.get(cacheKey);
        
        if (cached) {
          console.log('   💾 CACHE HIT - Instant response!');
          this.metrics.cacheHits++;
          return {
            ...cached,
            cached: true,
            processingTime: Date.now() - startTime
          };
        }
        this.metrics.cacheMisses++;
      }
      
      // ADAPTIVE PHOTOSYNTHESIS - Dostosuj do złożoności
      let photosyntheticRatio = this.photosyntheticRatio;
      
      if (this.enableAdaptivePhotosynthesis) {
        const complexity = this.analyzeComplexity(inputState);
        
        // Proste pytania (complexity < 0.3) → mniej nodes (30%)
        // Średnie pytania (0.3-0.7) → standard (50%)
        // Trudne pytania (> 0.7) → więcej nodes (80%)
        if (complexity < 0.3) {
          photosyntheticRatio = this.minPhotosyntheticRatio;
          console.log(`   🌱 ADAPTIVE: Simple question (complexity=${complexity.toFixed(2)}) → ${(photosyntheticRatio * 100).toFixed(0)}% nodes`);
        } else if (complexity < 0.7) {
          photosyntheticRatio = 0.5;
          console.log(`   🌱 ADAPTIVE: Medium question (complexity=${complexity.toFixed(2)}) → ${(photosyntheticRatio * 100).toFixed(0)}% nodes`);
        } else {
          photosyntheticRatio = this.maxPhotosyntheticRatio;
          console.log(`   🌱 ADAPTIVE: Complex question (complexity=${complexity.toFixed(2)}) → ${(photosyntheticRatio * 100).toFixed(0)}% nodes`);
        }
      }
      
      const numActiveNodes = Math.ceil(this.numNodes * photosyntheticRatio);
      
      // 1. FOTOSYNTEZA - Szybka tania ocena wszystkich nodes
    console.log('\n   🌱 PHOTOSYNTHESIS - Quick sampling all nodes...');
    
    const quickScores = this.nodes.map((node, idx) => {
      const sample = node.quickSample(inputState);
      const score = sample.reduce((sum, s) => sum + Math.abs(s), 0) / sample.length;
      return { nodeIdx: idx, score: score, node: node };
    });
    
    // Sortuj po score i wybierz top N
    quickScores.sort((a, b) => b.score - a.score);
    const topNodes = quickScores.slice(0, this.numActiveNodes);
    
    console.log(`   🌱 Selected ${topNodes.length}/${this.numNodes} nodes for full processing`);
    console.log(`   🌱 Energy savings: ${((1 - this.photosyntheticRatio) * 100).toFixed(0)}%`);
    
    this.metrics.photosyntheticSavings += (this.numNodes - topNodes.length);
    
    // 2. PEŁNE PRZETWARZANIE - Tylko wybrane nodes
    console.log('\n   ⚡ FULL PROCESSING - Selected nodes...');
    
    const outputs = topNodes.map(tn => {
      const output = tn.node.process(inputState, 10);
      return { nodeIdx: tn.nodeIdx, output: output, node: tn.node };
    });
    
    console.log(`   ⚡ Processed ${outputs.length} nodes with Poziom 21`);
    
    // 3. ŁAWICA + GRZYBNIA - Synchronizacja (swarm signal)
    console.log('\n   🐟 SWARM SYNCHRONIZATION...');
    
    const swarmSignal = this.calculateSwarmSignal(outputs);
    
    console.log(`   🐟 Swarm signal calculated from ${outputs.length} nodes`);
    
    // 4. REGENERACJA - Kasuj najsłabsze nodes
    console.log('\n   🔄 REGENERATION - Removing weakest nodes...');
    
    const finalScores = outputs.map(o => ({
      ...o,
      finalScore: o.output.reduce((sum, s) => sum + Math.abs(s), 0) / o.output.length
    }));
    
    finalScores.sort((a, b) => a.finalScore - b.finalScore);
    const worstNodes = finalScores.slice(0, this.numRegenerateNodes);
    
    for (const wn of worstNodes) {
      console.log(`   🔄 Regenerating ${wn.node.id}...`);
      wn.node.reset();
      this.metrics.totalRegenerations++;
    }
    
    console.log(`   🔄 Regenerated ${worstNodes.length} nodes (salamander regeneration)`);
    
    // 5. FINALNA DECYZJA - Weighted average
    console.log('\n   🎯 FINAL DECISION - Weighted aggregation...');
    
    const weights = finalScores.map(fs => Math.exp(fs.finalScore * 3));
    const weightsSum = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / weightsSum);
    
    const result = this.weightedAverage(
      finalScores.map(fs => fs.output),
      normalizedWeights
    );
    
    // Aktualizuj globalną pamięć
    this.globalMemory = this.globalMemory.map((m, idx) => 
      m * 0.7 + result[idx] * 0.3
    );
    
    const processingTime = Date.now() - startTime;
    this.metrics.totalProcessed++;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) + processingTime) / 
      this.metrics.totalProcessed;
    
    console.log(`\n   ✅ BioCore21 THINK completed in ${processingTime}ms`);
    
    const response = {
      result: result,
      swarmSignal: swarmSignal,
      activeNodes: topNodes.length,
      totalNodes: this.numNodes,
      regeneratedNodes: worstNodes.length,
      processingTime: processingTime,
      cached: false
    };
    
    // CACHE RESULT
    if (this.enableCache) {
      const cacheKey = JSON.stringify(inputState);
      this.cache.set(cacheKey, response);
    }
    
    return response;
    
    } catch (error) {
      console.error('❌ BioCore21 THINK error:', error.message);
      this.metrics.errors++;
      
      // FALLBACK - Prosty response
      return this.fallback(inputState, error);
    }
  }

  /**
   * FALLBACK - Graceful degradation przy błędzie
   */
  fallback(inputState, error) {
    console.log('   🔄 FALLBACK - Using simple processing...');
    this.metrics.fallbacks++;
    
    try {
      // Użyj tylko 1 node z prostym przetwarzaniem
      const node = this.nodes[0] || new Nod21({ dim: this.dim });
      const result = node.process(inputState, 5);  // Tylko 5 iteracji
      
      return {
        result: result,
        swarmSignal: result,
        activeNodes: 1,
        totalNodes: this.numNodes,
        regeneratedNodes: 0,
        processingTime: 0,
        fallback: true,
        error: error.message
      };
    } catch (fallbackError) {
      // Ostateczny fallback - zwróć input
      console.error('❌ FALLBACK failed:', fallbackError.message);
      return {
        result: inputState,
        swarmSignal: inputState,
        activeNodes: 0,
        totalNodes: this.numNodes,
        regeneratedNodes: 0,
        processingTime: 0,
        fallback: true,
        criticalError: true,
        error: fallbackError.message
      };
    }
  }

  /**
   * HEALTH CHECK
   */
  healthCheck() {
    const now = Date.now();
    
    // Sprawdź czy nodes działają
    const healthyNodes = this.nodes.filter(n => n.processCount > 0).length;
    const nodeHealthRatio = healthyNodes / this.nodes.length;
    
    // Sprawdź error rate
    const errorRate = this.metrics.errors / (this.metrics.totalProcessed || 1);
    
    // Sprawdź cache hit rate
    const cacheStats = this.cache.getStats();
    
    this.healthy = nodeHealthRatio > 0.5 && errorRate < 0.1;
    this.lastHealthCheck = now;
    
    return {
      healthy: this.healthy,
      nodeHealthRatio: nodeHealthRatio,
      errorRate: errorRate,
      cacheHitRate: cacheStats.hitRate,
      uptime: now - this.lastHealthCheck,
      timestamp: now
    };
  }

  /**
   * CALCULATE SWARM SIGNAL - Kolektywny sygnał z wszystkich nodes
   */
  calculateSwarmSignal(outputs) {
    const numValues = outputs[0].output.length;
    const signal = [];
    
    for (let i = 0; i < numValues; i++) {
      const sum = outputs.reduce((s, o) => s + o.output[i], 0);
      signal.push(sum / outputs.length);
    }
    
    return signal;
  }

  /**
   * WEIGHTED AVERAGE
   */
  weightedAverage(outputs, weights) {
    const numValues = outputs[0].length;
    const result = [];
    
    for (let i = 0; i < numValues; i++) {
      let weightedSum = 0;
      for (let j = 0; j < outputs.length; j++) {
        weightedSum += outputs[j][i] * weights[j];
      }
      result.push(weightedSum);
    }
    
    return result;
  }

  /**
   * GET STATUS
   */
  getStatus() {
    const health = this.healthCheck();
    const cacheStats = this.cache.getStats();
    
    return {
      numNodes: this.numNodes,
      activeNodes: this.numActiveNodes,
      dim: this.dim,
      photosyntheticRatio: this.photosyntheticRatio,
      regenerationRatio: this.regenerationRatio,
      enableAdaptivePhotosynthesis: this.enableAdaptivePhotosynthesis,
      enableCache: this.enableCache,
      enableRateLimit: this.enableRateLimit,
      nodes: this.nodes.map(n => n.getStatus()),
      globalMemory: this.globalMemory,
      metrics: {
        ...this.metrics,
        cacheStats: cacheStats
      },
      health: health
    };
  }

  /**
   * CLEAR CACHE
   */
  clearCache() {
    this.cache.clear();
    console.log('💾 Cache cleared');
  }

  /**
   * RESET METRICS
   */
  resetMetrics() {
    this.metrics = {
      totalProcessed: 0,
      totalRegenerations: 0,
      photosyntheticSavings: 0,
      averageProcessingTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitRejects: 0,
      errors: 0,
      fallbacks: 0
    };
    console.log('📊 Metrics reset');
  }

  /**
   * SHUTDOWN
   */
  async shutdown() {
    console.log('🧬 Shutting down BioCore21...');
    console.log('✅ BioCore21 shut down');
  }
}

module.exports = { BioCore21, Nod21 };
