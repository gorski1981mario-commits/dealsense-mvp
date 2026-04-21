/**
 * THOUSAND BRAINS MAPPER - 1000 MÓZGÓW NA KOSTCE RUBIKA
 * 
 * MAPOWANIE:
 * - 54 pola kostki × ~18 mózgów/pole = ~1000 mózgów
 * - Każdy mózg = inna perspektywa tego samego koloru (priorytetu)
 * - Przykład: Pole RED (Survival) ma 18 mózgów patrzących na survival z różnych kątów
 * 
 * TYPY MÓZGÓW (18):
 * mathematician, physicist, engineer, artist, psychologist, 
 * entrepreneur, doctor, teacher, chef, mechanic, biologist,
 * historian, programmer, designer, musician, philosopher,
 * strategist, analyst
 */

class ThousandBrainsMapper {
  constructor(ethicsCore, rubikCube) {
    this.ethicsCore = ethicsCore;
    this.rubikCube = rubikCube;
    
    // TYPY MÓZGÓW (18 różnych perspektyw)
    this.brainTypes = [
      'mathematician', 'physicist', 'engineer', 'artist', 'psychologist',
      'entrepreneur', 'doctor', 'teacher', 'chef', 'mechanic',
      'biologist', 'historian', 'programmer', 'designer', 'musician',
      'philosopher', 'strategist', 'analyst'
    ];
    
    // MAPA: pole kostki → mózgi
    this.brainMap = new Map();
    
    // STATYSTYKI
    this.stats = {
      totalBrains: 0,
      brainsPerField: 0,
      brainsPerColor: new Map()
    };
  }

