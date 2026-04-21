/**
 * UNIVERSAL CREATIVITY ENGINE
 * 
 * AGI-LIKE CREATIVITY - działa w KAŻDEJ domenie:
 * - DealSense (shopping)
 * - Technology (baterie, AI, etc.)
 * - Medicine (leczenie, diagnostyka)
 * - Education (nauczanie, learning)
 * - Business (strategie, marketing)
 * - Science (badania, odkrycia)
 * - Art (muzyka, malarstwo, design)
 * - Engineering (konstrukcje, systemy)
 * - ANY DOMAIN
 * 
 * LEARNING CURVE EFFECT:
 * - Pierwszy raz = bardzo trudne (0.1 difficulty)
 * - Drugi raz = łatwiejsze (0.5 difficulty)
 * - Trzeci raz = łatwe (0.8 difficulty)
 * - Im szybciej powtórzysz, tym lepiej (time decay)
 */

class UniversalCreativity {
  constructor(ethicsCore, rubikCube, mobiusLoop, leverageEngine) {
    this.ethicsCore = ethicsCore;
    this.rubikCube = rubikCube;
    this.mobiusLoop = mobiusLoop;
    this.leverageEngine = leverageEngine;
    
    // UNIVERSAL KNOWLEDGE BASE
    this.knowledgeBase = {
      domains: new Map(),        // Wszystkie domeny (shopping, tech, medicine, etc.)
      patterns: new Map(),       // Wzorce cross-domain
      innovations: []            // Innowacje
    };
    
    // LEARNING CURVE TRACKING
    this.learningCurves = new Map(); // task -> {attempts, lastAttempt, difficulty}
    
    // DOMAIN EXPERTISE (rośnie z czasem)
    this.domainExpertise = new Map(); // domain -> expertise level (0-1)
    
    this.stats = {
      totalCreations: 0,
      domainsExplored: 0,
      crossDomainInsights: 0,
      learningCurveImprovements: 0
    };
  }

  /**
   * GŁÓWNA METODA - Stwórz coś NOWEGO (w DOWOLNEJ domenie)
   */
  async createInDomain(problem, domain = 'general') {
    console.log(`🎨 UNIVERSAL CREATIVITY: Creating in domain "${domain}"...`);
    
    // LEARNING CURVE: Sprawdź czy to już robiliśmy
    const taskId = `${domain}:${problem.description || problem.query}`;
    const learningCurve = this.getLearningCurve(taskId);
    
    console.log(`\n📈 LEARNING CURVE:`);
    console.log(`   Attempts: ${learningCurve.attempts}`);
    console.log(`   Difficulty: ${(learningCurve.difficulty * 100).toFixed(0)}%`);
    console.log(`   Time since last: ${learningCurve.timeSinceLastAttempt}ms`);
    
    const creation = {
      problem: problem,
      domain: domain,
      timestamp: Date.now(),
      learningCurve: learningCurve,
      modes: []
    };
    
    // KROK 1: Zbierz wiedzę z tej domeny
    const domainKnowledge = this.getDomainKnowledge(domain);
    
    // KROK 2: Zbierz wzorce z innych domen (cross-domain)
    const crossDomainPatterns = this.getCrossDomainPatterns(domain);
    
    // KROK 3: Kombinuj wiedzę z różnych domen
    console.log('\n🔄 MODE 1: Cross-Domain Combination');
    const combinatorial = this.crossDomainCombination(
      domainKnowledge,
      crossDomainPatterns
    );
    creation.modes.push(combinatorial);
    
    // KROK 4: Transformuj perspektywę (Möbius 180°)
    console.log('\n🔀 MODE 2: Perspective Transformation');
    const transformational = await this.transformPerspective(
      problem,
      domain,
      domainKnowledge
    );
    creation.modes.push(transformational);
    
    // KROK 5: Emergent patterns (Torsion + Leverage)
    console.log('\n✨ MODE 3: Emergent Innovation');
    const emergent = await this.emergentInnovation(
      problem,
      domain,
      [combinatorial, transformational]
    );
    creation.modes.push(emergent);
    
    // KROK 6: Synteza
    console.log('\n🎯 SYNTHESIZING...');
    const synthesis = this.synthesize(creation.modes, learningCurve);
    creation.final = synthesis;
    
    // KROK 7: Update learning curve
    this.updateLearningCurve(taskId, synthesis.success);
    
    // KROK 8: Update domain expertise
    this.updateDomainExpertise(domain, synthesis.novelty);
    
    // KROK 9: Zapisz do knowledge base
    this.saveToKnowledgeBase(domain, creation);
    
    console.log(`\n✅ Creation complete!`);
    console.log(`   Domain: ${domain}`);
    console.log(`   Novelty: ${synthesis.novelty.toFixed(2)}`);
    console.log(`   Difficulty: ${(learningCurve.difficulty * 100).toFixed(0)}%`);
    console.log(`   Expertise: ${(this.domainExpertise.get(domain) * 100).toFixed(0)}%`);
    
    return creation;
  }

