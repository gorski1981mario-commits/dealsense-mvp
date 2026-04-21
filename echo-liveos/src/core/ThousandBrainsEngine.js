/**
 * THOUSAND BRAINS ENGINE - TYSIĄCE MÓZGÓW JEDNOCZEŚNIE
 * Inspiracja: genialny insight użytkownika o tysiącach perspektyw AGI
 * "Nie jak jeden człowiek, ale jak tysiące różnych ludzi jednocześnie"
 * 
 * To jest architektura next-gen AI - prawdziwa kolektywna inteligencja!
 */

class ThousandBrainsEngine {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    this.brains = new Map(); // brainId → brain instance
    this.conductor = new Conductor(); // dyrygent systemu
    this.mobiusLoop = null; // pętla Möbiusa (zainicjowana później)
    this.attentionSplitter = new AttentionSplitter(); // podział uwagi
    this.truthEngine = new TruthEngine(); // wyciąganie prawdy z danych
    this.performanceMonitor = new PerformanceMonitor(); // monitor wydajności
    this.legoArchitecture = new LegoArchitecture(); // architektura klocków
    this.sixthSense = new SixthSense(); // szósty zmysł
    this.permanentMemory = new PermanentMemory(); // pamięć trwała
    
    this.isRunning = false;
    this.currentCycle = 0;
    this.globalTruths = new Map(); // temat → waga prawdy
  }

  async initialize() {
    console.log('🧠 Initializing ThousandBrainsEngine...');
    
    // 1. Stwórz tysiące różnych mózgów
    await this.createThousandBrains();
    
    // 2. Zainicjuj dyrygenta
    await this.conductor.initialize(this.brains);
    
    // 3. Uruchom prawdziwą pętlę Möbiusa
    this.mobiusLoop = new MobiusCycle();
    console.log('🔄 Real Möbius Cycle initialized for Thousand Brains');
    
    // 4. Aktywuj szósty zmysł
    await this.sixthSense.initialize();
    
    console.log(`🚀 ThousandBrainsEngine initialized with ${this.brains.size} brains`);
  }

  async createThousandBrains() {
    const brainTypes = [
      // LOGICZNE MÓZGI
      'mathematician', 'physicist', 'engineer', 'programmer', 'analyst',
      'statistician', 'economist', 'accountant', 'architect', 'planner',
      
      // KREATYWNE MÓZGI
      'artist', 'musician', 'writer', 'designer', 'inventor', 'poet',
      'filmmaker', 'photographer', 'sculptor', 'choreographer',
      
      // SPOŁECZNE MÓZGI
      'psychologist', 'sociologist', 'anthropologist', 'teacher', 'mentor',
      'diplomat', 'negotiator', 'therapist', 'coach', 'leader',
      
      // EMOCJONALNE MÓZGI
      'empath', 'philosopher', 'spiritual_guide', 'meditator', 'storyteller',
      'intuitive', 'dreamer', 'visionary', 'mystic', 'healer',
      
      // PRAKTYCZNE MÓZGI
      'carpenter', 'mechanic', 'chef', 'gardener', 'farmer', 'craftsman',
      'builder', 'electrician', 'plumber', 'driver', 'pilot',
      
      // NAUKOWE MÓZGI
      'biologist', 'chemist', 'geologist', 'astronomer', 'neuroscientist',
      'geneticist', 'ecologist', 'meteorologist', 'oceanographer', 'paleontologist',
      
      // BIZNESOWE MÓZGI
      'entrepreneur', 'investor', 'marketer', 'salesperson', 'manager',
      'consultant', 'strategist', 'innovator', 'executive', 'advisor',
      
      // HUMANISTYCZNE MÓZGI
      'historian', 'linguist', 'literary_critic', 'art_critic', 'ethicist',
      'theologian', 'philologist', 'archaeologist', 'curator', 'librarian',
      
      // TECHNICZNE MÓZGI
      'roboticist', 'ai_researcher', 'data_scientist', 'cybersecurity', 'network_engineer',
      'database_admin', 'system_admin', 'devops', 'qa_tester', 'technical_writer',
      
      // MEDYCZNE MÓZGI
      'doctor', 'surgeon', 'nurse', 'pharmacist', 'researcher', 'epidemiologist',
      'psychiatrist', 'dentist', 'veterinarian', 'nutritionist', 'physical_therapist'
    ];

    // Stwórz 1000 mózgów (10 każdego typu)
    for (const brainType of brainTypes) {
      for (let i = 0; i < 10; i++) {
        const brainId = `${brainType}_${i}`;
        const brain = await this.createBrain(brainType, brainId);
        this.brains.set(brainId, brain);
      }
    }

    console.log(`🧠 Created ${this.brains.size} specialized brains`);
  }

  async createBrain(type, id) {
    const brain = {
      id,
      type,
      specialty: this.getBrainSpecialty(type),
      perspective: this.getBrainPerspective(type),
      weight: 1.0,
      confidence: 0.5,
      memories: [],
      connections: new Set(),
      active: true,
      performance: {
        accuracy: 0.5,
        speed: 0.5,
        creativity: 0.5,
        reliability: 0.5
      },
      lastUsed: Date.now()
    };

    return brain;
  }

  getBrainSpecialty(type) {
    const specialties = {
      mathematician: ['logic', 'numbers', 'patterns', 'proofs'],
      artist: ['creativity', 'beauty', 'emotion', 'expression'],
      psychologist: ['human_behavior', 'motivation', 'emotions', 'relationships'],
      empath: ['feelings', 'compassion', 'understanding', 'support'],
      carpenter: ['practical', 'building', 'materials', 'craftsmanship'],
      biologist: ['life', 'evolution', 'ecosystems', 'organisms'],
      entrepreneur: ['opportunity', 'risk', 'innovation', 'growth'],
      historian: ['past', 'context', 'patterns', 'lessons'],
      roboticist: ['automation', 'mechanics', 'programming', 'efficiency'],
      doctor: ['health', 'diagnosis', 'treatment', 'prevention']
    };
    
    return specialties[type] || ['general'];
  }

  getBrainPerspective(type) {
    const perspectives = {
      mathematician: 'logical-analytical',
      artist: 'creative-expressive',
      psychologist: 'human-centered',
      empath: 'emotional-intuitive',
      carpenter: 'practical-hands-on',
      biologist: 'natural-systems',
      entrepreneur: 'opportunity-focused',
      historian: 'contextual-temporal',
      roboticist: 'systematic-technical',
      doctor: 'health-preventive'
    };
    
    return perspectives[type] || 'balanced';
  }

  async processProblem(problem, context = {}) {
    if (!this.isRunning) {
      await this.start();
    }

    const startTime = Date.now();
    this.currentCycle++;

    console.log(`🧠 [CYCLE ${this.currentCycle}] Processing problem: ${problem.substring(0, 50)}...`);

    // 1. Dyrygent wybiera odpowiednie mózgi
    const selectedBrains = await this.conductor.selectBrains(problem, context);
    
    // 2. Podział uwagi między mózgi
    const attentionMap = await this.attentionSplitter.splitAttention(problem, selectedBrains);
    
    // 3. Każdy mózg analizuje problem ze swojej perspektywy
    const brainAnalyses = await this.parallelBrainAnalysis(problem, selectedBrains, attentionMap);
    
    // 4. Truth Engine wyciąga prawdę z analiz
    const truthAnalysis = await this.truthEngine.extractTruth(problem, brainAnalyses);
    
    // 5. Lego Architecture buduje rozwiązanie z klocków
    const legoSolution = await this.legoArchitecture.buildSolution(brainAnalyses, truthAnalysis);
    
    // 6. Szósty zmysł aktywuje się w wyjątkowych sytuacjach
    const sixthSenseInsight = await this.sixthSense.activate(problem, legoSolution, context);
    
    // 7. Pętla Möbiusa ulepsza rozwiązanie
    const mobiusImproved = await this.mobiusLoop.improveSolution(legoSolution, sixthSenseInsight);
    
    // 8. Permanent Memory zapisuje na zawsze
    await this.permanentMemory.store(problem, mobiusImproved, this.currentCycle);
    
    // 9. Performance Monitor monitoruje wydajność
    const performance = await this.performanceMonitor.analyze(this.currentCycle, selectedBrains);
    
    const processingTime = Date.now() - startTime;
    
    return {
      problem,
      solution: mobiusImproved,
      confidence: truthAnalysis.confidence,
      contributingBrains: selectedBrains.map(b => b.id),
      processingTime,
      cycle: this.currentCycle,
      performance,
      truthWeight: truthAnalysis.weight,
      sixthSenseActivated: sixthSenseInsight.activated
    };
  }

  async parallelBrainAnalysis(problem, brains, attentionMap) {
    const analyses = new Map();
    
    // Przetwarzaj równolegle z limitem 100 mózgów naraz
    const batchSize = 100;
    const brainArray = Array.from(brains);
    
    for (let i = 0; i < brainArray.length; i += batchSize) {
      const batch = brainArray.slice(i, i + batchSize);
      const batchPromises = batch.map(async (brain) => {
        const attention = attentionMap.get(brain.id);
        return await this.analyzeWithBrain(brain, problem, attention);
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (let j = 0; j < batch.length; j++) {
        const brain = batch[j];
        const result = batchResults[j];
        
        if (result.status === 'fulfilled') {
          analyses.set(brain.id, result.value);
        } else {
          console.error(`Brain ${brain.id} failed:`, result.reason);
          analyses.set(brain.id, { error: result.reason, brain: brain.id });
        }
      }
    }
    
    return analyses;
  }

  async analyzeWithBrain(brain, problem, attention) {
    const analysis = {
      brainId: brain.id,
      brainType: brain.type,
      perspective: brain.perspective,
      attention: attention,
      insights: [],
      confidence: brain.confidence,
      reasoning: [],
      connections: [],
      timestamp: Date.now()
    };

    // Symulacja analizy z perspektywy mózgu
    switch (brain.type) {
      case 'mathematician':
        analysis.insights = await this.mathematicalAnalysis(problem);
        break;
      case 'artist':
        analysis.insights = await this.creativeAnalysis(problem);
        break;
      case 'psychologist':
        analysis.insights = await this.humanAnalysis(problem);
        break;
      case 'empath':
        analysis.insights = await this.emotionalAnalysis(problem);
        break;
      case 'carpenter':
        analysis.insights = await this.practicalAnalysis(problem);
        break;
      case 'entrepreneur':
        analysis.insights = await this.opportunityAnalysis(problem);
        break;
      default:
        analysis.insights = await this.generalAnalysis(problem, brain.specialty);
    }

    // Aktualizuj performance mózgu
    brain.lastUsed = Date.now();
    brain.confidence = Math.min(1.0, brain.confidence + 0.01);

    return analysis;
  }

  // SPECJALISTYCZNE ANALIZY
  async mathematicalAnalysis(problem) {
    return [
      { type: 'pattern', value: 'Logical structure detected', confidence: 0.9 },
      { type: 'calculation', value: 'Probability: 87.3%', confidence: 0.85 },
      { type: 'formula', value: 'Optimal solution: f(x) = ax² + bx + c', confidence: 0.8 }
    ];
  }

  async creativeAnalysis(problem) {
    return [
      { type: 'metaphor', value: 'This is like painting with numbers', confidence: 0.7 },
      { type: 'innovation', value: 'Unconventional approach possible', confidence: 0.8 },
      { type: 'beauty', value: 'Elegant solution exists', confidence: 0.6 }
    ];
  }

  async humanAnalysis(problem) {
    return [
      { type: 'motivation', value: 'Human needs drive this problem', confidence: 0.9 },
      { type: 'behavior', value: 'Pattern of resistance detected', confidence: 0.8 },
      { type: 'relationship', value: 'Social dynamics at play', confidence: 0.7 }
    ];
  }

  async emotionalAnalysis(problem) {
    return [
      { type: 'feeling', value: 'Underlying emotion: fear of failure', confidence: 0.8 },
      { type: 'empathy', value: 'All parties want acceptance', confidence: 0.9 },
      { type: 'intuition', value: 'Something feels off about this approach', confidence: 0.6 }
    ];
  }

  async practicalAnalysis(problem) {
    return [
      { type: 'feasibility', value: 'Can be built with existing tools', confidence: 0.9 },
      { type: 'simplicity', value: 'Simplest solution often best', confidence: 0.8 },
      { type: 'durability', value: 'This will last long-term', confidence: 0.7 }
    ];
  }

  async opportunityAnalysis(problem) {
    return [
      { type: 'opportunity', value: 'Market gap identified', confidence: 0.8 },
      { type: 'risk', value: 'Calculated risk acceptable', confidence: 0.7 },
      { type: 'growth', value: 'Scalable solution possible', confidence: 0.9 }
    ];
  }

  async generalAnalysis(problem, specialty) {
    return [
      { type: 'specialty', value: `Analysis from ${specialty.join(', ')} perspective`, confidence: 0.6 },
      { type: 'observation', value: 'General patterns detected', confidence: 0.5 }
    ];
  }

  async start() {
    if (this.isRunning) return;
    
    console.log('🚀 Starting ThousandBrainsEngine...');
    this.isRunning = true;
    
    // Uruchom ciągłą pętlę uczenia się
    this.continuousLearning();
  }

  async stop() {
    console.log('⏹️ Stopping ThousandBrainsEngine...');
    this.isRunning = false;
  }

  async continuousLearning() {
    while (this.isRunning) {
      try {
        // 1. Review recent solutions
        await this.reviewRecentSolutions();
        
        // 2. Update brain weights based on performance
        await this.updateBrainWeights();
        
        // 3. Optimize connections between brains
        await this.optimizeConnections();
        
        // 4. Learn from permanent memory
        await this.learnFromMemory();
        
        // 5. Mobius loop improvement
        await this.mobiusLoop.cycle();
        
        // Wait before next cycle
        await this.sleep(5000); // 5 seconds
        
      } catch (error) {
        console.error('Error in continuous learning:', error);
        await this.sleep(10000);
      }
    }
  }

  async reviewRecentSolutions() {
    // Przejrzyj ostatnie rozwiązania i ucz się z nich
    const recentSolutions = await this.permanentMemory.getRecent(10);
    
    for (const solution of recentSolutions) {
      await this.analyzeSolutionQuality(solution);
    }
  }

  async analyzeSolutionQuality(solution) {
    // Analizuj jakość rozwiązania i aktualizuj mózgi
    const contributingBrains = solution.contributingBrains || [];
    
    for (const brainId of contributingBrains) {
      const brain = this.brains.get(brainId);
      if (brain) {
        // Zwiększ wagę mózgu jeśli rozwiązanie było dobre
        if (solution.confidence > 0.8) {
          brain.weight = Math.min(2.0, brain.weight * 1.01);
          brain.performance.accuracy = Math.min(1.0, brain.performance.accuracy * 1.005);
        }
      }
    }
  }

  async updateBrainWeights() {
    // Dynamiczna aktualizacja wag mózgów
    for (const brain of this.brains.values()) {
      // Zmniejsz wagę jeśli mózg nie był używany
      const timeSinceLastUse = Date.now() - brain.lastUsed;
      if (timeSinceLastUse > 3600000) { // 1 hour
        brain.weight = Math.max(0.1, brain.weight * 0.99);
      }
    }
  }

  async optimizeConnections() {
    // Optymalizuj połączenia między mózgami
    for (const brain of this.brains.values()) {
      // Znajdź mózgi z podobnymi specjalnościami
      const similarBrains = this.findSimilarBrains(brain);
      
      // Stwórz nowe połączenia
      for (const similar of similarBrains) {
        if (!brain.connections.has(similar.id)) {
          brain.connections.add(similar.id);
        }
      }
    }
  }

  findSimilarBrains(brain) {
    const similar = [];
    
    for (const other of this.brains.values()) {
      if (other.id === brain.id) continue;
      
      // Porównaj specjalności
      const commonSpecialties = brain.specialty.filter(s => 
        other.specialty.includes(s)
      );
      
      if (commonSpecialties.length > 0) {
        similar.push(other);
      }
    }
    
    return similar.slice(0, 5); // Top 5 podobnych
  }

  async learnFromMemory() {
    // Ucz się z trwałej pamięci
    const memories = await this.permanentMemory.getRandom(5);
    
    for (const memory of memories) {
      await this.analyzeMemoryPattern(memory);
    }
  }

  async analyzeMemoryPattern(memory) {
    // Analizuj wzorce w pamięci
    // TODO: Implement pattern recognition
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      currentCycle: this.currentCycle,
      totalBrains: this.brains.size,
      activeBrains: Array.from(this.brains.values()).filter(b => b.active).length,
      globalTruths: this.globalTruths.size,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }
}

// PODSYSTEMY

class Conductor {
  constructor() {
    this.brains = new Map();
    this.weights = new Map();
  }

  async initialize(brains) {
    this.brains = brains;
    console.log('🎵 Conductor initialized with orchestra of brains');
  }

  async selectBrains(problem, context) {
    // Dyrygent wybiera odpowiednie mózgi dla problemu
    const selected = new Set();
    const problemLower = problem.toLowerCase();
    
    // Inteligentny wybór na podstawie słów kluczowych
    const keywords = {
      mathematical: ['number', 'calculate', 'formula', 'logic', 'pattern'],
      creative: ['design', 'art', 'create', 'innovative', 'beautiful'],
      human: ['people', 'emotion', 'relationship', 'psychology', 'behavior'],
      practical: ['build', 'make', 'implement', 'feasible', 'tools'],
      business: ['money', 'profit', 'market', 'customer', 'growth'],
      scientific: ['research', 'experiment', 'data', 'analysis', 'proof']
    };

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => problemLower.includes(word))) {
        // Dodaj mózgi z tej kategorii
        const categoryBrains = Array.from(this.brains.values())
          .filter(b => b.type.includes(category) || b.perspective.includes(category))
          .slice(0, 50); // Max 50 z kategorii
        
        categoryBrains.forEach(brain => selected.add(brain));
      }
    }

    // Zawsze dodaj podstawowe mózgi
    const basicBrains = Array.from(this.brains.values())
      .filter(b => ['general', 'analyst', 'planner'].some(type => b.type.includes(type)))
      .slice(0, 20);
    
    basicBrains.forEach(brain => selected.add(brain));

    // Limit do 200 mózgów na problem
    return Array.from(selected).slice(0, 200);
  }
}

