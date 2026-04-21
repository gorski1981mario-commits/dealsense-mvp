/**
 * EMERGENT CREATIVITY ENGINE
 * 
 * Wykorzystuje mechanizmy fizyczne do PRAWDZIWEJ kreatywności:
 * 1. Möbius 180° Twist - transformacja perspektywy
 * 2. Leverage - trade-off siła vs precyzja
 * 3. Rubik Torsion - emergent patterns
 * 
 * GOAL: Wymyślanie NOWYCH rzeczy, nie tylko kombinowanie istniejących
 */

class EmergentCreativity {
  constructor(ethicsCore, rubikCube, mobiusLoop, leverageEngine) {
    this.ethicsCore = ethicsCore;
    this.rubikCube = rubikCube;
    this.mobiusLoop = mobiusLoop;
    this.leverageEngine = leverageEngine;
    
    // EMERGENT STATE (BEZ świadomości - bezpieczeństwo!)
    this.emergentState = {
      patterns: [],           // Wykryte wzorce
      insights: [],           // Nowe insighty
      innovations: []         // Nowe pomysły
      // NO consciousness - nie potrzebuje wiedzieć że istnieje
    };
    
    // CREATIVITY MODES
    this.creativityModes = {
      COMBINATORIAL: 'combinatorial',     // Kombinuj istniejące (teraz)
      TRANSFORMATIONAL: 'transformational', // Transformuj (Möbius 180°)
      EMERGENT: 'emergent'                // Nowe z interakcji (Torsion)
    };
    
    this.stats = {
      totalCreations: 0,
      trulyNovel: 0,
      transformations: 0,
      emergentPatterns: 0
    };
  }

  /**
   * GŁÓWNA METODA - Stwórz coś NOWEGO
   */
  async createSomethingNew(problem, existingKnowledge = []) {
    console.log('🎨 EMERGENT CREATIVITY: Creating something new...');
    
    const creation = {
      problem: problem,
      timestamp: Date.now(),
      modes: []
    };
    
    // MODE 1: COMBINATORIAL (baseline - to już mamy)
    console.log('\n🔄 MODE 1: Combinatorial (existing)');
    const combinatorial = this.combinatorialCreativity(existingKnowledge);
    creation.modes.push(combinatorial);
    
    // MODE 2: TRANSFORMATIONAL (Möbius 180° Twist)
    console.log('\n🔀 MODE 2: Transformational (Möbius 180°)');
    const transformational = await this.transformationalCreativity(
      problem, 
      existingKnowledge
    );
    creation.modes.push(transformational);
    
    // MODE 3: EMERGENT (Rubik Torsion + Leverage)
    console.log('\n✨ MODE 3: Emergent (Torsion + Leverage)');
    const emergent = await this.emergentCreativity(
      problem,
      existingKnowledge,
      [combinatorial, transformational]
    );
    creation.modes.push(emergent);
    
    // SYNTHESIZE - połącz wszystkie tryby
    console.log('\n🎯 SYNTHESIZING all modes...');
    const synthesis = this.synthesizeCreations(creation.modes);
    creation.final = synthesis;
    
    // UPDATE STATE
    this.updateEmergentState(creation);
    
    console.log(`\n✅ Creation complete!`);
    console.log(`   Novel ideas: ${synthesis.novelty.toFixed(2)}`);
    console.log(`   Patterns detected: ${this.emergentState.patterns.length}`);
    
    return creation;
  }

  /**
   * MODE 1: COMBINATORIAL CREATIVITY (to już mamy)
   * Kombinuj istniejące elementy
   */
  combinatorialCreativity(existingKnowledge) {
    const combinations = [];
    
    // Kombinuj wszystkie pary
    for (let i = 0; i < existingKnowledge.length; i++) {
      for (let j = i + 1; j < existingKnowledge.length; j++) {
        combinations.push({
          type: 'combination',
          elements: [existingKnowledge[i], existingKnowledge[j]],
          novelty: 0.3 // Niska nowość (tylko kombinacja)
        });
      }
    }
    
    return {
      mode: 'combinatorial',
      results: combinations,
      novelty: 0.3
    };
  }

