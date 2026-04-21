/**
 * REGENT SYSTEM - Priorytetyzacja i Rotacja Modułów
 * 
 * REGENT = Centralny system decyzyjny
 * 
 * ZADANIA:
 * 1. Analizuje pytanie (typ, złożoność, priorytet)
 * 2. Wybiera moduły (które użyć)
 * 3. Ustala wagi (ciężkie/lekkie głowice)
 * 4. Rotuje moduły (adaptacja do problemu)
 * 5. Zarządza pipeline (kolejność wykonania)
 * 
 * MATEMATYKA:
 * - Priority Score = f(type, complexity, urgency)
 * - Module Weight = f(priority, performance, accuracy)
 * - Rotation Strategy = f(problem, history, resources)
 */

class RegentSystem {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // TYPY PYTAŃ
    this.questionTypes = {
      MATHEMATICAL: 'mathematical',      // 2+2=?, optymalizacja
      LOGICAL: 'logical',               // if-then, dedukcja
      CREATIVE: 'creative',             // nowe pomysły, sztuka
      ETHICAL: 'ethical',               // moralność, zasady
      ANALYTICAL: 'analytical',         // analiza danych
      STRATEGIC: 'strategic',           // planowanie, strategia
      EMOTIONAL: 'emotional',           // emocje, psychologia
      TECHNICAL: 'technical'            // inżynieria, tech
    };
    
    // POZIOMY ZŁOŻONOŚCI
    this.complexityLevels = {
      TRIVIAL: 1,      // 2+2=?
      SIMPLE: 2,       // Znajdź najlepszy deal
      MODERATE: 3,     // Stwórz konfigurator
      COMPLEX: 4,      // Optymalizuj system
      EXPERT: 5        // Wymyśl nową technologię
    };
    
    // MODUŁY I ICH SPECJALIZACJE
    this.moduleSpecializations = {
      leftHemisphere: ['mathematical', 'logical', 'analytical'],
      rightHemisphere: ['creative', 'emotional', 'strategic'],
      ethicsCore: ['ethical'],
      quantumAnnealing: ['mathematical', 'analytical', 'strategic'],
      thousandBrains: ['creative', 'analytical', 'strategic'],
      rubikCube: ['logical', 'analytical'],
      mobiusLoop: ['strategic', 'creative'],
      leverageEngine: ['strategic', 'technical']
    };
    
    // HISTORIA DECYZJI (learning)
    this.decisionHistory = [];
    
