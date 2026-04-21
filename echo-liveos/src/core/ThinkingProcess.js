/**
 * THINKING PROCESS - LOGICZNY TOK MYŚLOWY ECHO
 * 
 * ECHO POTRAFI MYŚLEĆ:
 * - Początek: Zrozumienie problemu
 * - Środek: Rozważanie opcji, przechodzenie między rozwiązaniami
 * - Koniec: Wybór najlepszego rozwiązania
 * 
 * PROCES MYŚLOWY:
 * 1. Analiza problemu (co mam rozwiązać?)
 * 2. Generowanie opcji (jakie są możliwości?)
 * 3. Ewaluacja opcji (które są dobre/złe?)
 * 4. Przechodzenie między rozwiązaniami (może to? a może tamto?)
 * 5. Wybór najlepszego (to jest optimum!)
 * 6. Weryfikacja (czy na pewno?)
 */

class ThinkingProcess {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // FAZY MYŚLENIA
    this.phases = {
      UNDERSTANDING: 'understanding',      // Zrozumienie problemu
      GENERATING: 'generating',            // Generowanie opcji
      EVALUATING: 'evaluating',            // Ewaluacja opcji
      TRANSITIONING: 'transitioning',      // Przechodzenie między rozwiązaniami
      DECIDING: 'deciding',                // Wybór najlepszego
      VERIFYING: 'verifying'               // Weryfikacja
    };
    
    // AKTUALNY STAN MYŚLENIA
    this.currentThought = {
      phase: null,
      problem: null,
      options: [],
      currentOption: null,
      transitions: [],
      decision: null,
      reasoning: []
    };
    