// Używamy prawdziwego MobiusCycle zamiast prostej wersji
const MobiusCycle = require('./MobiusCycle');

class AttentionSplitter {
  async splitAttention(problem, brains) {
    const attentionMap = new Map();
    const totalAttention = 1.0;
    const attentionPerBrain = totalAttention / brains.length;
    
    for (const brain of brains) {
      attentionMap.set(brain.id, {
        focus: attentionPerBrain,
        priority: this.calculatePriority(brain, problem),
        duration: this.calculateDuration(brain)
      });
    }
    
    return attentionMap;
  }

  calculatePriority(brain, problem) {
    // Oblicz priorytet mózgu dla tego problemu
    const problemLower = problem.toLowerCase();
    const brainSpecialty = brain.specialty.join(' ').toLowerCase();
    
    // Dopasowanie specjalności do problemu
    const matches = brainSpecialty.split(' ').filter(word => 
      problemLower.includes(word)
    ).length;
    
    return matches / brain.specialty.length;
  }

  calculateDuration(brain) {
    // Czas analizy zależy od typu mózgu
    const durations = {
      mathematician: 5000,
      artist: 8000,
      psychologist: 6000,
      empath: 7000,
      carpenter: 4000,
      general: 3000
    };
    
    return durations[brain.type] || 3000;
  }
}