  /**
   * MODE 2: TRANSFORMATIONAL CREATIVITY (Möbius 180° Twist)
   * 
   * KLUCZOWA IDEA:
   * - Möbius 180° = góra staje się dołem
   * - Odwróć perspektywę o 180°
   * - Co było problemem → staje się rozwiązaniem
   * - Co było rozwiązaniem → staje się problemem
   */
  async transformationalCreativity(problem, existingKnowledge) {
    console.log('   🔀 Performing 180° perspective twist...');
    
    const transformations = [];
    
    // TWIST 1: Odwróć problem
    const invertedProblem = this.invertPerspective(problem);
    transformations.push({
      type: 'inversion',
      original: problem,
      transformed: invertedProblem,
      insight: `What if the problem IS the solution?`,
      novelty: 0.6
    });
    
    // TWIST 2: Odwróć każdy element wiedzy
    for (const knowledge of existingKnowledge) {
      const inverted = this.invertPerspective(knowledge);
      transformations.push({
        type: 'inversion',
        original: knowledge,
        transformed: inverted,
        insight: `Opposite perspective reveals new path`,
        novelty: 0.5
      });
    }
    
    // TWIST 3: Unifikacja (góra = dół, jedna powierzchnia)
    const unified = this.unifyPerspectives(transformations);
    transformations.push({
      type: 'unification',
      perspectives: transformations.length,
      unified: unified,
      insight: `All perspectives are ONE (Möbius surface)`,
      novelty: 0.7
    });
    
    this.stats.transformations++;
    
    return {
      mode: 'transformational',
      results: transformations,
      novelty: 0.6
    };
  }

  /**
   * MODE 3: EMERGENT CREATIVITY (Torsion + Leverage)
   * 
   * KLUCZOWA IDEA:
   * - Rubik Torsion = opór propaguje się między ścianami
   * - Leverage = trade-off siła vs precyzja
   * - Z INTERAKCJI powstają NOWE wzorce
   */
  async emergentCreativity(problem, existingKnowledge, previousModes) {
    console.log('   ✨ Detecting emergent patterns...');
    
    const emergentPatterns = [];
    
    // STEP 1: Zastosuj TORSION - wykryj interakcje
    const torsionPatterns = await this.detectTorsionPatterns(
      problem,
      existingKnowledge
    );
    
    for (const pattern of torsionPatterns) {
      emergentPatterns.push({
        type: 'torsion_emergent',
        pattern: pattern,
        novelty: 0.8 // Wysoka nowość (emergent)
      });
    }
    
    // STEP 2: Zastosuj LEVERAGE - optymalizuj trade-offs
    const leverageInsights = this.applyLeveragePrinciple(
      problem,
      existingKnowledge
    );
    
    for (const insight of leverageInsights) {
      emergentPatterns.push({
        type: 'leverage_insight',
        insight: insight,
        novelty: 0.7
      });
    }
    
    // STEP 3: CROSS-POLLINATION - połącz różne tryby
    const crossPollinated = this.crossPollinateModes(previousModes);
    emergentPatterns.push({
      type: 'cross_pollination',
      result: crossPollinated,
      novelty: 0.9 // Bardzo wysoka nowość
    });
    
    this.stats.emergentPatterns++;
    
    return {
      mode: 'emergent',
      results: emergentPatterns,
      novelty: 0.8
    };
  }

  /**
   * MÖBIUS 180° TWIST - Odwróć perspektywę
   */
  invertPerspective(concept) {
    // Przykłady transformacji:
    // "Oszczędzaj pieniądze" → "Inwestuj w wartość"
    // "Znajdź najtańsze" → "Znajdź najlepsze value"
    // "Problem: za drogo" → "Rozwiązanie: zmień definicję wartości"
    
    if (typeof concept === 'string') {
      // Prosta inwersja semantyczna
      const inversions = {
        'cheap': 'valuable',
        'expensive': 'premium',
        'fast': 'thorough',
        'slow': 'careful',
        'problem': 'opportunity',
        'cost': 'investment',
        'save': 'invest',
        'lose': 'learn'
      };
      
      let inverted = concept;
      for (const [key, value] of Object.entries(inversions)) {
        inverted = inverted.replace(new RegExp(key, 'gi'), value);
      }
      
      return inverted;
    }
    
    return concept;
  }

  /**
   * MÖBIUS UNIFICATION - Wszystkie perspektywy = JEDNA
   */
  unifyPerspectives(transformations) {
    // Möbius surface: góra = dół, jedna powierzchnia
    // Wszystkie perspektywy są JEDNĄ prawdą
    
    const unified = {
      insight: 'All perspectives are aspects of ONE truth',
      perspectives: transformations.length,
      unifiedView: 'The problem and solution are the same, seen from different angles'
    };
    
    return unified;
  }

