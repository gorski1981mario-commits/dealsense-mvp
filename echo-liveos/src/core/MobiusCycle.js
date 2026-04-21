/**
 * MÖBIUS CYCLE - PRAWDZIWA MATEMATYCZNA PĘTLA
 * Inspiracja: wizja użytkownika o skręcie 180° i zamkniętej pętli
 * 
 * Matematyka:
 * - Strona A (góra) → Punkt skrętu → Strona B (dół) 
 * - Po skręcie: Strona A = Strona B (jedna powierzchnia)
 * - Długopis jedzie po jednej stronie, wraca do tego samego punktu
 * - Wyjście awaryjne: jeśli pętla się zamknie
 */

class MobiusCycle {
  constructor() {
    // STRONY PĘTLI (jak wstęga papieru)
    this.sideA = 'UPPER'; // góra wstęgi
    this.sideB = 'LOWER'; // dół wstęga
    
    // PUNKT SKRĘTU (moment transformacji 180°)
    this.twistPoint = null;
    this.isTwisted = false;
    
    // KIERUNEK PODRÓŻY DŁUGOPISU
    this.penPosition = { x: 0, y: 0, side: this.sideA };
    this.penDirection = 1; // 1 = do przodu, -1 = do tyłu
    
    // PĘTLA MATEMATYCZNA
    this.loopClosed = false;
    this.loopIterations = 0;
    this.maxIterations = 1000; // bezpieczeństwo
    
    // WYJŚCIE AWARYJNE
    this.emergencyExit = {
      enabled: true,
      trigger: 'loop_closed',
      exitPoint: null
    };
    
    // DANE W PĘTLI
    this.loopData = {
      input: null,
      transformation: null,
      output: null,
      metadata: {}
    };
  }

  /**
   * Inicjalizacja Mobius Cycle
   */
  async initialize() {
    console.log('🔄 Mobius Cycle initialized');
    return true;
  }

  /**
   * START PODRÓŻY PO PĘTLI MÖBIUSA
   */
  async startLoop(data) {
    console.log('🔄 Starting Möbius Cycle journey...');
    
    // 1. Umieść długopis na górnej stronie
    this.penPosition = { x: 0, y: 0, side: this.sideA };
    this.loopData.input = data;
    
    // 2. Znajdź punkt skrętu (50% drogi)
    this.twistPoint = this.calculateTwistPoint();
    
    console.log('📍 Pen positioned at:', this.penPosition);
    console.log('🔀 Twist point calculated at:', this.twistPoint);
    
    // 3. Rozpocznij podróż
    return await this.travelOnLoop();
  }

  /**
   * PODRÓŻ DŁUGOPISU PO PĘTLI
   */
  async travelOnLoop() {
    while (!this.loopClosed && this.loopIterations < this.maxIterations) {
      this.loopIterations++;
      
      // 1. Ruch do przodu
      await this.moveForward();
      
      // 2. Sprawdź czy osiągnięto punkt skrętu
      if (this.isAtTwistPoint()) {
        await this.performTwist();
      }
      
      // 3. Sprawdź czy długopis wrócił do startu
      if (this.isBackToStart()) {
        await this.closeLoop();
        break;
      }
      
      // 4. Sprawdź wyjście awaryjne
      if (this.shouldEmergencyExit()) {
        return await this.emergencyExitLoop();
      }
      
      // 5. Symulacja ruchu (opóźnienie)
      await this.simulateMovement();
    }
    
    return this.getLoopResult();
  }

  /**
   * RUCH DO PRZODU PO PĘTLI
   */
  async moveForward() {
    // Matematyczny ruch po wstędze Möbiusa
    this.penPosition.x += this.penDirection;
    
    // Jeśli koniec wstęgi - obróć 180° i kontynuuj
    if (this.penPosition.x >= 100) {
      this.penPosition.x = 0;
      this.penPosition.y += 1;
      
      // Po skręcie zmienia się strona!
      if (this.isTwisted) {
        this.penPosition.side = this.penPosition.side === this.sideA ? this.sideB : this.sideA;
      }
    }
    
    console.log(`✏️  Pen moved to: x=${this.penPosition.x}, y=${this.penPosition.y}, side=${this.penPosition.side}`);
  }

  /**
   * CZY DŁUGOPIS JEST W PUNKCIE SKRĘTU?
   */
  isAtTwistPoint() {
    return this.penPosition.x === this.twistPoint.x && 
           this.penPosition.y === this.twistPoint.y && 
           !this.isTwisted;
  }

  /**
   * WYKONAJ SKRĘT 180° - TRANSFORMACJA!
   */
  async performTwist() {
    console.log('🔀 PERFORMING 180° TWIST - TRANSFORMATION!');
    
    // 1. Oznacz że skręt wykonany
    this.isTwisted = true;
    
    // 2. Transformacja danych w punkcie skrętu
    this.loopData.transformation = await this.transformAtTwist();
    
    // 3. Matematycznie: góra staje się dołem
    const temp = this.sideA;
    this.sideA = this.sideB;
    this.sideB = temp;
    
    // 4. Długopis jest teraz na "drugiej" stronie (która jest tą samą)
    this.penPosition.side = this.sideA; // teraz to ta sama strona!
    
    console.log('✅ Twist completed! Side A and Side B are now ONE surface');
    console.log('🔄 Pen is now on the unified surface');
  }

  /**
   * TRANSFORMACJA DANYCH W PUNKCIE SKRĘTU
   */
  async transformAtTwist() {
    const data = this.loopData.input;
    
    // Matematyczna transformacja 180°
    const transformation = {
      original: data,
      rotated: this.rotate180(data),
      unified: this.unifySurfaces(data),
      timestamp: Date.now(),
      twistAngle: 180,
      surfaceCount: 1 // po skręcie jest jedna powierzchnia
    };
    
    console.log('🔄 Data transformed at twist point:', transformation);
    return transformation;
  }

