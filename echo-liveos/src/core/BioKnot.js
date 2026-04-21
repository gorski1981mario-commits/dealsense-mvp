/**
 * BIOKNOT - POZIOM 15 (BIOLOGICZNIE INSPIROWANY AI)
 * 
 * 4 MECHANIZMY BIOLOGICZNE:
 * 1. GRZYBNIENIE (Mycelium) - stała komunikacja między wszystkimi knotami
 * 2. ŁAWICA (Swarm) - brak lidera, każdy może przejąć kontrolę
 * 3. REGENERACJA - słaby wynik = kasuj i restart z losowymi parametrami
 * 4. FOTOSYNTEZA - szybka próbka przed pełną mocą
 * 
 * SWARM THINK:
 * - Wszystkie knoty startują jednocześnie
 * - Co 2-3 iteracje: głosowanie na zmianę kierunku
 * - Każdy knot może przejąć kontrolę całego systemu
 */

/**
 * BIOKNOT - Pojedynczy biologiczny knot
 */
class BioKnot {
  constructor(config = {}) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    
    // PARAMETRY (mogą być losowe przy regeneracji)
    this.alpha = config.alpha !== undefined ? config.alpha : 0.5 + Math.random() * 0.5;
    this.beta = config.beta !== undefined ? config.beta : 0.3 + Math.random() * 0.4;
    this.loops = config.loops !== undefined ? config.loops : 3 + Math.floor(Math.random() * 4);
    
    // WŁASNA PAMIĘĆ (nie współdzielona)
    this.memory = null;
    this.internalState = null;
    
    // STAN BIOLOGICZNY
    this.energy = 1.0;  // Energia (0-1)
    this.health = 1.0;  // Zdrowie (0-1)
    this.age = 0;  // Wiek (liczba iteracji)
    
    // KOMUNIKACJA (GRZYBNIENIE)
    this.myceliumNetwork = null;  // Referencja do sieci
    this.sharedStates = new Map();  // Stany od innych knotów
    
    // ŁAWICA
    this.trajectory = null;  // Aktualna trajektoria
    this.leadershipScore = 0.5;  // Jak bardzo ten knot chce przejąć kontrolę
    
    // REGENERACJA
    this.performanceHistory = [];
    this.regenerationCount = 0;
    
    // FOTOSYNTEZA
    this.photosyntheticEfficiency = Math.random();  // Jak dobrze ten knot wykorzystuje "światło"
    