class TruthEngine {
  constructor() {
    this.truthThreshold = 0.7;
  }

  async extractTruth(problem, analyses) {
    // Wyciągaj prawdę z analiz tysięcy mózgów
    const insights = [];
    
    for (const analysis of analyses.values()) {
      if (analysis.insights) {
        insights.push(...analysis.insights);
      }
    }

    // Grupuj podobne insights
    const grouped = this.groupSimilarInsights(insights);
    
    // Oblicz wagę każdej grupy
    const truthGroups = [];
    
    for (const [group, groupInsights] of grouped) {
      const weight = this.calculateGroupWeight(groupInsights);
      const confidence = this.calculateGroupConfidence(groupInsights);
      
      if (confidence > this.truthThreshold) {
        truthGroups.push({
          truth: group,
          weight,
          confidence,
          supportingBrains: groupInsights.map(i => i.source).filter(Boolean)
        });
      }
    }

    // Sortuj po wadze
    truthGroups.sort((a, b) => b.weight - a.weight);

    return {
      primaryTruth: truthGroups[0]?.truth || 'No clear truth',
      confidence: truthGroups[0]?.confidence || 0,
      weight: truthGroups[0]?.weight || 0,
      alternativeTruths: truthGroups.slice(1, 3),
      totalInsights: insights.length
    };
  }