    // STATYSTYKI
    this.stats = {
      totalDecisions: 0,
      averageComplexity: 0,
      moduleUsage: {},
      rotationCount: 0
    };
  }

  /**
   * GŁÓWNA METODA - Analizuj i Zdecyduj
   */
  async analyzeAndDecide(question, context = {}) {
    console.log('👑 REGENT: Analyzing question...');
    
    const decision = {
      timestamp: Date.now(),
      question: question,
      context: context
    };
    
    // KROK 1: Klasyfikuj typ pytania
    const questionType = this.classifyQuestionType(question);
    decision.questionType = questionType;
    console.log(`   Type: ${questionType}`);
    
    // KROK 2: Oceń złożoność
    const complexity = this.assessComplexity(question, context);
    decision.complexity = complexity;
    console.log(`   Complexity: ${complexity}/5`);
    
    // KROK 3: Oblicz priorytety modułów
    const modulePriorities = this.calculateModulePriorities(questionType, complexity);
    decision.modulePriorities = modulePriorities;
    console.log(`   Top modules: ${Object.keys(modulePriorities).slice(0, 3).join(', ')}`);
    
    // KROK 4: Wybierz głowice (ciężkie/lekkie)
    const headSelection = this.selectHeads(complexity, context);
    decision.headSelection = headSelection;
    console.log(`   Heads: ${headSelection.type} (${headSelection.count} brains)`);
    
    // KROK 5: Oblicz balans (logika/kreatywność)
    const balance = this.calculateBalance(questionType, complexity);
    decision.balance = balance;
    console.log(`   Balance: ${(balance.logic * 100).toFixed(0)}% logic, ${(balance.creativity * 100).toFixed(0)}% creativity`);
    
    // KROK 6: Określ strategię rotacji
    const rotationStrategy = this.determineRotationStrategy(questionType, complexity);
    decision.rotationStrategy = rotationStrategy;
    console.log(`   Rotation: ${rotationStrategy.type}`);
    
    // KROK 7: Zbuduj pipeline
    const pipeline = this.buildPipeline(decision);
    decision.pipeline = pipeline;
    console.log(`   Pipeline: ${pipeline.steps.length} steps`);
    
    // ZAPISZ DECYZJĘ
    this.decisionHistory.push(decision);
    this.updateStats(decision);
    
    console.log('✅ REGENT: Decision complete');
    
    return decision;
  }

  /**
   * KLASYFIKUJ TYP PYTANIA
   */
  classifyQuestionType(question) {
    const q = question.toLowerCase();
    
    // Matematyczne
    if (q.match(/\d+|\+|\-|\*|\/|calculate|compute|optimize/)) {
      return this.questionTypes.MATHEMATICAL;
    }
    
    // Kreatywne
    if (q.match(/create|invent|imagine|design|new|innovative/)) {
      return this.questionTypes.CREATIVE;
    }
    
    // Etyczne
    if (q.match(/ethical|moral|right|wrong|should|ought/)) {
      return this.questionTypes.ETHICAL;
    }
    
    // Logiczne
    if (q.match(/if|then|because|therefore|logic|reason/)) {
      return this.questionTypes.LOGICAL;
    }
    
    // Analityczne
    if (q.match(/analyze|compare|evaluate|assess|data/)) {
      return this.questionTypes.ANALYTICAL;
    }
    
    // Strategiczne
    if (q.match(/plan|strategy|approach|how to|best way/)) {
      return this.questionTypes.STRATEGIC;
    }
    
    // Domyślnie: analytical
    return this.questionTypes.ANALYTICAL;
  }

  /**
   * OCEŃ ZŁOŻONOŚĆ
   */
  assessComplexity(question, context) {
    let complexity = this.complexityLevels.SIMPLE;
    
    // Długość pytania
    const words = question.split(' ').length;
    if (words > 50) complexity++;
    if (words > 100) complexity++;
    
    // Kontekst
    if (context.domain && context.domain !== 'general') complexity++;
    if (context.constraints && context.constraints.length > 0) complexity++;
    
    // Słowa kluczowe złożoności
    const q = question.toLowerCase();
    if (q.match(/complex|advanced|expert|sophisticated/)) complexity++;
    if (q.match(/multiple|various|different|several/)) complexity++;
    
    return Math.min(complexity, this.complexityLevels.EXPERT);
  }

  /**
   * OBLICZ PRIORYTETY MODUŁÓW
   * 
   * MATEMATYKA:
   * Priority(module) = Specialization_Score * Complexity_Weight * History_Bonus
   */
  calculateModulePriorities(questionType, complexity) {
    const priorities = {};
    
    for (const [module, specializations] of Object.entries(this.moduleSpecializations)) {
      // Specialization Score (0-1)
      const specializationScore = specializations.includes(questionType) ? 1.0 : 0.3;
      
      // Complexity Weight (1-5)
      const complexityWeight = complexity;
      
      // History Bonus (1.0-1.5)
      const historyBonus = this.getHistoryBonus(module);
      
      // FINAL PRIORITY
      priorities[module] = specializationScore * complexityWeight * historyBonus;
    }
    
    // Sortuj po priorytecie
    return Object.fromEntries(
      Object.entries(priorities).sort(([,a], [,b]) => b - a)
    );
  }

  /**
   * WYBIERZ GŁOWICE (ciężkie/lekkie)
   * 
   * ZASADA:
   * - Prosty problem = lekkie głowice (100 mózgów, szybko)
   * - Złożony problem = ciężkie głowice (1000 mózgów, dokładnie)
   */
  selectHeads(complexity, context) {
    // LEKKIE GŁOWICE (szybkie, przybliżone)
    if (complexity <= this.complexityLevels.SIMPLE) {
      return {
        type: 'light',
        count: 100,
        speed: 'fast',
        accuracy: 'approximate',
        estimatedTime: 50 // ms
      };
    }
    
    // ŚREDNIE GŁOWICE (balans)
    if (complexity <= this.complexityLevels.MODERATE) {
      return {
        type: 'medium',
        count: 500,
        speed: 'balanced',
        accuracy: 'good',
        estimatedTime: 200 // ms
      };
    }
    
    // CIĘŻKIE GŁOWICE (wolne, dokładne)
    return {
      type: 'heavy',
      count: 1000,
      speed: 'thorough',
      accuracy: 'precise',
      estimatedTime: 500 // ms
    };
  }

  /**
   * OBLICZ BALANS (logika/kreatywność)
   * 
   * MATEMATYKA:
   * Balance = f(questionType, complexity)
   */
  calculateBalance(questionType, complexity) {
    let logic = 0.5;
    let creativity = 0.5;
    
    // Typ pytania wpływa na balans
    switch (questionType) {
      case this.questionTypes.MATHEMATICAL:
      case this.questionTypes.LOGICAL:
        logic = 0.8;
        creativity = 0.2;
        break;
        
      case this.questionTypes.CREATIVE:
        logic = 0.2;
        creativity = 0.8;
        break;
        
      case this.questionTypes.STRATEGIC:
        logic = 0.6;
        creativity = 0.4;
        break;
        
      case this.questionTypes.ANALYTICAL:
        logic = 0.7;
        creativity = 0.3;
        break;
    }
    
    // Złożoność wpływa na balans
    // Im bardziej złożone, tym więcej kreatywności
    const complexityBonus = (complexity - 1) * 0.05;
    creativity += complexityBonus;
    logic -= complexityBonus;
    
    // Normalizuj (suma = 1.0)
    const total = logic + creativity;
    logic /= total;
    creativity /= total;
    
    return { logic, creativity };
  }

  /**
   * OKREŚL STRATEGIĘ ROTACJI
   */
  determineRotationStrategy(questionType, complexity) {
    // SEQUENTIAL - jeden moduł po drugim
    if (complexity <= this.complexityLevels.SIMPLE) {
      return {
        type: 'sequential',
        description: 'Execute modules one by one',
        parallelism: 1
      };
    }
    
    // PARALLEL - wiele modułów jednocześnie
    if (complexity <= this.complexityLevels.MODERATE) {
      return {
        type: 'parallel',
        description: 'Execute multiple modules simultaneously',
        parallelism: 3
      };
    }
    
    // ADAPTIVE - adaptacyjna rotacja
    return {
      type: 'adaptive',
      description: 'Dynamically rotate modules based on results',
      parallelism: 5
    };
  }

  /**
   * ZBUDUJ PIPELINE
   */
  buildPipeline(decision) {
    const steps = [];
    
    // KROK 1: Priorytetyzacja (Regent)
    steps.push({
      name: 'Regent Prioritization',
      module: 'regent',
      priority: 10,
      estimatedTime: 10
    });
    
    // KROK 2: Top 3 moduły (według priorytetów)
    const topModules = Object.entries(decision.modulePriorities)
      .slice(0, 3)
      .map(([module, priority], index) => ({
        name: `Module: ${module}`,
        module: module,
        priority: 9 - index,
        estimatedTime: decision.headSelection.estimatedTime
      }));
    
    steps.push(...topModules);
    
    // KROK 3: Interlocking (zazębianie)
    steps.push({
      name: 'Interlocking Synthesis',
      module: 'interlocking',
      priority: 7,
      estimatedTime: 50
    });
    
    // KROK 4: Fact Checker (weryfikacja)
    steps.push({
      name: 'Fact Verification',
      module: 'factChecker',
      priority: 8,
      estimatedTime: 30
    });
    
    // KROK 5: Final Output
    steps.push({
      name: 'Final Output',
      module: 'output',
      priority: 6,
      estimatedTime: 10
    });
    
    return {
      steps: steps,
      totalEstimatedTime: steps.reduce((sum, s) => sum + s.estimatedTime, 0),
      strategy: decision.rotationStrategy.type
    };
  }

  /**
   * HISTORY BONUS
   */
  getHistoryBonus(module) {
    // Jeśli moduł był używany i dawał dobre wyniki, daj bonus
    const moduleHistory = this.decisionHistory.filter(d => 
      d.modulePriorities && Object.keys(d.modulePriorities)[0] === module
    );
    
    if (moduleHistory.length === 0) return 1.0;
    
    // +5% za każde 10 użyć (max +50%)
    const bonus = Math.min(0.5, (moduleHistory.length / 10) * 0.05);
    return 1.0 + bonus;
  }

  /**
   * UPDATE STATS
   */
  updateStats(decision) {
    this.stats.totalDecisions++;
    
    // Średnia złożoność
    this.stats.averageComplexity = 
      (this.stats.averageComplexity * (this.stats.totalDecisions - 1) + decision.complexity) 
      / this.stats.totalDecisions;
    
    // Użycie modułów
    for (const module of Object.keys(decision.modulePriorities)) {
      this.stats.moduleUsage[module] = (this.stats.moduleUsage[module] || 0) + 1;
    }
    
    // Rotacje
    if (decision.rotationStrategy.type !== 'sequential') {
      this.stats.rotationCount++;
    }
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      totalDecisions: this.stats.totalDecisions,
      averageComplexity: this.stats.averageComplexity.toFixed(2),
      moduleUsage: this.stats.moduleUsage,
      rotationCount: this.stats.rotationCount,
      historySize: this.decisionHistory.length
    };
  }
}

module.exports = RegentSystem;