    // METRYKI
    this.processCount = 0;
    this.successfulVotes = 0;
  }

  /**
   * PROCESS - Podstawowe przetwarzanie
   */
  process(inputState) {
    let state = Array.isArray(inputState) ? [...inputState] : [inputState];
    
    // Inicjalizuj pamięć przy pierwszym użyciu
    if (this.memory === null) {
      this.memory = new Array(state.length).fill(0);
    }
    
    // Zapisz stan wewnętrzny
    this.internalState = [...state];
    
    // Przetwarzanie przez pętlę
    for (let i = 0; i < this.loops; i++) {
      // Szum
      const noise = state.map(() => (Math.random() - 0.5) * this.beta);
      
      // Nowy stan z pamięcią
      state = state.map((s, idx) => {
        const withMemory = s * 0.7 + this.memory[idx] * 0.3;
        const withNoise = withMemory + noise[idx];
        return Math.tanh(withNoise * this.alpha);
      });
      
      // Aktualizuj pamięć
      this.memory = this.memory.map((m, idx) => 
        0.8 * m + 0.2 * state[idx]
      );
    }
    
    this.age++;
    this.processCount++;
    
    return state;
  }

  /**
   * PHOTOSYNTHESIS - Szybka, tania próbka
   */
  photosynthesis(inputState) {
    let state = Array.isArray(inputState) ? [...inputState] : [inputState];
    
    // Tylko 1 iteracja (szybka próbka)
    const noise = state.map(() => (Math.random() - 0.5) * this.beta * 0.5);
    
    state = state.map((s, idx) => {
      const withNoise = s + noise[idx];
      return Math.tanh(withNoise * this.alpha * this.photosyntheticEfficiency);
    });
    
    // Oceń jakość próbki
    const quality = state.reduce((sum, s) => sum + Math.abs(s), 0) / state.length;
    
    return {
      state: state,
      quality: quality,
      efficiency: this.photosyntheticEfficiency
    };
  }

  /**
   * SHARE STATE - Prześlij stan do sieci grzybni
   */
  shareState() {
    if (this.myceliumNetwork) {
      this.myceliumNetwork.broadcastState(this.id, {
        internalState: this.internalState,
        memory: this.memory,
        energy: this.energy,
        health: this.health,
        leadershipScore: this.leadershipScore,
        trajectory: this.trajectory
      });
    }
  }

  /**
   * RECEIVE STATE - Odbierz stan od innego knota
   */
  receiveState(knotId, state) {
    this.sharedStates.set(knotId, state);
  }

  /**
   * VOTE FOR DIRECTION - Głosuj na zmianę kierunku
   */
  voteForDirection(currentTrajectory) {
    // Oblicz jak bardzo ten knot chce zmienić kierunek
    const myTrajectory = this.trajectory || this.internalState;
    
    if (!myTrajectory || !currentTrajectory) {
      return { vote: false, confidence: 0 };
    }
    
    // Oblicz różnicę między moją trajektorią a obecną
    const difference = myTrajectory.reduce((sum, val, idx) => 
      sum + Math.abs(val - (currentTrajectory[idx] || 0)), 0
    ) / myTrajectory.length;
    
    // Jeśli różnica jest duża I mam wysoką energię → głosuj na zmianę
    const shouldVote = difference > 0.3 && this.energy > 0.6;
    const confidence = this.leadershipScore * this.energy * difference;
    
    if (shouldVote) {
      this.leadershipScore = Math.min(1.0, this.leadershipScore + 0.1);
    }
    
    return {
      vote: shouldVote,
      confidence: confidence,
      trajectory: myTrajectory
    };
  }

  /**
   * REGENERATE - Kasuj stan i restart z losowymi parametrami
   */
  regenerate() {
    console.log(`   🔄 Regenerating ${this.id}...`);
    
    // Losowe nowe parametry
    this.alpha = 0.5 + Math.random() * 0.5;
    this.beta = 0.3 + Math.random() * 0.4;
    this.loops = 3 + Math.floor(Math.random() * 4);
    
    // Kasuj pamięć i stan
    this.memory = null;
    this.internalState = null;
    this.trajectory = null;
    
    // Reset biologiczny
    this.energy = 1.0;
    this.health = 1.0;
    this.age = 0;
    
    // Reset metryki
    this.performanceHistory = [];
    this.leadershipScore = 0.5;
    
    this.regenerationCount++;
  }

  /**
   * UPDATE PERFORMANCE - Aktualizuj performance i zdecyduj czy regenerować
   */
  updatePerformance(performance) {
    this.performanceHistory.push(performance);
    
    // Limit history
    if (this.performanceHistory.length > 5) {
      this.performanceHistory.shift();
    }
    
    // Oblicz średnią performance
    const avgPerformance = this.performanceHistory.reduce((sum, p) => sum + p, 0) / 
                          this.performanceHistory.length;
    
    // Aktualizuj health i energy
    this.health = avgPerformance;
    this.energy = Math.max(0.1, this.energy * 0.9 + avgPerformance * 0.1);
    
    return avgPerformance;
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      id: this.id,
      alpha: this.alpha,
      beta: this.beta,
      loops: this.loops,
      energy: this.energy,
      health: this.health,
      age: this.age,
      leadershipScore: this.leadershipScore,
      regenerationCount: this.regenerationCount,
      processCount: this.processCount,
      successfulVotes: this.successfulVotes,
      photosyntheticEfficiency: this.photosyntheticEfficiency
    };
  }
}

/**
 * MYCELIUM NETWORK - Sieć grzybni dla komunikacji
 */
class MyceliumNetwork {
  constructor() {
    this.knots = new Map();  // Map<knotId, BioKnot>
    this.stateCache = new Map();  // Map<knotId, state>
  }

  /**
   * REGISTER KNOT
   */
  registerKnot(knot) {
    this.knots.set(knot.id, knot);
    knot.myceliumNetwork = this;
  }

  /**
   * BROADCAST STATE - Rozgłoś stan do wszystkich knotów
   */
  broadcastState(senderId, state) {
    this.stateCache.set(senderId, state);
    
    // Wyślij do wszystkich innych knotów
    for (const [knotId, knot] of this.knots) {
      if (knotId !== senderId) {
        knot.receiveState(senderId, state);
      }
    }
  }

  /**
   * GET ALL STATES
   */
  getAllStates() {
    return this.stateCache;
  }
}

/**
 * BIOKNOT SWARM - System biologicznych knotów
 */