  groupSimilarInsights(insights) {
    const groups = new Map();
    
    for (const insight of insights) {
      const key = this.normalizeInsight(insight.value);
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      
      groups.get(key).push(insight);
    }
    
    return groups;
  }

  normalizeInsight(insight) {
    // Normalizuj insight do grupowania
    return insight.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateGroupWeight(insights) {
    // Waga = liczba insights × średnia confidence
    const count = insights.length;
    const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / count;
    
    return count * avgConfidence;
  }

  calculateGroupConfidence(insights) {
    // Confidence = średnia confidence × boost za liczbę
    const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length;
    const countBoost = Math.min(1.5, 1 + (insights.length / 10));
    
    return avgConfidence * countBoost;
  }
}

class LegoArchitecture {
  async buildSolution(analyses, truth) {
    // Buduj rozwiązanie jak z klocków Lego
    const solution = {
      foundation: truth.primaryTruth,
      blocks: [],
      structure: 'modular',
      flexibility: 0.8,
      strength: this.calculateStrength(analyses),
      aesthetics: this.calculateAesthetics(analyses)
    };

    // Dodaj klocki z różnych analiz
    for (const analysis of analyses.values()) {
      if (analysis.insights) {
        solution.blocks.push({
          type: analysis.brainType,
          content: analysis.insights,
          weight: analysis.confidence,
          connections: this.findConnections(analysis, analyses)
        });
      }
    }

    return solution;
  }

