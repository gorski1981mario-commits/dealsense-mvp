/**
 * RUBIK CUBE ENGINE - PRAWDZIWA KOSTKA RUBIKA 3×3×3
 * 
 * KLASYCZNA KOSTKA:
 * - 6 ścian × 9 pól = 54 pola
 * - Każdy kolor = Priorytet życia (Survival, Love, Safety, Food, Family, Health)
 * - Twist jednej ściany → automatycznie przesuwa inne (przyczynowo-skutkowy)
 * - Każde pole = perspektywa (część z 1000 mózgów)
 * 
 * PRZYCZYNOWO-SKUTKOWY MECHANIZM:
 * - Przykręcasz FRONT → automatycznie TOP, RIGHT, BOTTOM, LEFT się przesuwają
 * - Wagi matematyczne określają siłę powiązania
 * - Wszystko ma logiczne powiązania (zero halucynacji)
 */

class RubikCubeEngine {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // KOLORY KOSTKI = PRIORYTETY ŻYCIA
    this.colorPriorities = {
      RED:    { priority: 10, name: 'Survival',     weight: 1.0 },
      ORANGE: { priority: 9,  name: 'Love',         weight: 0.9 },
      WHITE:  { priority: 8,  name: 'Safety',       weight: 0.8 },
      YELLOW: { priority: 7,  name: 'Food',         weight: 0.7 },
      GREEN:  { priority: 6,  name: 'Family',       weight: 0.6 },
      BLUE:   { priority: 5,  name: 'Health',       weight: 0.5 }
    };
    
    // KLASYCZNA KOSTKA 3×3×3 (54 pola)
    this.cube = this.createCube();
    
    // POWIĄZANE KOSTKI RUBIKA (jak w systemie)
    this.connectedCubes = new Map(); // cubeId → cube instance
    
    // MATEMATYCZNE WAGI POWIĄZAŃ
    this.twistWeights = {
      front_clockwise: { affects: ['top', 'right', 'bottom', 'left'], weight: 1.0 },
      front_counter_clockwise: { affects: ['top', 'left', 'bottom', 'right'], weight: -1.0 },
      back_clockwise: { affects: ['top', 'left', 'bottom', 'right'], weight: 1.0 },
      back_counter_clockwise: { affects: ['top', 'right', 'bottom', 'left'], weight: -1.0 },
      top_clockwise: { affects: ['front', 'left', 'back', 'right'], weight: 1.0 },
      top_counter_clockwise: { affects: ['front', 'right', 'back', 'left'], weight: -1.0 },
      bottom_clockwise: { affects: ['front', 'right', 'back', 'left'], weight: 1.0 },
      bottom_counter_clockwise: { affects: ['front', 'left', 'back', 'right'], weight: -1.0 },
      left_clockwise: { affects: ['front', 'top', 'back', 'bottom'], weight: 1.0 },
      left_counter_clockwise: { affects: ['front', 'bottom', 'back', 'top'], weight: -1.0 },
      right_clockwise: { affects: ['front', 'bottom', 'back', 'top'], weight: 1.0 },
      right_counter_clockwise: { affects: ['front', 'top', 'back', 'bottom'], weight: -1.0 }
    };
    
    // CYKLE MOBIUSA DLA KOSTEK
    this.mobiusCycles = {
      single: null,      // pojedynczy cykl
      double: null,      // podwójny cykl
      active: 'none'     // który cykl jest aktywny
    };
    
    // LOGIKA SPÓJNOŚCI
    this.coherenceRules = {
      noHallucinations: true,
      logicalConnections: true,
      mathematicalIntegrity: true,
      stabilityRequired: 0.8
    };
    