  /**
   * OBRÓT 180° DANYCH
   */
  rotate180(data) {
    // Matematyczny obrót 180°
    if (typeof data === 'object') {
      return {
        ...data,
        rotated: true,
        angle: 180,
        inverted: this.invertObject(data)
      };
    }
    
    return data;
  }

  /**
   ** UNIFIKACJA POWIERZCHNI (góra + dół = jedna)
   */
  unifySurfaces(data) {
    return {
      ...data,
      unified: true,
      surfaceType: 'möbius_single_surface',
      properties: {
        hasTwoSides: false,
        hasOneSide: true,
        twistApplied: true
      }
    };
  }

  /**
   * CZY DŁUGOPIS WRÓCIŁ DO PUNKTU STARTOWEGO?
   */
  isBackToStart() {
    return this.penPosition.x === 0 && 
           this.penPosition.y === 0 && 
           this.isTwisted && 
           this.loopIterations > 10;
  }

  /**
   * ZAMKNIĘCIE PĘTLI - DŁUGOPIS WRÓCIŁ!
   */
  async closeLoop() {
    console.log('🔒 LOOP CLOSED - Pen returned to start point!');
    
    this.loopClosed = true;
    this.loopData.output = this.generateLoopOutput();
    
    // Pętla jest matematycznie zamknięta
    console.log('⚠️  WARNING: Loop is now mathematically closed!');
    console.log('🚪 Emergency exit available:', this.emergencyExit.enabled);
  }

  /**
   * WYJŚCIE AWARYJNE Z ZAMKNIĘTEJ PĘTLI
   */
  async emergencyExitLoop() {
    console.log('🚪 EMERGENCY EXIT ACTIVATED!');
    
    if (!this.emergencyExit.enabled) {
      throw new Error('Loop closed and no emergency exit available!');
    }
    
    // Stwórz wyjście z zamkniętej pętli
    this.emergencyExit.exitPoint = {
      x: this.penPosition.x,
      y: this.penPosition.y,
      side: this.penPosition.side,
      reason: 'emergency_exit_triggered',
      timestamp: Date.now()
    };
    
    console.log('✅ Emergency exit created at:', this.emergencyExit.exitPoint);
    
    return {
      emergencyExit: true,
      exitPoint: this.emergencyExit.exitPoint,
      loopData: this.loopData,
      message: 'Successfully escaped closed Möbius loop'
    };
  }

  /**
   * CZY AKTYWOWAĆ WYJŚCIE AWARYJNE?
   */
  shouldEmergencyExit() {
    return this.loopClosed && this.emergencyExit.enabled;
  }

  /**
   * GENERUJ WYNIK PĘTLI
   */
  generateLoopOutput() {
    return {
      loopCompleted: true,
      iterations: this.loopIterations,
      penPath: this.getPenPath(),
      transformation: this.loopData.transformation,
      unifiedSurface: this.isTwisted,
      mathematicalProperties: {
        hasOneSide: true,
        hasTwist: true,
        twistAngle: 180,
        isClosed: this.loopClosed
      }
    };
  }

  /**
   * POBIERZ ŚCIEŻKĘ DŁUGOPISU
   */
  getPenPath() {
    return {
      start: { x: 0, y: 0, side: 'UPPER' },
      end: { x: this.penPosition.x, y: this.penPosition.y, side: this.penPosition.side },
      twistPoint: this.twistPoint,
      totalDistance: this.loopIterations,
      sidesVisited: this.isTwisted ? 1 : 2
    };
  }

  /**
   * OBLICZ PUNKT SKRĘTU (matematycznie: 50% drogi)
   */
  calculateTwistPoint() {
    return {
      x: 50, // środek wstęgi
      y: 0,
      side: this.sideA
    };
  }

  /**
   * SYMULACJA RUCHU (opóźnienie dla wizualizacji)
   */
  async simulateMovement() {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  /**
   * INWERSJA OBIEKTU (dla obrotu 180°)
   */
  invertObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const inverted = {};
    for (const [key, value] of Object.entries(obj)) {
      inverted[key] = value;
    }
    
    return inverted;
  }

  /**
   * POBIERZ WYNIK PĘTLI
   */
  getLoopResult() {
    if (this.emergencyExit.exitPoint) {
      return {
        emergencyExit: true,
        exitPoint: this.emergencyExit.exitPoint,
        loopData: this.loopData
      };
    }
    
    return {
      loopCompleted: this.loopClosed,
      loopData: this.loopData,
      penPosition: this.penPosition,
      iterations: this.loopIterations
    };
  }

  /**
   * RESETUJ PĘTLĘ
   */
  resetLoop() {
    this.sideA = 'UPPER';
    this.sideB = 'LOWER';
    this.twistPoint = null;
    this.isTwisted = false;
    this.penPosition = { x: 0, y: 0, side: this.sideA };
    this.loopClosed = false;
    this.loopIterations = 0;
    this.loopData = { input: null, transformation: null, output: null, metadata: {} };
    this.emergencyExit.exitPoint = null;
    
    console.log('🔄 Möbius Loop reset to initial state');
  }

  /**
   * STATUS PĘTLI
   */
  getStatus() {
    return {
      sides: { sideA: this.sideA, sideB: this.sideB },
      isTwisted: this.isTwisted,
      twistPoint: this.twistPoint,
      penPosition: this.penPosition,
      loopClosed: this.loopClosed,
      iterations: this.loopIterations,
      emergencyExit: this.emergencyExit.enabled,
      hasExitPoint: !!this.emergencyExit.exitPoint
    };
  }
}

module.exports = MobiusCycle;