class BioKnotSwarm {
  constructor(ethicsCore, config = {}) {
    this.ethicsCore = ethicsCore;
    
    // KONFIGURACJA
    this.numKnots = config.numKnots || 16;
    
    // FOTOSYNTEZA
    this.photosyntheticThreshold = config.photosyntheticThreshold || 0.5;  // Top 50%
    
    // REGENERACJA
    this.regenerationThreshold = config.regenerationThreshold || 0.3;
    this.regenerationCheckInterval = config.regenerationCheckInterval || 5;
    
    // SWARM THINK
    this.votingInterval = config.votingInterval || 3;  // Co ile iteracji głosowanie
    this.votingThreshold = config.votingThreshold || 0.6;  // Próg do zmiany kierunku
    
    // GRZYBNIENIE
    this.myceliumNetwork = new MyceliumNetwork();
    
    // KNOTY
    this.knots = [];
    
    // STAN SYSTEMU
    this.currentTrajectory = null;
    this.iterationCount = 0;
    
    // METRYKI
    this.metrics = {
      totalProcessed: 0,
      totalRegenerations: 0,
      totalVotes: 0,
      successfulVotes: 0,
      photosyntheticSavings: 0
    };
  }

  /**
   * INITIALIZE
   */
  async initialize() {
    console.log('🧬 Initializing BioKnot Swarm...');
    
    // Etyczna walidacja
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'bioknot_swarm_initialization',
      description: `Initialize BioKnot Swarm with ${this.numKnots} biological knots`
    });
    
    if (!ethicalCheck.approved) {
      console.error('❌ BioKnot Swarm initialization rejected by Ethics Core');
      return false;
    }
    
    // Stwórz knoty
    this.knots = [];
    for (let i = 0; i < this.numKnots; i++) {
      const knot = new BioKnot({ id: `bioknot_${i}` });
      this.knots.push(knot);
      
      // Zarejestruj w sieci grzybni
      this.myceliumNetwork.registerKnot(knot);
      
      console.log(`   Knot ${i}: alpha=${knot.alpha.toFixed(2)}, beta=${knot.beta.toFixed(2)}, loops=${knot.loops}, efficiency=${knot.photosyntheticEfficiency.toFixed(2)}`);
    }
    
    console.log('✅ BioKnot Swarm initialized!');
    console.log(`   Total knots: ${this.knots.length}`);
    console.log(`   Mycelium network: ACTIVE`);
    
    return true;
  }

  /**
   * SWARM THINK - Główna funkcja przetwarzania
   */
  async swarmThink(inputState, maxIterations = 10) {
    const startTime = Date.now();
    
    console.log('🧬 SWARM THINK - Starting biological processing...');
    
    // KROK 1: FOTOSYNTEZA - Szybka próbka wszystkich knotów
    console.log('\n   🌱 PHOTOSYNTHESIS - Quick sampling all knots...');
    const photosyntheticResults = this.knots.map(knot => ({
      knot: knot,
      result: knot.photosynthesis(inputState)
    }));
    
    // Sortuj po jakości
    photosyntheticResults.sort((a, b) => b.result.quality - a.result.quality);
    
    // Wybierz top N%
    const numActive = Math.ceil(this.numKnots * this.photosyntheticThreshold);
    const activeKnots = photosyntheticResults.slice(0, numActive).map(r => r.knot);
    
    console.log(`   🌱 Selected ${activeKnots.length}/${this.numKnots} knots for full processing`);
    console.log(`   🌱 Energy savings: ${((1 - this.photosyntheticThreshold) * 100).toFixed(0)}%`);
    
    this.metrics.photosyntheticSavings += (this.numKnots - activeKnots.length);
    
    // KROK 2: SWARM THINK - Wszystkie aktywne knoty startują jednocześnie
    console.log('\n   🐟 SWARM THINK - All knots start together...');
    
    let knotStates = activeKnots.map(knot => ({
      knot: knot,
      state: knot.process(inputState)
    }));
    
    // Ustaw początkową trajektorię (średnia wszystkich)
    this.currentTrajectory = this.calculateAverageTrajectory(knotStates);
    
    // KROK 3: ITERACJE Z GŁOSOWANIEM
    for (let iter = 0; iter < maxIterations; iter++) {
      this.iterationCount++;
      
      console.log(`\n   Iteration ${iter + 1}/${maxIterations}`);
      
      // Przetwórz wszystkie knoty
      knotStates = knotStates.map(ks => ({
        knot: ks.knot,
        state: ks.knot.process(ks.state)
      }));
      
      // GRZYBNIENIE - Każdy knot dzieli się stanem
      for (const ks of knotStates) {
        ks.knot.shareState();
      }
      
      console.log(`   🍄 MYCELIUM - ${knotStates.length} knots shared states`);
      
      // GŁOSOWANIE (co N iteracji)
      if ((iter + 1) % this.votingInterval === 0) {
        console.log(`\n   🗳️  VOTING - Knots vote for direction change...`);
        
        const votes = knotStates.map(ks => ({
          knot: ks.knot,
          vote: ks.knot.voteForDirection(this.currentTrajectory)
        }));
        
        // Znajdź najsilniejszy głos
        const strongestVote = votes
          .filter(v => v.vote.vote)
          .sort((a, b) => b.vote.confidence - a.vote.confidence)[0];
        
        this.metrics.totalVotes++;
        
        if (strongestVote && strongestVote.vote.confidence > this.votingThreshold) {
          // ZMIANA KIERUNKU - Wszyscy przełączają się na trajektorię zwycięzcy
          console.log(`   🐟 SWARM SHIFT - ${strongestVote.knot.id} takes control!`);
          console.log(`   🐟 Confidence: ${(strongestVote.vote.confidence * 100).toFixed(1)}%`);
          
          this.currentTrajectory = strongestVote.vote.trajectory;
          strongestVote.knot.successfulVotes++;
          this.metrics.successfulVotes++;
          
          // Wszyscy knoty adaptują się do nowej trajektorii
          knotStates = knotStates.map(ks => ({
            knot: ks.knot,
            state: this.blendStates(ks.state, this.currentTrajectory, 0.3)
          }));
        } else {
          console.log(`   🗳️  No strong vote - continuing current trajectory`);
        }
      }
      
      // REGENERACJA (co N iteracji)
      if ((iter + 1) % this.regenerationCheckInterval === 0) {
        console.log(`\n   🔄 REGENERATION CHECK...`);
        
        for (const ks of knotStates) {
          const performance = this.evaluatePerformance(ks.state);
          const avgPerformance = ks.knot.updatePerformance(performance);
          
          // Jeśli performance < threshold → REGENERUJ
          if (avgPerformance < this.regenerationThreshold) {
            ks.knot.regenerate();
            this.metrics.totalRegenerations++;
            
            // Restart z nowym inputem
            ks.state = ks.knot.process(inputState);
          }
        }
      }
    }
    
    // KROK 4: FINALNA AGREGACJA
    const finalResult = this.calculateAverageTrajectory(knotStates);
    
    const processingTime = Date.now() - startTime;
    this.metrics.totalProcessed++;
    
    console.log(`\n   ✅ SWARM THINK completed in ${processingTime}ms`);
    
    return {
      result: finalResult,
      knotStates: knotStates,
      trajectory: this.currentTrajectory,
      iterations: maxIterations,
      activeKnots: activeKnots.length,
      totalKnots: this.numKnots,
      processingTime: processingTime
    };
  }

  /**
   * CALCULATE AVERAGE TRAJECTORY
   */
  calculateAverageTrajectory(knotStates) {
    if (knotStates.length === 0) return [];
    
    const numValues = knotStates[0].state.length;
    const result = [];
    
    for (let i = 0; i < numValues; i++) {
      const sum = knotStates.reduce((s, ks) => s + ks.state[i], 0);
      result.push(sum / knotStates.length);
    }
    
    return result;
  }

  /**
   * BLEND STATES - Mieszaj dwa stany
   */
  blendStates(state1, state2, ratio) {
    return state1.map((val, idx) => 
      val * (1 - ratio) + (state2[idx] || 0) * ratio
    );
  }

  /**
   * EVALUATE PERFORMANCE
   */
  evaluatePerformance(state) {
    // Prosta metryka: średnia wartość bezwzględna
    const avgAbs = state.reduce((sum, s) => sum + Math.abs(s), 0) / state.length;
    
    // Normalizuj do 0-1
    return Math.min(1.0, avgAbs);
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      numKnots: this.numKnots,
      activeKnots: this.knots.filter(k => k.health > this.regenerationThreshold).length,
      knots: this.knots.map(k => k.getStatus()),
      metrics: this.metrics,
      myceliumNetwork: {
        totalKnots: this.myceliumNetwork.knots.size,
        statesCached: this.myceliumNetwork.stateCache.size
      }
    };
  }

  /**
   * SHUTDOWN
   */
  async shutdown() {
    console.log('🧬 Shutting down BioKnot Swarm...');
    console.log('✅ BioKnot Swarm shut down');
  }
}

module.exports = { BioKnotSwarm, BioKnot, MyceliumNetwork };