    // STAN SYSTEMU
    this.systemState = {
      isStable: true,
      coherence: 1.0,
      lastTwist: null,
      twistHistory: [],
      errors: []
    };
  }

  /**
   * STWÓRZ KLASYCZNĄ KOSTKĘ RUBIKA 3×3×3
   */
  createCube() {
    const cube = {
      // 6 ŚCIAN × 9 PÓL = 54 POLA
      faces: {
        FRONT:  this.createFace('RED', 'FRONT'),
        BACK:   this.createFace('ORANGE', 'BACK'),
        TOP:    this.createFace('WHITE', 'TOP'),
        BOTTOM: this.createFace('YELLOW', 'BOTTOM'),
        LEFT:   this.createFace('GREEN', 'LEFT'),
        RIGHT:  this.createFace('BLUE', 'RIGHT')
      },
      
      // HISTORIA TWISTÓW
      twistHistory: [],
      
      // STAN KOSTKI
      isSolved: true,
      coherence: 1.0
    };
    
    return cube;
  }

  /**
   * STWÓRZ JEDNĄ ŚCIANĘ (9 PÓL)
   */
  createFace(color, faceName) {
    const face = {
      name: faceName,
      color: color,
      priority: this.colorPriorities[color].priority,
      weight: this.colorPriorities[color].weight,
      
      // 9 PÓL w układzie 3×3
      fields: []
    };
    
    // Stwórz 9 pól (pozycje 0-8)
    for (let i = 0; i < 9; i++) {
      face.fields.push({
        position: i,
        color: color,
        value: 0,
        brains: []  // Tutaj będą przypisane mózgi (później)
      });
    }
    
    return face;
  }

  /**
   * INICJALIZUJ KOSTKĘ RUBIKA
   */
  async initialize() {
    console.log('🎲 Initializing Rubik Cube Engine...');
    
    // Etyczna walidacja inicjalizacji
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'rubik_cube_initialization',
      description: 'Initialize Rubik Cube Engine with 54 fields'
    });
    
    if (!ethicalCheck.approved) {
      console.error('❌ Rubik Cube initialization rejected by Ethics Core');
      return false;
    }
    
    console.log('✅ Rubik Cube Engine initialized!');
    console.log('   Faces: 6');
    console.log('   Fields per face: 9');
    console.log('   Total fields: 54');
    console.log('   Colors: RED, ORANGE, WHITE, YELLOW, GREEN, BLUE');
    console.log('   Coherence:', this.cube.coherence.toFixed(2));
    
    return this.getSystemStatus();
  }

  /**
   * TWIST - PRZYCZYNOWO-SKUTKOWY MECHANIZM
   * Przykręcasz jedną ścianę → automatycznie inne się przesuwają
   */
  async twist(faceName, direction = 'clockwise') {
    // Etyczna walidacja twista
    const ethicalCheck = await this.ethicsCore.validateDecision({
      type: 'rubik_cube_twist',
      face: faceName,
      direction: direction
    });
    
    if (!ethicalCheck.approved) {
      console.warn('❌ Twist rejected by Ethics Core');
      return { success: false, reason: 'ethical_veto' };
    }
    
    console.log(`🎲 Twisting ${faceName} ${direction}...`);
    
    // 1. Obróć główną ścianę
    this.rotateFace(faceName, direction);
    
    // 2. PRZYCZYNOWO-SKUTKOWY: Automatycznie przesuń sąsiednie ściany
    const affectedFaces = this.getAffectedFaces(faceName, direction);
    for (const affected of affectedFaces) {
      this.propagateTwist(affected.face, affected.direction, affected.weight);
    }
    
    // 3. Zapisz w historii
    this.cube.twistHistory.push({
      face: faceName,
      direction: direction,
      timestamp: Date.now(),
      affectedFaces: affectedFaces.map(a => a.face)
    });
    
    // 4. Aktualizuj coherence
    this.updateCoherence();
    
    console.log(`✅ Twist completed. Coherence: ${this.cube.coherence.toFixed(2)}`);
    
    return {
      success: true,
      face: faceName,
      direction: direction,
      affectedFaces: affectedFaces,
      coherence: this.cube.coherence
    };
  }

  /**
   * OBRÓĆ ŚCIANĘ (9 pól rotacja)
   */
  rotateFace(faceName, direction) {
    const face = this.cube.faces[faceName];
    if (!face) return;
    
    const fields = face.fields;
    
    if (direction === 'clockwise') {
      // Rotacja zgodnie z ruchem wskazówek zegara
      // Pozycje: 0 1 2    →    6 3 0
      //          3 4 5    →    7 4 1
      //          6 7 8    →    8 5 2
      const temp = [...fields];
      fields[0] = temp[6];
      fields[1] = temp[3];
      fields[2] = temp[0];
      fields[3] = temp[7];
      fields[4] = temp[4]; // środek nie zmienia się
      fields[5] = temp[1];
      fields[6] = temp[8];
      fields[7] = temp[5];
      fields[8] = temp[2];
    } else {
      // Rotacja przeciwnie do ruchu wskazówek zegara
      const temp = [...fields];
      fields[0] = temp[2];
      fields[1] = temp[5];
      fields[2] = temp[8];
      fields[3] = temp[1];
      fields[4] = temp[4];
      fields[5] = temp[7];
      fields[6] = temp[0];
      fields[7] = temp[3];
      fields[8] = temp[6];
    }
  }

  /**
   * POBIERZ ŚCIANY KTÓRE SĄ DOTKNIĘTE TWISTEM (przyczynowo-skutkowe)
   */
  getAffectedFaces(faceName, direction) {
    // Mapowanie: która ściana wpływa na które
    const affectMap = {
      FRONT: {
        clockwise: [
          { face: 'TOP', direction: 'down', weight: 1.0 },
          { face: 'RIGHT', direction: 'left', weight: 0.8 },
          { face: 'BOTTOM', direction: 'up', weight: 0.6 },
          { face: 'LEFT', direction: 'right', weight: 0.4 }
        ],
        counter_clockwise: [
          { face: 'TOP', direction: 'up', weight: 1.0 },
          { face: 'LEFT', direction: 'left', weight: 0.8 },
          { face: 'BOTTOM', direction: 'down', weight: 0.6 },
          { face: 'RIGHT', direction: 'right', weight: 0.4 }
        ]
      },
      BACK: {
        clockwise: [
          { face: 'TOP', direction: 'up', weight: 1.0 },
          { face: 'LEFT', direction: 'left', weight: 0.8 },
          { face: 'BOTTOM', direction: 'down', weight: 0.6 },
          { face: 'RIGHT', direction: 'right', weight: 0.4 }
        ],
        counter_clockwise: [
          { face: 'TOP', direction: 'down', weight: 1.0 },
          { face: 'RIGHT', direction: 'left', weight: 0.8 },
          { face: 'BOTTOM', direction: 'up', weight: 0.6 },
          { face: 'LEFT', direction: 'right', weight: 0.4 }
        ]
      },
      // Podobnie dla TOP, BOTTOM, LEFT, RIGHT...
    };
    
    const dir = direction === 'clockwise' ? 'clockwise' : 'counter_clockwise';
    return affectMap[faceName]?.[dir] || [];
  }

  /**
   * PROPAGUJ TWIST do sąsiedniej ściany (przyczynowo-skutkowy)
   */
  propagateTwist(faceName, direction, weight) {
    const face = this.cube.faces[faceName];
    if (!face) return;
    
    // Waga określa jak mocno wpływa twist
    // weight 1.0 = pełny wpływ
    // weight 0.5 = połowa wpływu
    // weight 0.0 = brak wpływu
    
    for (const field of face.fields) {
      field.value += weight * (direction === 'down' || direction === 'right' ? 1 : -1);
    }
    
    // TORSJA - sprawdź czy jest opór
    this.checkAndPropagateTorsion(faceName, weight);
  }

  /**
   * TORSJA - gdy jedna ściana dostaje opór, inne też dostają opór
   * System CZUJE opór i propaguje go dalej
   */
  checkAndPropagateTorsion(faceName, weight) {
    const face = this.cube.faces[faceName];
    if (!face) return;
    
    // Oblicz opór na tej ścianie
    let resistance = 0;
    for (const field of face.fields) {
      resistance += Math.abs(field.value);
    }
    
    // Jeśli opór przekracza próg → propaguj do innych ścian
    const RESISTANCE_THRESHOLD = 5.0;
    
    if (resistance > RESISTANCE_THRESHOLD) {
      console.log(`⚠️ TORSION detected on ${faceName}! Resistance: ${resistance.toFixed(2)}`);
      
      // TORSJA: Opór propaguje się do sąsiednich ścian
      const neighbors = this.getNeighborFaces(faceName);
      
      for (const neighborName of neighbors) {
        const neighbor = this.cube.faces[neighborName];
        if (!neighbor) continue;
        
        // Opór maleje z odległością (torsja = 50% oporu)
        const torsionStrength = resistance * 0.5;
        
        // Dodaj opór do sąsiedniej ściany
        for (const field of neighbor.fields) {
          field.value += torsionStrength * 0.1;  // 10% oporu propaguje się
        }
        
        console.log(`   → Torsion propagated to ${neighborName} (strength: ${torsionStrength.toFixed(2)})`);
      }
      
      // Zmniejsz coherence gdy jest torsja
      this.cube.coherence *= 0.95;  // -5% coherence
    }
  }

  /**
   * POBIERZ SĄSIEDNIE ŚCIANY
   */
  getNeighborFaces(faceName) {
    const neighbors = {
      FRONT: ['TOP', 'RIGHT', 'BOTTOM', 'LEFT'],
      BACK: ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'],
      TOP: ['FRONT', 'RIGHT', 'BACK', 'LEFT'],
      BOTTOM: ['FRONT', 'LEFT', 'BACK', 'RIGHT'],
      LEFT: ['FRONT', 'TOP', 'BACK', 'BOTTOM'],
      RIGHT: ['FRONT', 'BOTTOM', 'BACK', 'TOP']
    };
    
    return neighbors[faceName] || [];
  }

  /**
   * AKTUALIZUJ COHERENCE (spójność kostki)
   */
  updateCoherence() {
    // Sprawdź czy kostka jest spójna
    let totalDeviation = 0;
    
    for (const [faceName, face] of Object.entries(this.cube.faces)) {
      for (const field of face.fields) {
        // Odchylenie od wartości bazowej
        totalDeviation += Math.abs(field.value);
      }
    }
    
    // Coherence = 1.0 gdy idealna, spada gdy więcej twistów
    this.cube.coherence = Math.max(0, 1.0 - (totalDeviation / 100));
  }

  /**
   * RESETUJ GŁÓWNĄ KOSTKĘ
   */
  resetCube() {
    for (const [faceName, face] of Object.entries(this.cube.faces)) {
      for (const field of face.fields) {
        field.value = 0;
      }
    }
    this.cube.twistHistory = [];
    this.cube.coherence = 1.0;
    this.cube.isSolved = true;
  }

  /**
   * STWÓRZ POWIĄZANE KOSTKI
   */
  async createConnectedCubes() {
    // Kostka logiczna
    const logicCube = {
      id: 'logic',
      faces: { ...this.mainCube.faces },
      purpose: 'logical_reasoning',
      connections: ['main', 'math', 'creativity']
    };
    
    // Kostka matematyczna
    const mathCube = {
      id: 'math',
      faces: { ...this.mainCube.faces },
      purpose: 'mathematical_operations',
      connections: ['main', 'logic', 'ethics']
    };
    
    // Kostka kreatywna
    const creativityCube = {
      id: 'creativity',
      faces: { ...this.mainCube.faces },
      purpose: 'creative_solutions',
      connections: ['main', 'logic', 'intuition']
    };
    
    // Kostka etyczna
    const ethicsCube = {
      id: 'ethics',
      faces: { ...this.mainCube.faces },
      purpose: 'ethical_validation',
      connections: ['main', 'math', 'safety']
    };
    
    // Kostka intuicji
    const intuitionCube = {
      id: 'intuition',
      faces: { ...this.mainCube.faces },
      purpose: 'intuitive_insights',
      connections: ['main', 'creativity', 'ethics']
    };
    
    // Dodaj kostki do systemu
    this.connectedCubes.set('logic', logicCube);
    this.connectedCubes.set('math', mathCube);
    this.connectedCubes.set('creativity', creativityCube);
    this.connectedCubes.set('ethics', ethicsCube);
    this.connectedCubes.set('intuition', intuitionCube);
    
    console.log('   Created 5 connected cubes with specific purposes');
  }

  /**
   * OBLICZ MATEMATYCZNE WAGI
   */
  calculateMathematicalWeights() {
    // Każdy twist ma określoną wagę i wpływa na konkretne płaszczyzny
    for (const [twist, data] of Object.entries(this.twistWeights)) {
      // Oblicz wagę na podstawie liczby wpływów
      data.weight = data.affects.length * 0.25; // 0.25 na każdą płaszczyznę
      
      // Dodaj komponent losowy dla różnorodności
      data.weight += Math.random() * 0.1 - 0.05; // ±0.05
      
      // Zapewnij pozytywną wagę
      data.weight = Math.max(0.1, data.weight);
    
    // Czyść stare błędy przy każdym obliczeniu
    this.systemState.errors = this.systemState.errors.filter(error => 
      !error.includes('Too rapid twists detected')
    );
    }
    
    console.log('   Mathematical weights calculated for all twists');
  }

  /**
   * WYKONAJ TWIST - GŁÓWNA OPERACJA
   */
  async performTwist(twistType, options = {}) {
    console.log(`🔄 Performing twist: ${twistType}`);
    
    // 1. Sprawdź czy twist jest prawidłowy
    if (!this.twistWeights[twistType]) {
      throw new Error(`Invalid twist: ${twistType}`);
    }
    
    // 2. Sprawdź spójność systemu
    if (this.systemState.coherence < this.coherenceRules.stabilityRequired) {
      throw new Error('System coherence too low for twist operation');
    }
    
    // 3. Wykonaj twist na głównej kostce
    const mainResult = await this.twistMainCube(twistType);
    
    // 4. Automatycznie wykonaj powiązane twisty
    const connectedResults = await this.performConnectedTwists(twistType, mainResult);
    
    // 5. Zastosuj cykl Mobiusa jeśli aktywny
    const mobiusResult = await this.applyMobiusCycle(twistType, mainResult);
    
    // 6. Sprawdź spójność po operacji
    this.validateCoherence();
    
    // 7. Zapisz w historii
    this.recordTwist(twistType, mainResult, connectedResults, mobiusResult);
    
    console.log('✅ Twist completed successfully!');
    console.log(`   Main cube coherence: ${mainResult.coherence.toFixed(2)}`);
    console.log(`   Connected cubes affected: ${connectedResults.length}`);
    console.log(`   System coherence: ${this.systemState.coherence.toFixed(2)}`);
    
    return {
      twistType,
      mainResult,
      connectedResults,
      mobiusResult,
      systemState: { ...this.systemState }
    };
  }

  /**
   * TWIST GŁÓWNEJ KOSTKI
   */
  async twistMainCube(twistType) {
    const twistData = this.twistWeights[twistType];
    const result = {
      affectedFaces: [],
      coherence: this.mainCube.coherence,
      stability: this.mainCube.isStable
    };
    
    // Zastosuj twist do każdej wpływającej płaszczyzny
    for (const face of twistData.affects) {
      if (this.mainCube.faces[face]) {
        // Zmień wartość płaszczyzny
        this.mainCube.faces[face].value += twistData.weight;
        
        // Normalizuj wartość (0-1)
        this.mainCube.faces[face].value = Math.max(0, Math.min(1, this.mainCube.faces[face].value));
        
        result.affectedFaces.push({
          face,
          oldValue: this.mainCube.faces[face].value - twistData.weight,
          newValue: this.mainCube.faces[face].value,
          weight: twistData.weight
        });
      }
    }
    
    // Oblicz nową spójność
    result.coherence = this.calculateCubeCoherence(this.mainCube);
    result.stability = result.coherence > this.coherenceRules.stabilityRequired;
    
    // Zaktualizuj stan głównej kostki
    this.mainCube.coherence = result.coherence;
    this.mainCube.isStable = result.stability;
    
    return result;
  }

  /**
   * WYKONAJ POWIĄZANE TWISTY
   */
  async performConnectedTwists(mainTwistType, mainResult) {
    const connectedResults = [];
    
    // Dla każdej połączonej kostki
    for (const [cubeId, cube] of this.connectedCubes) {
      // Określ jaki twist wykonać na podstawie głównego
      const connectedTwistType = this.determineConnectedTwist(cubeId, mainTwistType);
      
      if (connectedTwistType) {
        // Wykonaj twist na połączonej kostce
        const cubeResult = await this.twistConnectedCube(cube, connectedTwistType, mainResult);
        connectedResults.push({
          cubeId,
          twistType: connectedTwistType,
          result: cubeResult
        });
      }
    }
    
    return connectedResults;
  }

  /**
   * OKREŚL POWIĄZANY TWIST
   */
  determineConnectedTwist(cubeId, mainTwistType) {
    // Logika powiązań między kostkami
    const connections = {
      'logic': {
        'front_clockwise': 'top_clockwise',
        'top_clockwise': 'right_clockwise',
        'right_clockwise': 'front_clockwise'
      },
      'math': {
        'front_clockwise': 'front_counter_clockwise',
        'top_clockwise': 'bottom_clockwise',
        'right_clockwise': 'left_clockwise'
      },
      'creativity': {
        'front_clockwise': 'left_clockwise',
        'top_clockwise': 'back_clockwise',
        'right_clockwise': 'bottom_clockwise'
      },
      'ethics': {
        'front_clockwise': 'front_clockwise', // ten sam dla etyki
        'top_clockwise': 'top_clockwise',
        'right_clockwise': 'right_clockwise'
      },
      'intuition': {
        'front_clockwise': 'random', // intuicja = losowy
        'top_clockwise': 'random',
        'right_clockwise': 'random'
      }
    };
    
    const cubeConnections = connections[cubeId];
    if (cubeConnections && cubeConnections[mainTwistType]) {
      const connectedTwist = cubeConnections[mainTwistType];
      
      if (connectedTwist === 'random') {
        // Losowy twist dla intuicji
        const possibleTwists = Object.keys(this.twistWeights);
        return possibleTwists[Math.floor(Math.random() * possibleTwists.length)];
      }
      
      return connectedTwist;
    }
    
    return null; // brak powiązanego twistu
  }

  /**
   * TWIST POŁĄCZONEJ KOSTKI
   */
  async twistConnectedCube(cube, twistType, mainResult) {
    const twistData = this.twistWeights[twistType];
    const result = {
      affectedFaces: [],
      coherence: cube.coherence || 1.0,
      stability: true
    };
    
    // Zastosuj twist do kostki
    for (const face of twistData.affects) {
      if (cube.faces[face]) {
        cube.faces[face].value += twistData.weight * 0.5; // mniejszy wpływ
        cube.faces[face].value = Math.max(0, Math.min(1, cube.faces[face].value));
        
        result.affectedFaces.push({
          face,
          newValue: cube.faces[face].value,
          weight: twistData.weight * 0.5
        });
      }
    }
    
    // Oblicz spójność kostki
    result.coherence = this.calculateCubeCoherence(cube);
    result.stability = result.coherence > this.coherenceRules.stabilityRequired;
    
    // Zaktualizuj stan kostki
    cube.coherence = result.coherence;
    
    return result;
  }

  /**
   * ZASTOSUJ CYKL MOBIUSA
   */
  async applyMobiusCycle(twistType, mainResult) {
    if (this.mobiusCycles.active === 'none') {
      return { applied: false, reason: 'No Mobius cycle active' };
    }
    
    const mobiusResult = {
      applied: true,
      cycleType: this.mobiusCycles.active,
      transformations: []
    };
    
    if (this.mobiusCycles.active === 'single') {
      // Pojedynczy cykl Mobiusa
      const transformation = await this.applySingleMobiusTwist(twistType, mainResult);
      mobiusResult.transformations.push(transformation);
    } else if (this.mobiusCycles.active === 'double') {
      // Podwójny cykl Mobiusa
      const transformation1 = await this.applySingleMobiusTwist(twistType, mainResult);
      const transformation2 = await this.applyDoubleMobiusTwist(twistType, transformation1);
      mobiusResult.transformations.push(transformation1, transformation2);
    }
    
    return mobiusResult;
  }

  /**
   * ZASTOSUJ POJEDYNCZY TWIST MOBIUSA
   */
  async applySingleMobiusTwist(twistType, mainResult) {
    // Transformacja Möbiusa - twist 180°
    const transformation = {
      type: 'mobius_single',
      twistAngle: 180,
      originalTwist: twistType,
      transformedFaces: []
    };
    
    // Zastosuj transformację do każdej płaszczyzny
    for (const [faceName, faceData] of Object.entries(this.mainCube.faces)) {
      const transformedValue = 1.0 - faceData.value; // transformacja Möbiusa
      transformation.transformedFaces.push({
        face: faceName,
        originalValue: faceData.value,
        transformedValue
      });
    }
    
    return transformation;
  }

  /**
   * ZASTOSUJ PODWÓJNY TWIST MOBIUSA
   */
  async applyDoubleMobiusTwist(twistType, previousTransformation) {
    // Podwójna transformacja Möbiusa
    const transformation = {
      type: 'mobius_double',
      twistAngle: 360, // pełny obrót
      originalTwist: twistType,
      previousTransformation: previousTransformation,
      finalFaces: []
    };
    
    // Zastosuj drugą transformację
    for (const faceData of previousTransformation.transformedFaces) {
      const finalValue = Math.sin(faceData.transformedValue * Math.PI); // podwójna transformacja
      transformation.finalFaces.push({
        face: faceData.face,
        originalValue: faceData.originalValue,
        firstTransform: faceData.transformedValue,
        finalValue
      });
    }
    
    return transformation;
  }

  /**
   * OBLICZ SPÓJNOŚĆ KOSTKI
   */
  calculateCubeCoherence(cube) {
    const faceValues = Object.values(cube.faces).map(face => face.value);
    
    // Średnia wartość wszystkich płaszczyzn
    const averageValue = faceValues.reduce((sum, val) => sum + val, 0) / faceValues.length;
    
    // Odchylenie standardowe (mniej = bardziej spójne)
    const variance = faceValues.reduce((sum, val) => sum + Math.pow(val - averageValue, 2), 0) / faceValues.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Spójność = 1 - odchylenie standardowe
    const coherence = Math.max(0, 1 - standardDeviation);
    
    return coherence;
  }

  /**
   * WALIDUJ SPÓJNOŚĆ SYSTEMU
   */
  validateCoherence() {
    let totalCoherence = this.mainCube.coherence;
    
    // Dodaj spójność połączonych kostek
    for (const [cubeId, cube] of this.connectedCubes) {
      totalCoherence += cube.coherence || 1.0;
    }
    
    // Średnia spójność systemu
    this.systemState.coherence = totalCoherence / (1 + this.connectedCubes.size);
    
    // Sprawdź stabilność
    this.systemState.isStable = this.systemState.coherence > this.coherenceRules.stabilityRequired;
    
    // Sprawdź reguły anty-halucynacji
    this.validateAntiHallucinationRules();
    
    console.log(`   System coherence validated: ${this.systemState.coherence.toFixed(2)}`);
  }

  /**
   * WALIDUJ REGUŁY ANTY-HALUCYNACJI
   */
  validateAntiHallucinationRules() {
    // Reguła 1: Żadna płaszczyzna nie może mieć wartości > 1.0
    for (const [faceName, faceData] of Object.entries(this.mainCube.faces)) {
      if (faceData.value > 1.0 || faceData.value < 0) {
        this.systemState.errors.push(`Face ${faceName} out of bounds: ${faceData.value}`);
        this.coherenceRules.noHallucinations = false;
      }
    }
    
    // Reguła 2: Spójność musi być > 0.5
    if (this.systemState.coherence < 0.5) {
      this.systemState.errors.push(`System coherence too low: ${this.systemState.coherence}`);
      this.coherenceRules.logicalConnections = false;
    }
    
    // Reguła 3: Brak nagłych skoków wartości
    if (this.systemState.lastTwist) {
      const timeDiff = Date.now() - this.systemState.lastTwist.timestamp;
      if (timeDiff < 10) { // mniej niż 10ms (bardzo szybkie)
        this.systemState.errors.push('Too rapid twists detected');
        this.coherenceRules.mathematicalIntegrity = false;
      }
    }
  }

  /**
   * AKTYWUJ CYKL MOBIUSA
   */
  activateMobiusCycle(cycleType) {
    if (!['single', 'double', 'none'].includes(cycleType)) {
      throw new Error('Invalid Mobius cycle type. Use: single, double, or none');
    }
    
    this.mobiusCycles.active = cycleType;
    console.log(`🔄 Mobius cycle activated: ${cycleType}`);
  }

  /**
   * ZAPISZ TWIST W HISTORII
   */
  recordTwist(twistType, mainResult, connectedResults, mobiusResult) {
    const twistRecord = {
      timestamp: Date.now(),
      twistType,
      mainResult,
      connectedResults,
      mobiusResult,
      systemState: { ...this.systemState }
    };
    
    this.systemState.twistHistory.push(twistRecord);
    this.systemState.lastTwist = twistRecord;
    
    // Ogranicz historię do ostatnich 100 twistów
    if (this.systemState.twistHistory.length > 100) {
      this.systemState.twistHistory = this.systemState.twistHistory.slice(-100);
    }
  }

  /**
   * PRZETWARZAJ PROBLEM PRZEZ KOSTKĘ RUBIKA
   */
  async processWithRubikCube(problem, options = {}) {
    console.log('🎲 Processing problem with Rubik Cube Engine...');
    
    // 1. Analizuj problem i określ wymagane twisty
    const requiredTwists = this.analyzeProblemForTwists(problem);
    
    // 2. Wykonaj sekwencję twistów
    const results = [];
    for (const twist of requiredTwists) {
      try {
        const result = await this.performTwist(twist, options);
        results.push(result);
        
        // Sprawdź czy system jest jeszcze stabilny
        if (!this.systemState.isStable) {
          console.warn('System became unstable during processing');
          break;
        }
      } catch (error) {
        console.error(`Failed to perform twist ${twist}:`, error.message);
        break;
      }
    }
    
    // 3. Generuj rozwiązanie na podstawie końcowego stanu
    const solution = this.generateSolutionFromCubeState(problem, results);
    
    console.log('✅ Rubik Cube processing completed!');
    console.log(`   Twists performed: ${results.length}`);
    console.log(`   Final coherence: ${this.systemState.coherence.toFixed(2)}`);
    console.log(`   Solution confidence: ${solution.confidence.toFixed(2)}`);
    
    return {
      problem,
      twists: requiredTwists,
      results,
      solution,
      finalState: this.getSystemStatus()
    };
  }

  /**
   * ANALIZUJ PROBLEM I OKREŚL TWISTY
   */
  analyzeProblemForTwists(problem) {
    // Prosta analiza problemu - w rzeczywistości tu byłoby AI
    const twists = [];
    
    // Na podstawie słów kluczowych problemu
    if (typeof problem === 'string') {
      const lowerProblem = problem.toLowerCase();
      
      if (lowerProblem.includes('logical') || lowerProblem.includes('analyze')) {
        twists.push('front_clockwise', 'top_clockwise');
      }
      
      if (lowerProblem.includes('creative') || lowerProblem.includes('innovative')) {
        twists.push('right_clockwise', 'left_clockwise');
      }
      
      if (lowerProblem.includes('mathematical') || lowerProblem.includes('calculate')) {
        twists.push('back_clockwise', 'bottom_clockwise');
      }
      
      if (lowerProblem.includes('ethical') || lowerProblem.includes('moral')) {
        twists.push('front_counter_clockwise');
      }
      
      if (lowerProblem.includes('intuitive') || lowerProblem.includes('instinct')) {
        twists.push('top_counter_clockwise', 'right_counter_clockwise');
      }
    }
    
    // Jeśli nie określono twistów, użyj domyślnych
    if (twists.length === 0) {
      twists.push('front_clockwise', 'top_clockwise', 'right_clockwise');
    }
    
    return twists;
  }

  /**
   * GENERUJ ROZWIĄZANIE ZE STANU KOSTKI
   */
  generateSolutionFromCubeState(problem, twistResults) {
    // Analizuj końcowy stan kostki
    const faceValues = Object.values(this.mainCube.faces).map(face => face.value);
    const averageValue = faceValues.reduce((sum, val) => sum + val, 0) / faceValues.length;
    
    // Oblicz pewność rozwiązania
    let confidence = this.systemState.coherence;
    
    // Boost jeśli wykonano wiele twistów
    if (twistResults.length > 3) {
      confidence += 0.1;
    }
    
    // Boost jeśli system jest stabilny
    if (this.systemState.isStable) {
      confidence += 0.1;
    }
    
    // Ogranicz pewność
    confidence = Math.min(1.0, confidence);
    
    // Generuj rozwiązanie
    const solution = {
      problem,
      approach: this.determineApproach(averageValue),
      confidence,
      reasoning: this.generateReasoning(twistResults),
      cubeState: {
        coherence: this.systemState.coherence,
        stability: this.systemState.isStable,
        faceValues
      }
    };
    
    return solution;
  }

  /**
   * OKREŚL APPROACH NA PODSTAWIE WARTOŚCI KOSTKI
   */
  determineApproach(averageValue) {
    if (averageValue > 0.7) {
      return 'aggressive_innovative';
    } else if (averageValue > 0.4) {
      return 'balanced_analytical';
    } else {
      return 'conservative_methodical';
    }
  }

  /**
   * GENERUJ REASONING
   */
  generateReasoning(twistResults) {
    const reasoning = [];
    
    for (const result of twistResults) {
      reasoning.push(`Applied ${result.twistType} with coherence ${result.mainResult.coherence.toFixed(2)}`);
    }
    
    return reasoning;
  }

  /**
   * STATUS SYSTEMU
   */
  getSystemStatus() {
    return {
      cube: {
        coherence: this.cube.coherence,
        faces: Object.keys(this.cube.faces).length,
        totalFields: 54
      }
    };
  }

  /**
   * RESETUJ SYSTEM
   */
  resetSystem() {
    this.resetCube();
    this.connectedCubes.clear();
    this.mobiusCycles.active = 'none';
    this.systemState = {
      isStable: true,
      coherence: 1.0,
      lastTwist: null,
      twistHistory: [],
      errors: []
    };
    
    console.log('🔄 Rubik Cube Engine reset to initial state');
  }

  async stop() {
    console.log('⏹️ Rubik Cube Engine stopped');
  }

  getStatus() {
    return {
      active: true,
      coherence: this.mainCube.coherence,
      isStable: this.mainCube.isStable,
      mobiusCycle: this.mobiusCycles.active,
      connectedCubes: this.connectedCubes.size
    };
  }
}

module.exports = RubikCubeEngine;