  /**
   * LEARNING CURVE EFFECT
   * 
   * Pierwszy raz = bardzo trudne (difficulty 0.1)
   * Drugi raz = łatwiejsze (difficulty 0.5)
   * Trzeci raz = łatwe (difficulty 0.8)
   * Im szybciej powtórzysz, tym lepiej (time decay)
   */
  getLearningCurve(taskId) {
    if (!this.learningCurves.has(taskId)) {
      // Pierwszy raz - bardzo trudne!
      return {
        attempts: 0,
        difficulty: 0.1,  // 10% - bardzo trudne
        lastAttempt: null,
        timeSinceLastAttempt: Infinity
      };
    }
    
    const curve = this.learningCurves.get(taskId);
    const now = Date.now();
    const timeSinceLastAttempt = curve.lastAttempt ? now - curve.lastAttempt : Infinity;
    
    // Oblicz difficulty z learning curve
    let difficulty = 0.1; // Bazowa trudność
    
    // Im więcej prób, tym łatwiej
    difficulty += curve.attempts * 0.2; // +20% za każdą próbę
    difficulty = Math.min(difficulty, 0.9); // Max 90%
    
    // Time decay - im później powtórzysz, tym trudniej
    const hoursSinceLastAttempt = timeSinceLastAttempt / (1000 * 60 * 60);
    if (hoursSinceLastAttempt < 1) {
      // < 1h - świeże w pamięci, +20% łatwości
      difficulty += 0.2;
    } else if (hoursSinceLastAttempt < 24) {
      // < 24h - jeszcze pamiętasz, +10% łatwości
      difficulty += 0.1;
    } else if (hoursSinceLastAttempt < 168) {
      // < 1 tydzień - trochę pamiętasz, +5% łatwości
      difficulty += 0.05;
    }
    // > 1 tydzień - zapomniałeś, brak bonusu
    
    difficulty = Math.min(difficulty, 1.0);
    
    return {
      attempts: curve.attempts,
      difficulty: difficulty,
      lastAttempt: curve.lastAttempt,
      timeSinceLastAttempt: timeSinceLastAttempt
    };
  }

  /**
   * UPDATE LEARNING CURVE
   */
  updateLearningCurve(taskId, success) {
    const existing = this.learningCurves.get(taskId) || { attempts: 0, lastAttempt: null };
    
    this.learningCurves.set(taskId, {
      attempts: existing.attempts + 1,
      lastAttempt: Date.now(),
      success: success
    });
    
    this.stats.learningCurveImprovements++;
  }

  /**
   * CROSS-DOMAIN COMBINATION
   * 
   * Kombinuj wiedzę z RÓŻNYCH domen
   * Przykład: Shopping + Medicine = Health Shopping
   */
  crossDomainCombination(domainKnowledge, crossDomainPatterns) {
    const combinations = [];
    
    // Kombinuj wiedzę z tej domeny z wzorcami z innych domen
    for (const knowledge of domainKnowledge) {
      for (const pattern of crossDomainPatterns) {
        combinations.push({
          type: 'cross_domain',
          from: pattern.domain,
          to: knowledge.domain,
          combination: `${knowledge.concept} + ${pattern.concept}`,
          novelty: 0.6 // Średnia nowość (cross-domain)
        });
      }
    }
    
    return {
      mode: 'cross_domain',
      results: combinations,
      novelty: 0.6
    };
  }

  /**
   * TRANSFORM PERSPECTIVE (Möbius 180°)
   */
  async transformPerspective(problem, domain, domainKnowledge) {
    const transformations = [];
    
    // Odwróć perspektywę o 180°
    transformations.push({
      type: 'inversion',
      original: problem.description || problem.query,
      transformed: this.invertConcept(problem.description || problem.query),
      novelty: 0.7
    });
    
    return {
      mode: 'transformational',
      results: transformations,
      novelty: 0.7
    };
  }