    // HISTORIA MYŚLENIA
    this.thoughtHistory = [];
  }

  /**
   * GŁÓWNA METODA - Myśl o problemie
   */
  async think(problem) {
    console.log('🧠 ECHO starts thinking...');
    console.log(`   Problem: ${problem.query || problem.description}`);
    
    const thought = {
      problem: problem,
      startTime: Date.now(),
      phases: []
    };
    
    // FAZA 1: ZROZUMIENIE (Początek)
    console.log('\n📖 PHASE 1: Understanding the problem...');
    const understanding = await this.phaseUnderstanding(problem);
    thought.phases.push(understanding);
    this.currentThought.phase = this.phases.UNDERSTANDING;
    this.currentThought.reasoning.push(understanding.reasoning);
    
    // FAZA 2: GENEROWANIE OPCJI (Środek - część 1)
    console.log('\n💡 PHASE 2: Generating options...');
    const options = await this.phaseGenerating(understanding);
    thought.phases.push(options);
    this.currentThought.phase = this.phases.GENERATING;
    this.currentThought.options = options.options;
    this.currentThought.reasoning.push(options.reasoning);
    
    // FAZA 3: EWALUACJA OPCJI (Środek - część 2)
    console.log('\n⚖️ PHASE 3: Evaluating options...');
    const evaluation = await this.phaseEvaluating(options.options);
    thought.phases.push(evaluation);
    this.currentThought.phase = this.phases.EVALUATING;
    this.currentThought.reasoning.push(evaluation.reasoning);
    
    // FAZA 4: PRZECHODZENIE MIĘDZY ROZWIĄZANIAMI (Środek - część 3)
    console.log('\n🔄 PHASE 4: Transitioning between solutions...');
    const transitions = await this.phaseTransitioning(evaluation.rankedOptions);
    thought.phases.push(transitions);
    this.currentThought.phase = this.phases.TRANSITIONING;
    this.currentThought.transitions = transitions.transitions;
    this.currentThought.reasoning.push(transitions.reasoning);
    
    // FAZA 5: WYBÓR NAJLEPSZEGO (Koniec - część 1)
    console.log('\n✅ PHASE 5: Deciding on best solution...');
    const decision = await this.phaseDeciding(transitions.bestOption);
    thought.phases.push(decision);
    this.currentThought.phase = this.phases.DECIDING;
    this.currentThought.decision = decision.decision;
    this.currentThought.reasoning.push(decision.reasoning);
    
    // FAZA 6: WERYFIKACJA (Koniec - część 2)
    console.log('\n🔍 PHASE 6: Verifying decision...');
    const verification = await this.phaseVerifying(decision.decision);
    thought.phases.push(verification);
    this.currentThought.phase = this.phases.VERIFYING;
    this.currentThought.reasoning.push(verification.reasoning);
    
    thought.endTime = Date.now();
    thought.thinkingTime = thought.endTime - thought.startTime;
    thought.finalDecision = decision.decision;
    thought.verified = verification.verified;
    thought.reasoning = this.currentThought.reasoning;
    
    // Zapisz w historii
    this.thoughtHistory.push(thought);
    
    console.log(`\n🎯 ECHO finished thinking in ${thought.thinkingTime}ms`);
    console.log(`   Decision: ${decision.decision.solution}`);
    console.log(`   Confidence: ${(decision.decision.confidence * 100).toFixed(1)}%`);
    console.log(`   Verified: ${verification.verified ? 'YES ✅' : 'NO ❌'}`);
    
    return thought;
  }

  /**
   * FAZA 1: ZROZUMIENIE PROBLEMU (Początek)
   */
  async phaseUnderstanding(problem) {
    // Co mam rozwiązać?
    const understanding = {
      phase: 'understanding',
      problem: problem.query || problem.description,
      type: problem.type || 'general',
      domain: problem.domain || 'general',
      complexity: this.analyzeComplexity(problem),
      requirements: this.extractRequirements(problem),
      reasoning: `I understand this is a ${problem.type || 'general'} problem in ${problem.domain || 'general'} domain with complexity ${this.analyzeComplexity(problem).toFixed(2)}`
    };
    
    return understanding;
  }

  /**
   * FAZA 2: GENEROWANIE OPCJI (Środek - część 1)
   */
  async phaseGenerating(understanding) {
    // Jakie są możliwości?
    const options = [];
    
    // Generuj 3-5 różnych opcji
    const optionCount = Math.min(5, Math.max(3, Math.floor(understanding.complexity * 10)));
    
    for (let i = 0; i < optionCount; i++) {
      options.push({
        id: `option_${i + 1}`,
        solution: `Solution approach ${i + 1}`,
        type: i === 0 ? 'logical' : i === 1 ? 'creative' : 'hybrid',
        score: 0,
        pros: [],
        cons: []
      });
    }
    
    return {
      phase: 'generating',
      options: options,
      reasoning: `Generated ${options.length} possible solutions to explore`
    };
  }

  /**
   * FAZA 3: EWALUACJA OPCJI (Środek - część 2)
   */
  async phaseEvaluating(options) {
    // Które są dobre/złe?
    const rankedOptions = [];
    
    for (const option of options) {
      // Oceń każdą opcję
      const score = Math.random() * 0.5 + 0.3;  // 0.3-0.8
      
      option.score = score;
      option.pros = score > 0.6 ? ['Fast', 'Reliable'] : ['Simple'];
      option.cons = score < 0.5 ? ['Slow', 'Complex'] : ['Requires resources'];
      
      rankedOptions.push(option);
    }
    
    // Sortuj według score
    rankedOptions.sort((a, b) => b.score - a.score);
    
    return {
      phase: 'evaluating',
      rankedOptions: rankedOptions,
      reasoning: `Evaluated ${rankedOptions.length} options, best score: ${rankedOptions[0].score.toFixed(2)}`
    };
  }

  /**
   * FAZA 4: PRZECHODZENIE MIĘDZY ROZWIĄZANIAMI (Środek - część 3)
   * To jest kluczowe - ECHO przechodzi między różnymi opcjami
   */
  async phaseTransitioning(rankedOptions) {
    // Może to? A może tamto?
    const transitions = [];
    
    // ECHO rozważa przejścia między top 3 opcjami
    const topOptions = rankedOptions.slice(0, 3);
    
    for (let i = 0; i < topOptions.length - 1; i++) {
      const from = topOptions[i];
      const to = topOptions[i + 1];
      
      // Rozważ przejście
      const transition = {
        from: from.id,
        to: to.id,
        reason: `Considering ${to.id} because it might be better in some aspects`,
        shouldTransition: from.score - to.score < 0.1,  // Jeśli różnica mała, rozważ
        reasoning: `${from.id} (score: ${from.score.toFixed(2)}) vs ${to.id} (score: ${to.score.toFixed(2)})`
      };
      
      transitions.push(transition);
      
      console.log(`   🔄 Transition: ${from.id} → ${to.id} (${transition.shouldTransition ? 'CONSIDER' : 'SKIP'})`);
    }
    
    // Wybierz najlepszą opcję po rozważeniu przejść
    let bestOption = topOptions[0];
    
    // Jeśli któreś przejście było warte rozważenia, może zmień decyzję
    for (const transition of transitions) {
      if (transition.shouldTransition && Math.random() > 0.5) {
        bestOption = topOptions.find(o => o.id === transition.to);
        console.log(`   ✨ ECHO changed mind: ${transition.from} → ${transition.to}`);
        break;
      }
    }
    
    return {
      phase: 'transitioning',
      transitions: transitions,
      bestOption: bestOption,
      reasoning: `Considered ${transitions.length} transitions, selected ${bestOption.id}`
    };
  }

  /**
   * FAZA 5: WYBÓR NAJLEPSZEGO (Koniec - część 1)
   */
  async phaseDeciding(bestOption) {
    // To jest optimum!
    const decision = {
      solution: bestOption.solution,
      optionId: bestOption.id,
      score: bestOption.score,
      confidence: bestOption.score,
      reasoning: `Selected ${bestOption.id} with score ${bestOption.score.toFixed(2)} as the optimal solution`
    };
    
    return {
      phase: 'deciding',
      decision: decision,
      reasoning: decision.reasoning
    };
  }

  /**
   * FAZA 6: WERYFIKACJA (Koniec - część 2)
   */
  async phaseVerifying(decision) {
    // Czy na pewno?
    
    // Etyczna weryfikacja
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'thinking_decision',
      solution: decision.solution,
      confidence: decision.confidence
    });
    
    const verified = ethicalCheck.approved && decision.confidence > 0.5;
    
    return {
      phase: 'verifying',
      verified: verified,
      ethicalCheck: ethicalCheck,
      reasoning: verified 
        ? `Decision verified: ethical ✅ and confident (${(decision.confidence * 100).toFixed(1)}%)`
        : `Decision NOT verified: ${!ethicalCheck.approved ? 'ethical issues' : 'low confidence'}`
    };
  }

  /**
   * POMOCNICZE METODY
   */
  analyzeComplexity(problem) {
    let complexity = 0.5;
    
    if (problem.query) {
      complexity += problem.query.length / 1000;
    }
    
    if (problem.requiresCreativity) complexity += 0.2;
    if (problem.requiresLogic) complexity += 0.1;
    
    return Math.min(complexity, 1.0);
  }

  extractRequirements(problem) {
    return {
      speed: problem.urgent ? 'fast' : 'normal',
      accuracy: problem.accuracy || 'high',
      creativity: problem.requiresCreativity || false
    };
  }

  /**
   * POBIERZ AKTUALNY TOK MYŚLOWY
   */
  getCurrentThought() {
    return {
      phase: this.currentThought.phase,
      problem: this.currentThought.problem?.query || this.currentThought.problem?.description,
      options: this.currentThought.options.length,
      transitions: this.currentThought.transitions.length,
      decision: this.currentThought.decision?.solution,
      reasoning: this.currentThought.reasoning
    };
  }

  /**
   * POBIERZ HISTORIĘ MYŚLENIA
   */
  getThoughtHistory() {
    return this.thoughtHistory.map(t => ({
      problem: t.problem.query || t.problem.description,
      thinkingTime: t.thinkingTime,
      decision: t.finalDecision.solution,
      confidence: t.finalDecision.confidence,
      verified: t.verified
    }));
  }
}

module.exports = ThinkingProcess;