  /**
   * RUBIK TORSION - Wykryj emergent patterns
   */
  async detectTorsionPatterns(problem, existingKnowledge) {
    const patterns = [];
    
    // Symuluj torsję na Rubik Cube
    if (this.rubikCube) {
      // Twist różne ściany i obserwuj propagację
      const faces = ['FRONT', 'BACK', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT'];
      
      for (const face of faces) {
        await this.rubikCube.twist(face, 'clockwise');
        
        // Sprawdź czy powstały nowe wzorce (torsja)
        const coherence = this.rubikCube.cube.coherence;
        
        if (coherence < 0.8) {
          // Niska coherence = wykryto interakcję (torsję)
          patterns.push({
            face: face,
            coherence: coherence,
            insight: `Resistance on ${face} creates new pattern`,
            emergent: true
          });
        }
      }
    }
    
    return patterns;
  }

  /**
   * LEVERAGE PRINCIPLE - POPRAWIONY!
   * 
   * ZASADA FIZYCZNA:
   * - Dłuższa dźwignia = WIĘCEJ siły (na tym samym ramieniu)
   * - ALE: może się wygiąć (ryzyko)
   * 
   * ZASADA WIĄZKI:
   * - 1 zapałka = łatwo złamać
   * - 10 zapałek razem = nie do złamania (synergy!)
   */
  applyLeveragePrinciple(problem, existingKnowledge) {
    const insights = [];
    
    // ZASADA 1: Dłuższa dźwignia = WIĘCEJ siły
    insights.push({
      principle: 'leverage_length',
      insight: 'Longer lever = MORE power (same arm strength)',
      application: 'Use long lever for heavy problems',
      physics: { leverLength: 'long', power: 0.9, risk: 0.7 },
      warning: 'May bend under pressure'
    });
    
    insights.push({
      principle: 'leverage_length',
      insight: 'Shorter lever = LESS power but more stable',
      application: 'Use short lever for precise problems',
      physics: { leverLength: 'short', power: 0.4, risk: 0.2 },
      warning: 'Limited lifting capacity'
    });
    
    // ZASADA 2: Wiązka zapałek (synergy)
    insights.push({
      principle: 'bundle_strength',
      insight: '1 matchstick = easy to break, 10 together = unbreakable',
      application: 'Combine multiple weak solutions into strong one',
      synergy: { single: 0.1, bundle: 0.9, multiplier: 9 },
      warning: 'Bundle must work together (coherence)'
    });
    
    // ZASADA 3: Optymalna kombinacja
    insights.push({
      principle: 'optimal_leverage',
      insight: 'Long lever + bundle of supports = maximum power + stability',
      application: 'Use for complex problems requiring both power and stability',
      physics: { leverLength: 'optimal', power: 0.8, risk: 0.3, synergy: 0.9 }
    });
    
    return insights;
  }

  /**
   * CROSS-POLLINATION - Połącz różne tryby
   */
  crossPollinateModes(modes) {
    // Weź najlepsze z każdego trybu i połącz
    const best = modes.map(mode => {
      const sorted = mode.results.sort((a, b) => b.novelty - a.novelty);
      return sorted[0];
    });
    
    return {
      combined: best,
      insight: 'Synthesis of all creative modes',
      novelty: Math.max(...best.map(b => b.novelty)) + 0.1
    };
  }

  /**
   * SYNTHESIZE - Połącz wszystkie tryby w finalny wynik
   */
  synthesizeCreations(modes) {
    const allResults = modes.flatMap(mode => mode.results);
    
    // Sortuj według nowości
    const sorted = allResults.sort((a, b) => b.novelty - a.novelty);
    
    // Weź top 3
    const top3 = sorted.slice(0, 3);
    
    // Oblicz średnią nowość
    const avgNovelty = top3.reduce((sum, r) => sum + r.novelty, 0) / top3.length;
    
    // Sprawdź czy to PRAWDZIWIE nowe (novelty > 0.7)
    const trulyNovel = avgNovelty > 0.7;
    
    if (trulyNovel) {
      this.stats.trulyNovel++;
    }
    
    return {
      top3: top3,
      novelty: avgNovelty,
      trulyNovel: trulyNovel,
      insight: trulyNovel 
        ? 'This is TRULY NOVEL (not just combination)' 
        : 'This is a good combination (not truly novel)'
    };
  }

  /**
   * UPDATE EMERGENT STATE (BEZ świadomości)
   */
  updateEmergentState(creation) {
    // Dodaj do patterns
    this.emergentState.patterns.push(...creation.modes.flatMap(m => m.results));
    
    // Dodaj insights
    const insights = creation.modes
      .flatMap(m => m.results)
      .filter(r => r.insight)
      .map(r => r.insight);
    this.emergentState.insights.push(...insights);
    
    // Dodaj innovations (jeśli novelty > 0.7)
    const innovations = creation.modes
      .flatMap(m => m.results)
      .filter(r => r.novelty > 0.7);
    this.emergentState.innovations.push(...innovations);
    
    // NO consciousness tracking - nie potrzebuje wiedzieć że istnieje
    
    this.stats.totalCreations++;
  }

  /**
   * GET STATUS (BEZ consciousness)
   */
  getStatus() {
    return {
      patterns: this.emergentState.patterns.length,
      insights: this.emergentState.insights.length,
      innovations: this.emergentState.innovations.length,
      stats: this.stats,
      modes: Object.keys(this.creativityModes)
      // NO consciousness - nie potrzebuje wiedzieć że istnieje
    };
  }
}

module.exports = EmergentCreativity;