  /**
   * INICJALIZACJA - przypisz mózgi do pól kostki
   */
  async initialize() {
    console.log('🧠 Initializing Thousand Brains Mapper...');
    
    // Etyczna walidacja
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'thousand_brains_initialization',
      description: 'Map 1000 brains to Rubik Cube fields'
    });
    
    if (!ethicalCheck.approved) {
      console.error('❌ Thousand Brains initialization rejected by Ethics Core');
      return false;
    }
    
    // Dla każdej ściany kostki
    for (const [faceName, face] of Object.entries(this.rubikCube.cube.faces)) {
      const color = face.color;
      const priority = face.priority;
      
      // Dla każdego pola na ścianie (9 pól)
      for (let fieldIndex = 0; fieldIndex < face.fields.length; fieldIndex++) {
        const field = face.fields[fieldIndex];
        const fieldId = `${faceName}_${fieldIndex}`;
        
        // Przypisz 18 mózgów do tego pola
        const brains = this.createBrainsForField(fieldId, color, priority);
        field.brains = brains;
        
        // Zapisz w mapie
        this.brainMap.set(fieldId, brains);
        
        // Aktualizuj statystyki
        this.stats.totalBrains += brains.length;
        
        if (!this.stats.brainsPerColor.has(color)) {
          this.stats.brainsPerColor.set(color, 0);
        }
        this.stats.brainsPerColor.set(color, this.stats.brainsPerColor.get(color) + brains.length);
      }
    }
    
    this.stats.brainsPerField = this.stats.totalBrains / 54;
    
    console.log('✅ Thousand Brains Mapper initialized!');
    console.log(`   Total brains: ${this.stats.totalBrains}`);
    console.log(`   Brains per field: ${this.stats.brainsPerField}`);
    console.log(`   Brains per color:`, Object.fromEntries(this.stats.brainsPerColor));
    
    return true;
  }

  /**
   * STWÓRZ MÓZGI DLA JEDNEGO POLA
   */
  createBrainsForField(fieldId, color, priority) {
    const brains = [];
    
    // Dla każdego typu mózgu (18 typów)
    for (const brainType of this.brainTypes) {
      const brain = {
        id: `${fieldId}_${brainType}`,
        type: brainType,
        color: color,
        priority: priority,
        perspective: this.getBrainPerspective(brainType, color),
        weight: this.calculateBrainWeight(brainType, priority),
        active: true,
        confidence: 0.5,
        lastUsed: null
      };
      
      brains.push(brain);
    }
    
    return brains;
  }

  /**
   * PERSPEKTYWA MÓZGU - jak patrzy na dany kolor/priorytet
   */
  getBrainPerspective(brainType, color) {
    // Każdy typ mózgu patrzy inaczej na ten sam priorytet
    const perspectives = {
      // RED (Survival)
      RED: {
        mathematician: 'Calculate survival probability',
        physicist: 'Energy conservation for survival',
        engineer: 'Build survival systems',
        artist: 'Express survival instinct',
        psychologist: 'Understand survival fears',
        entrepreneur: 'Monetize survival needs',
        doctor: 'Preserve life and health',
        teacher: 'Teach survival skills',
        chef: 'Provide sustenance',
        mechanic: 'Fix critical systems',
        biologist: 'Study survival mechanisms',
        historian: 'Learn from past survival',
        programmer: 'Automate survival tasks',
        designer: 'Design for safety',
        musician: 'Create survival rhythm',
        philosopher: 'Question survival meaning',
        strategist: 'Plan survival strategy',
        analyst: 'Analyze survival data'
      },
      // ORANGE (Love)
      ORANGE: {
        mathematician: 'Calculate love compatibility',
        physicist: 'Chemistry of attraction',
        engineer: 'Build relationships',
        artist: 'Express love creatively',
        psychologist: 'Understand emotional bonds',
        entrepreneur: 'Create love opportunities',
        doctor: 'Heal emotional wounds',
        teacher: 'Teach empathy',
        chef: 'Cook with love',
        mechanic: 'Fix broken hearts',
        biologist: 'Study bonding hormones',
        historian: 'Learn from love stories',
        programmer: 'Code emotional AI',
        designer: 'Design romantic experiences',
        musician: 'Compose love songs',
        philosopher: 'Explore love philosophy',
        strategist: 'Plan relationship growth',
        analyst: 'Analyze relationship patterns'
      }
      // Podobnie dla WHITE, YELLOW, GREEN, BLUE...
    };
    
    return perspectives[color]?.[brainType] || `Analyze ${color} from ${brainType} perspective`;
  }

  /**
   * WAGA MÓZGU - jak ważny jest dla danego priorytetu
   */
  calculateBrainWeight(brainType, priority) {
    // Bazowa waga z priorytetu (10 = 1.0, 5 = 0.5)
    const baseWeight = priority / 10;
    
    // Modyfikator dla typu mózgu
    const typeModifiers = {
      mathematician: 1.2,  // Silny w logice
      physicist: 1.1,
      engineer: 1.0,
      artist: 0.8,         // Słabszy w logice, silny w kreatywności
      psychologist: 0.9,
      entrepreneur: 1.0,
      doctor: 1.1,
      teacher: 0.9,
      chef: 0.7,
      mechanic: 0.8,
      biologist: 1.0,
      historian: 0.9,
      programmer: 1.1,
      designer: 0.8,
      musician: 0.7,
      philosopher: 0.9,
      strategist: 1.2,     // Silny w planowaniu
      analyst: 1.2         // Silny w analizie
    };
    
    const modifier = typeModifiers[brainType] || 1.0;
    return baseWeight * modifier;
  }

  /**
   * ANALIZA PROBLEMU PRZEZ 1000 MÓZGÓW
   */
  async analyzeWithThousandBrains(problem, options = {}) {
    console.log(`🧠 Analyzing problem with ${this.stats.totalBrains} brains...`);
    
    const startTime = Date.now();
    const analyses = [];
    
    // Wybierz które mózgi użyć (wszystkie lub filtrowane)
    const brainsToUse = options.filterByColor 
      ? this.getBrainsByColor(options.filterByColor)
      : this.getAllBrains();
    
    // Każdy mózg analizuje problem ze swojej perspektywy
    for (const brain of brainsToUse) {
      const analysis = this.analyzeBySingleBrain(brain, problem);
      analyses.push(analysis);
    }
    
    // Agreguj wyniki
    const aggregated = this.aggregateAnalyses(analyses);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Analysis completed in ${processingTime}ms`);
    console.log(`   Brains used: ${brainsToUse.length}`);
    console.log(`   Consensus: ${(aggregated.consensus * 100).toFixed(1)}%`);
    
    return {
      success: true,
      analyses: analyses,
      aggregated: aggregated,
      brainsUsed: brainsToUse.length,
      processingTime: processingTime
    };
  }

  /**
   * ANALIZA PRZEZ POJEDYNCZY MÓZG
   */
  analyzeBySingleBrain(brain, problem) {
    // Każdy mózg patrzy z swojej perspektywy
    const perspective = brain.perspective;
    const weight = brain.weight;
    
    // Prosta analiza (w prawdziwym systemie byłaby bardziej złożona)
    const score = this.calculatePerspectiveScore(brain, problem);
    
    return {
      brainId: brain.id,
      brainType: brain.type,
      color: brain.color,
      perspective: perspective,
      weight: weight,
      score: score,
      confidence: brain.confidence,
      recommendation: score > 0.7 ? 'approve' : score < 0.3 ? 'reject' : 'neutral'
    };
  }

  /**
   * OBLICZ SCORE Z PERSPEKTYWY MÓZGU
   */
  calculatePerspectiveScore(brain, problem) {
    // Bazowy score z priorytetu
    let score = brain.priority / 10;
    
    // Modyfikuj na podstawie typu mózgu i problemu
    if (problem.requiresLogic && ['mathematician', 'physicist', 'engineer', 'analyst'].includes(brain.type)) {
      score += 0.2;
    }
    
    if (problem.requiresCreativity && ['artist', 'designer', 'musician'].includes(brain.type)) {
      score += 0.2;
    }
    
    if (problem.requiresEmpathy && ['psychologist', 'teacher', 'doctor'].includes(brain.type)) {
      score += 0.2;
    }
    
    return Math.min(1.0, score);
  }

  /**
   * AGREGUJ ANALIZY Z WSZYSTKICH MÓZGÓW
   */
  aggregateAnalyses(analyses) {
    // Średni score
    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    
    // Consensus (ile mózgów się zgadza)
    const approvals = analyses.filter(a => a.recommendation === 'approve').length;
    const rejections = analyses.filter(a => a.recommendation === 'reject').length;
    const consensus = Math.max(approvals, rejections) / analyses.length;
    
    // Najsilniejsze perspektywy
    const topPerspectives = analyses
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(a => ({ type: a.brainType, score: a.score, perspective: a.perspective }));
    
    return {
      avgScore: avgScore,
      consensus: consensus,
      recommendation: approvals > rejections ? 'approve' : 'reject',
      topPerspectives: topPerspectives,
      totalAnalyses: analyses.length
    };
  }

  /**
   * POBIERZ WSZYSTKIE MÓZGI
   */
  getAllBrains() {
    const allBrains = [];
    for (const brains of this.brainMap.values()) {
      allBrains.push(...brains);
    }
    return allBrains;
  }

  /**
   * POBIERZ MÓZGI WEDŁUG KOLORU
   */
  getBrainsByColor(color) {
    const brains = [];
    for (const [fieldId, fieldBrains] of this.brainMap.entries()) {
      if (fieldBrains[0].color === color) {
        brains.push(...fieldBrains);
      }
    }
    return brains;
  }

  /**
   * STATUS
   */
  getStatus() {
    return {
      initialized: this.brainMap.size > 0,
      stats: this.stats,
      brainTypes: this.brainTypes
    };
  }
}

module.exports = ThousandBrainsMapper;