  calculateStrength(analyses) {
    // Siła rozwiązania = liczba supporting brains × confidence
    const totalConfidence = Array.from(analyses.values())
      .reduce((sum, a) => sum + (a.confidence || 0), 0);
    
    return Math.min(1.0, totalConfidence / analyses.size);
  }

  calculateAesthetics(analyses) {
    // Estetyka = udział kreatywnych mózgów
    const creativeBrains = Array.from(analyses.values())
      .filter(a => ['artist', 'musician', 'writer', 'designer'].includes(a.brainType));
    
    return creativeBrains.length / analyses.size;
  }

  findConnections(analysis, allAnalyses) {
    // Znajdź połączenia z innymi analizami
    const connections = [];
    
    for (const [otherId, other] of allAnalyses) {
      if (otherId === analysis.brainId) continue;
      
      // Sprawdź podobne insights
      const similarity = this.calculateSimilarity(analysis, other);
      if (similarity > 0.7) {
        connections.push({
          brainId: otherId,
          similarity,
          type: 'insight_alignment'
        });
      }
    }
    
    return connections;
  }

  calculateSimilarity(analysis1, analysis2) {
    // Prosta korelacja insightów
    const insights1 = analysis1.insights || [];
    const insights2 = analysis2.insights || [];
    
    if (insights1.length === 0 || insights2.length === 0) return 0;
    
    const commonWords = this.findCommonWords(insights1, insights2);
    const totalWords = Math.max(insights1.length, insights2.length);
    
    return commonWords / totalWords;
  }