  /**
   * EMERGENT INNOVATION (Torsion + Leverage)
   */
  async emergentInnovation(problem, domain, previousModes) {
    const innovations = [];
    
    // Zastosuj torsję (jeśli mamy Rubik Cube)
    if (this.rubikCube) {
      const faces = ['FRONT', 'BACK', 'TOP'];
      for (const face of faces) {
        await this.rubikCube.twist(face, 'clockwise');
        const coherence = this.rubikCube.cube.coherence;
        
        if (coherence < 0.8) {
          innovations.push({
            type: 'torsion_emergent',
            face: face,
            coherence: coherence,
            novelty: 0.8
          });
        }
      }
    }
    
    // Cross-pollination
    innovations.push({
      type: 'cross_pollination',
      modes: previousModes.length,
      novelty: 0.9
    });
    
    return {
      mode: 'emergent',
      results: innovations,
      novelty: 0.8
    };
  }

  /**
   * SYNTHESIZE
   */
  synthesize(modes, learningCurve) {
    const allResults = modes.flatMap(mode => mode.results);
    const sorted = allResults.sort((a, b) => b.novelty - a.novelty);
    const top3 = sorted.slice(0, 3);
    
    let avgNovelty = top3.reduce((sum, r) => sum + r.novelty, 0) / top3.length;
    
    // LEARNING CURVE BONUS: Im więcej prób, tym lepszy wynik
    avgNovelty *= (0.5 + learningCurve.difficulty * 0.5);
    
    return {
      top3: top3,
      novelty: avgNovelty,
      success: avgNovelty > 0.6,
      learningCurveBonus: learningCurve.difficulty
    };
  }

  /**
   * DOMAIN KNOWLEDGE
   */
  getDomainKnowledge(domain) {
    if (!this.knowledgeBase.domains.has(domain)) {
      // Inicjalizuj nową domenę
      this.knowledgeBase.domains.set(domain, []);
      this.domainExpertise.set(domain, 0.1); // Początkowa expertise
      this.stats.domainsExplored++;
    }
    
    return this.knowledgeBase.domains.get(domain);
  }

  /**
   * CROSS-DOMAIN PATTERNS
   */
  getCrossDomainPatterns(currentDomain) {
    const patterns = [];
    
    // Zbierz wzorce z INNYCH domen
    for (const [domain, knowledge] of this.knowledgeBase.domains) {
      if (domain !== currentDomain) {
        for (const item of knowledge) {
          patterns.push({
            domain: domain,
            concept: item.concept || item.description,
            pattern: item.pattern
          });
        }
      }
    }
    
    return patterns;
  }

  /**
   * UPDATE DOMAIN EXPERTISE
   */
  updateDomainExpertise(domain, novelty) {
    const current = this.domainExpertise.get(domain) || 0.1;
    const improvement = novelty * 0.1; // +10% za każdą innowację
    const newExpertise = Math.min(1.0, current + improvement);
    
    this.domainExpertise.set(domain, newExpertise);
  }

  /**
   * SAVE TO KNOWLEDGE BASE
   */
  saveToKnowledgeBase(domain, creation) {
    const domainKnowledge = this.knowledgeBase.domains.get(domain);
    
    domainKnowledge.push({
      concept: creation.problem.description || creation.problem.query,
      pattern: creation.final.top3[0],
      novelty: creation.final.novelty,
      timestamp: creation.timestamp
    });
    
    this.stats.totalCreations++;
  }

  /**
   * INVERT CONCEPT (Möbius 180°)
   */
  invertConcept(concept) {
    const inversions = {
      'find': 'create',
      'buy': 'sell',
      'save': 'invest',
      'cheap': 'valuable',
      'fast': 'thorough',
      'simple': 'sophisticated',
      'old': 'innovative',
      'problem': 'opportunity'
    };
    
    let inverted = concept;
    for (const [key, value] of Object.entries(inversions)) {
      inverted = inverted.replace(new RegExp(key, 'gi'), value);
    }
    
    return inverted;
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      domains: Array.from(this.knowledgeBase.domains.keys()),
      domainsExplored: this.stats.domainsExplored,
      totalCreations: this.stats.totalCreations,
      learningCurves: this.learningCurves.size,
      domainExpertise: Object.fromEntries(this.domainExpertise),
      stats: this.stats
    };
  }
}

module.exports = UniversalCreativity;