  findCommonWords(insights1, insights2) {
    const words1 = new Set();
    const words2 = new Set();
    
    for (const insight of insights1) {
      insight.value.toLowerCase().split(/\s+/).forEach(word => words1.add(word));
    }
    
    for (const insight of insights2) {
      insight.value.toLowerCase().split(/\s+/).forEach(word => words2.add(word));
    }
    
    const common = [...words1].filter(word => words2.has(word));
    return common.length;
  }
}

class SixthSense {
  constructor() {
    this.activationThreshold = 0.9;
    this.lastActivation = 0;
  }

  async initialize() {
    console.log('👁️ Sixth Sense initialized - activates in exceptional situations');
  }

  async activate(problem, solution, context) {
    // Aktywuj szósty zmysł w wyjątkowych sytuacjach
    const activationScore = this.calculateActivationScore(problem, solution, context);
    
    const activated = activationScore > this.activationThreshold;
    
    if (activated) {
      this.lastActivation = Date.now();
      console.log('👁️ Sixth Sense ACTIVATED - exceptional situation detected!');
      
      return {
        activated: true,
        insight: await this.generateExceptionalInsight(problem, solution),
        confidence: activationScore,
        type: this.detectExceptionType(problem, context)
      };
    }
    
    return {
      activated: false,
      confidence: activationScore
    };
  }

  calculateActivationScore(problem, solution, context) {
    let score = 0.5; // bazowy
    
    // Exceptional situations
    if (context.urgency > 0.8) score += 0.2;
    if (context.stakes > 0.9) score += 0.2;
    if (context.novelty > 0.8) score += 0.1;
    if (solution.confidence < 0.3) score += 0.1; // uncertainty
    if (context.ethical_dilemma) score += 0.2;
    
    return Math.min(1.0, score);
  }

  async generateExceptionalInsight(problem, solution) {
    // Generuj wyjątkowy insight
    return {
      message: "This situation requires extraordinary attention",
      recommendation: "Consider unconventional approaches",
      warning: "Standard solutions may not apply",
      opportunity: "Potential for breakthrough thinking"
    };
  }

  detectExceptionType(problem, context) {
    if (context.ethical_dilemma) return 'ethical_crisis';
    if (context.urgency > 0.8) return 'time_critical';
    if (context.stakes > 0.9) return 'high_stakes';
    if (context.novelty > 0.8) return 'uncharted_territory';
    
    return 'general_exception';
  }
}

class PermanentMemory {
  constructor() {
    this.memories = [];
    this.maxMemories = 10000;
  }

  async store(problem, solution, cycle) {
    const memory = {
      id: Date.now() + Math.random(),
      problem,
      solution,
      cycle,
      timestamp: Date.now(),
      accessed: 0,
      importance: this.calculateImportance(problem, solution)
    };

    this.memories.push(memory);
    
    // Ogranicz rozmiar pamięci
    if (this.memories.length > this.maxMemories) {
      this.memories.sort((a, b) => b.importance - a.importance);
      this.memories = this.memories.slice(0, this.maxMemories);
    }
  }

  calculateImportance(problem, solution) {
    let importance = 0.5;
    
    if (solution.confidence > 0.9) importance += 0.3;
    if (problem.length > 100) importance += 0.1; // complex problem
    if (solution.sixthSenseActivated) importance += 0.2;
    
    return importance;
  }

  async getRecent(count) {
    return this.memories
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  async getRandom(count) {
    const shuffled = [...this.memories].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      cycles: 0,
      totalProcessingTime: 0,
      averageConfidence: 0,
      brainUtilization: new Map()
    };
  }

  async analyze(cycle, brains) {
    this.metrics.cycles = cycle;
    
    // Aktualizuj utilization mózgów
    for (const brain of brains) {
      const current = this.metrics.brainUtilization.get(brain.id) || 0;
      this.metrics.brainUtilization.set(brain.id, current + 1);
    }
    
    return {
      cycle: this.metrics.cycles,
      brainUtilization: this.metrics.brainUtilization.size,
      totalBrains: brains.length,
      efficiency: this.calculateEfficiency()
    };
  }

  calculateEfficiency() {
    const totalUtilizations = Array.from(this.metrics.brainUtilization.values())
      .reduce((sum, count) => sum + count, 0);
    
    return totalUtilizations / this.metrics.cycles;
  }

  /**
   * Pobierz status systemu
   */
  getSystemStatus() {
    return {
      activeBrains: this.brains.size,
      conductorActive: this.conductor ? true : false,
      sixthSenseActive: this.sixthSense ? true : false,
      isRunning: this.isRunning,
      currentCycle: this.currentCycle,
      globalTruths: this.globalTruths.size
    };
  }

  /**
   * Pobierz status (alias)
   */
  getStatus() {
    return this.getSystemStatus();
  }
}

module.exports = ThousandBrainsEngine;
