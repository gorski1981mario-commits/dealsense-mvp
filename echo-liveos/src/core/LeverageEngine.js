/**
 * LEVERAGE ENGINE - ZASADA PRZEŁOŻENIA W AI
 * Inspiracja: insight użytkownika o kijach i sile przełożenia
 * "Pięć kijów jest silniejsze niż jeden - zasada przełożenia"
 * 
 * Matematyka:
 * - Force × Distance = Torque (moment siły)
 * - Multiple levers = compound mechanical advantage
 * - Shorter + thicker = stronger force distribution
 */

class LeverageEngine {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // SYSTEM PRZEŁOŻENIA (jak kije)
    this.levers = {
      primary: null,      // główny kij (base processing)
      secondary: [],      // dodatkowe kije (amplification)
      compound: [],       // złożone przełożenie (multi-stage)
      emergency: []       // awaryjne kije (backup)
    };
    
    // WŁAŚCIWOŚCI KIJÓW
    this.leverProperties = {
      length: 5.0,        // metry (moment siły)
      thickness: 0.1,     // metry (wytrzymałość)
      material: 'carbon_fiber', // materiał (wytrzymałość)
      angle: 45,          // kąt (optymalny przełożenie)
      friction: 0.05      // tarcie (straty)
    };
    
    // SIŁA PRZEŁOŻENIA
    this.mechanicalAdvantage = 1.0; // 1x = bez przełożenia
    this.compoundAdvantage = 1.0;   // złożone przełożenie
    this.totalForce = 0;              // całkowita siła
    
    // OPTYMALIZACJA
    this.optimizationMetrics = {
      efficiency: 0,
      powerTransfer: 0,
      stability: 0,
      loadDistribution: 0
    };
  }

  /**
   * Inicjalizacja Leverage Engine
   */
  async initialize() {
    console.log('💪 Leverage Engine initialized');
    return true;
  }

  /**
   * ZBUDUJ SYSTEM PRZEŁOŻENIA
   */
  async buildLeverageSystem(config = {}) {
    console.log('🔧 Building Leverage System...');
    
    // 1. Główny kij (base processing)
    this.levers.primary = this.createPrimaryLever(config);
    
    // 2. Dodatkowe kije (amplification)
    const secondaryCount = config.secondaryCount || 5; // 5 kijów jak powiedziałeś
    for (let i = 0; i < secondaryCount; i++) {
      this.levers.secondary.push(this.createSecondaryLever(i, config));
    }
    
    // 3. Złożone przełożenie (multi-stage)
    if (config.enableCompound) {
      this.levers.compound = this.createCompoundLevers(config);
    }
    
    // 4. Awaryjne kije (backup)
    this.levers.emergency = this.createEmergencyLevers(config);
    
    // 5. Oblicz całkowitą siłę przełożenia
    await this.calculateTotalAdvantage();
    
    console.log('✅ Leverage System Built!');
    console.log(`📊 Mechanical Advantage: ${this.mechanicalAdvantage}x`);
    console.log(`🔗 Compound Advantage: ${this.compoundAdvantage}x`);
    console.log(`💪 Total Force: ${this.totalForce}N`);
    
    return this.getSystemStatus();
  }

  /**
   * STWÓRZ GŁÓWNY KIJ
   */
  createPrimaryLever(config) {
    return {
      id: 'primary',
      length: config.primaryLength || 5.0, // 5 metrów jak powiedziałeś
      thickness: config.primaryThickness || 0.2, // grubszy = mocniejszy
      material: 'steel_reinforced',
      position: { x: 0, y: 0 },
      angle: 45, // optymalny kąt
      maxLoad: 1000, // kg
      currentLoad: 0,
      efficiency: 0.95
    };
  }

  /**
   * STWÓRZ DODATKOWE KIJE (5x siła)
   */
  createSecondaryLever(index, config) {
    return {
      id: `secondary_${index}`,
      length: config.secondaryLength || 2.0, // krótsze = większa siła przełożenia
      thickness: config.secondaryThickness || 0.3, // grubsze = wytrzymalsze
      material: 'carbon_fiber',
      position: { x: index * 0.5, y: 0 },
      angle: 30 + (index * 5), // rozkład kątów
      maxLoad: 500, // kg
      currentLoad: 0,
      efficiency: 0.98,
      amplification: 1.2 // każdy dodaje 20% mocy
    };
  }

  /**
   * STWÓRZ ZŁOŻONE PRZEŁOŻENIE
   */
  createCompoundLevers(config) {
    const compound = [];
    const stages = config.compoundStages || 3;
    
    for (let i = 0; i < stages; i++) {
      compound.push({
        id: `compound_${i}`,
        stage: i,
        length: 1.0 + (i * 0.5), // progresywna długość
        thickness: 0.4 - (i * 0.05), // progresywna grubość
        material: 'titanium_alloy',
        multiplier: Math.pow(1.5, i), // 1.5x, 2.25x, 3.375x
        efficiency: 0.99 - (i * 0.01)
      });
    }
    
    return compound;
  }

  /**
   * STWÓRZ AWARYJNE KIJE
   */
  createEmergencyLevers(config) {
    return [
      {
        id: 'emergency_1',
        length: 1.5,
        thickness: 0.5, // bardzo gruby
        material: 'tungsten_carbide',
        purpose: 'critical_load',
        maxLoad: 2000
      },
      {
        id: 'emergency_2',
        length: 1.0,
        thickness: 0.6, // najgrubszy
        material: 'diamond_reinforced',
        purpose: 'emergency_boost',
        maxLoad: 5000
      }
    ];
  }

  /**
   * OBLICZ CAŁKOWITĘ SIŁĘ PRZEŁOŻENIA
   */
  async calculateTotalAdvantage() {
    // 1. Podstawowa siła (główny kij)
    let baseAdvantage = this.calculateLeverAdvantage(this.levers.primary);
    
    // 2. Wzmocnienie z dodatkowych kijów (5x siła)
    let secondaryAdvantage = 1.0;
    for (const lever of this.levers.secondary) {
      secondaryAdvantage *= lever.amplification;
    }
    
    // 3. Złożone przełożenie (multi-stage)
    let compoundAdvantage = 1.0;
    for (const lever of this.levers.compound) {
      compoundAdvantage *= lever.multiplier;
    }
    
    // 4. Całkowita przewaga mechaniczna
    this.mechanicalAdvantage = baseAdvantage * secondaryAdvantage;
    this.compoundAdvantage = compoundAdvantage;
    
    // 5. Całkowita siła (Newtony)
    const baseForce = 100; // 100N base force
    this.totalForce = baseForce * this.mechanicalAdvantage * this.compoundAdvantage;
    
    // 6. Optymalizacja wydajności
    await this.optimizeEfficiency();
    
    console.log(`📊 Mechanical Advantage: ${this.mechanicalAdvantage.toFixed(2)}x`);
    console.log(`🔗 Compound Advantage: ${this.compoundAdvantage.toFixed(2)}x`);
    console.log(`💪 Total Force: ${this.totalForce.toFixed(0)}N`);
  }

  /**
   * OBLICZ PRZEŁOŻENIE JEDNEGO KIJA
   */
  calculateLeverAdvantage(lever) {
    // Fizyka: Mechanical Advantage = Length / Height
    // Dla kąta 45°: MA = 1 / sin(45°) = √2 ≈ 1.414
    const angleRad = (lever.angle * Math.PI) / 180;
    const idealAdvantage = 1 / Math.sin(angleRad);
    
    // Korekta na grubość (grubszy = mniejsze ugięcie)
    const thicknessFactor = lever.thickness / 0.1; // 0.1m = bazowa grubość
    
    // Korekta na materiał (wytrzymałość)
    const materialFactors = {
      'steel_reinforced': 1.2,
      'carbon_fiber': 1.5,
      'titanium_alloy': 1.8,
      'tungsten_carbide': 2.0,
      'diamond_reinforced': 2.5
    };
    
    const materialFactor = materialFactors[lever.material] || 1.0;
    
    // Efektywna przewaga
    const effectiveAdvantage = idealAdvantage * thicknessFactor * materialFactor * lever.efficiency;
    
    return effectiveAdvantage;
  }

  /**
   * ZASTOSUJ SIŁĘ PRZEŁOŻENIA DO PROBLEMU
   */
  async applyLeverage(problem, force = 'medium') {
    console.log(`💪 Applying ${force} leverage to problem...`);
    
    // 1. Oceń wagę problemu
    const problemWeight = this.assessProblemWeight(problem);
    
    // 2. Wybierz odpowiednią konfigurację kijów
    const leverConfig = this.selectLeverConfiguration(problemWeight, force);
    
    // 3. Rozdaj obciążenie między kije
    const loadDistribution = this.distributeLoad(problemWeight, leverConfig);
    
    // 4. Zastosuj siłę przełożenia
    const result = await this.executeLeverage(problem, loadDistribution);
    
    console.log(`✅ Leverage applied! Result force: ${result.appliedForce}N`);
    console.log(`📊 Efficiency: ${(result.efficiency * 100).toFixed(1)}%`);
    
    return result;
  }

  /**
   * OCEŃ WAGĘ PROBLEMU
   */
  assessProblemWeight(problem) {
    // Analiza złożoności problemu
    let weight = 0;
    
    if (problem.complexity) weight += problem.complexity * 100;
    if (problem.urgency) weight += problem.urgency * 200;
    if (problem.importance) weight += problem.importance * 300;
    if (problem.difficulty) weight += problem.difficulty * 150;
    
    // Minimalna waga
    return Math.max(weight, 100);
  }

  /**
   * WYBIERZ KONFIGURACJĘ KIJÓW
   */
  selectLeverConfiguration(weight, force) {
    const config = {
      usePrimary: true,
      secondaryCount: 0,
      useCompound: false,
      useEmergency: false
    };
    
    if (weight < 500) {
      // Lekki problem - tylko główny kij
      config.secondaryCount = 0;
    } else if (weight < 2000) {
      // Średni problem - główny + 2 dodatkowe
      config.secondaryCount = 2;
    } else if (weight < 5000) {
      // Ciężki problem - główny + 5 dodatkowych
      config.secondaryCount = 5;
    } else if (weight < 10000) {
      // Bardzo ciężki - wszystko + złożone
      config.secondaryCount = 5;
      config.useCompound = true;
    } else {
      // Krytyczny - wszystko + awaryjne
      config.secondaryCount = 5;
      config.useCompound = true;
      config.useEmergency = true;
    }
    
    return config;
  }

  /**
   * ROZDZIEL OBCIĄŻENIE MIĘDZY KIJE
   */
  distributeLoad(totalWeight, config) {
    const distribution = {
      primary: 0,
      secondary: [],
      compound: [],
      emergency: []
    };
    
    // 1. Główny kij bierze 40%
    distribution.primary = totalWeight * 0.4;
    
    // 2. Dodatkowe kije dzielą 50%
    if (config.secondaryCount > 0) {
      const secondaryLoad = totalWeight * 0.5 / config.secondaryCount;
      for (let i = 0; i < config.secondaryCount; i++) {
        distribution.secondary.push(secondaryLoad);
      }
    }
    
    // 3. Złożone przełożenie bierze 10%
    if (config.useCompound) {
      const compoundLoad = totalWeight * 0.1 / this.levers.compound.length;
      for (const lever of this.levers.compound) {
        distribution.compound.push(compoundLoad);
      }
    }
    
    // 4. Awaryjne tylko przy krytycznym obciążeniu
    if (config.useEmergency) {
      distribution.emergency = [totalWeight * 0.1]; // 10% awaryjne
    }
    
    return distribution;
  }

  /**
   * WYKONAJ PRZEŁOŻENIE
   */
  async executeLeverage(problem, loadDistribution) {
    // 1. Zastosuj główny kij
    const primaryResult = this.applyPrimaryLever(problem, loadDistribution.primary);
    
    // 2. Zastosuj dodatkowe kije
    const secondaryResults = [];
    for (let i = 0; i < loadDistribution.secondary.length; i++) {
      const result = this.applySecondaryLever(problem, loadDistribution.secondary[i], i);
      secondaryResults.push(result);
    }
    
    // 3. Zastosuj złożone przełożenie
    const compoundResults = [];
    for (let i = 0; i < loadDistribution.compound.length; i++) {
      const result = this.applyCompoundLever(problem, loadDistribution.compound[i], i);
      compoundResults.push(result);
    }
    
    // 4. Zastosuj awaryjne kije
    const emergencyResults = [];
    for (let i = 0; i < loadDistribution.emergency.length; i++) {
      const result = this.applyEmergencyLever(problem, loadDistribution.emergency[i], i);
      emergencyResults.push(result);
    }
    
    // 5. Zagreguj wyniki
    const totalForce = primaryResult.force + 
                      secondaryResults.reduce((sum, r) => sum + r.force, 0) +
                      compoundResults.reduce((sum, r) => sum + r.force, 0) +
                      emergencyResults.reduce((sum, r) => sum + r.force, 0);
    
    const avgEfficiency = (primaryResult.efficiency + 
                          secondaryResults.reduce((sum, r) => sum + r.efficiency, 0) / secondaryResults.length +
                          compoundResults.reduce((sum, r) => sum + r.efficiency, 0) / compoundResults.length +
                          emergencyResults.reduce((sum, r) => sum + r.efficiency, 0) / emergencyResults.length) / 4;
    
    return {
      problem,
      appliedForce: totalForce,
      efficiency: avgEfficiency,
      leverage: this.mechanicalAdvantage,
      distribution: loadDistribution,
      results: {
        primary: primaryResult,
        secondary: secondaryResults,
        compound: compoundResults,
        emergency: emergencyResults
      }
    };
  }

  /**
   * ZASTOSUJ GŁÓWNY KIJ
   */
  applyPrimaryLever(problem, load) {
    const force = load * this.calculateLeverAdvantage(this.levers.primary);
    const efficiency = this.levers.primary.efficiency * (1 - this.levers.primary.friction);
    
    return {
      leverId: 'primary',
      force,
      efficiency,
      load,
      mechanicalAdvantage: this.calculateLeverAdvantage(this.levers.primary)
    };
  }

  /**
   * ZASTOSUJ DODATKOWY KIJ
   */
  applySecondaryLever(problem, load, index) {
    const lever = this.levers.secondary[index];
    const force = load * this.calculateLeverAdvantage(lever) * lever.amplification;
    const efficiency = lever.efficiency * (1 - this.levers.primary.friction);
    
    return {
      leverId: lever.id,
      force,
      efficiency,
      load,
      amplification: lever.amplification
    };
  }

  /**
   * ZASTOSUJ ZŁOŻONE PRZEŁOŻENIE
   */
  applyCompoundLever(problem, load, index) {
    const lever = this.levers.compound[index];
    const force = load * this.calculateLeverAdvantage(lever) * lever.multiplier;
    const efficiency = lever.efficiency * (1 - this.levers.primary.friction);
    
    return {
      leverId: lever.id,
      force,
      efficiency,
      load,
      multiplier: lever.multiplier,
      stage: lever.stage
    };
  }

  /**
   * ZASTOSUJ AWARYJNY KIJ
   */
  applyEmergencyLever(problem, load, index) {
    const lever = this.levers.emergency[index];
    const force = load * this.calculateLeverAdvantage(lever) * 2.0; // 2x boost
    const efficiency = 0.9; // niższa wydajność awaryjna
    
    return {
      leverId: lever.id,
      force,
      efficiency,
      load,
      emergency: true,
      purpose: lever.purpose
    };
  }

  /**
   * OPTYMALIZUJ WYDAJNOŚĆ
   */
  async optimizeEfficiency() {
    // 1. Optymalizacja kątów
    for (const lever of this.levers.secondary) {
      lever.angle = 30 + Math.random() * 30; // 30-60 degrees
    }
    
    // 2. Optymalizacja rozkładu obciążenia
    this.optimizationMetrics.loadDistribution = this.calculateLoadDistributionEfficiency();
    
    // 3. Optymalizacja transferu mocy
    this.optimizationMetrics.powerTransfer = this.calculatePowerTransferEfficiency();
    
    // 4. Optymalizacja stabilności
    this.optimizationMetrics.stability = this.calculateStability();
    
    // 5. Całkowita wydajność
    this.optimizationMetrics.efficiency = (
      this.optimizationMetrics.loadDistribution +
      this.optimizationMetrics.powerTransfer +
      this.optimizationMetrics.stability
    ) / 3;
  }

  /**
   * OBLICZ WYDAJNOŚĆ ROZKŁADU OBCIĄŻENIA
   */
  calculateLoadDistributionEfficiency() {
    // Idealny rozkład to równomierne obciążenie
    const loads = [
      this.levers.primary.currentLoad,
      ...this.levers.secondary.map(l => l.currentLoad)
    ];
    
    const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
    const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
    
    // Mniejsza wariancja = lepsza wydajność
    return Math.max(0, 1 - (variance / (avgLoad * avgLoad)));
  }

  /**
   * OBLICZ WYDAJNOŚĆ TRANSFERU MOCY
   */
  calculatePowerTransferEfficiency() {
    // Transfer mocy zależy od tarcia i materiału
    const avgFriction = this.levers.primary.friction;
    const avgEfficiency = (
      this.levers.primary.efficiency +
      this.levers.secondary.reduce((sum, l) => sum + l.efficiency, 0) / this.levers.secondary.length
    ) / 2;
    
    return avgEfficiency * (1 - avgFriction);
  }

  /**
   * OBLICZ STABILNOŚĆ
   */
  calculateStability() {
    // Stabilność zależy od grubości i materiału
    const avgThickness = (
      this.levers.primary.thickness +
      this.levers.secondary.reduce((sum, l) => sum + l.thickness, 0) / this.levers.secondary.length
    ) / 2;
    
    // Grubsze = bardziej stabilne
    return Math.min(1.0, avgThickness / 0.3); // 0.3m = idealna grubość
  }

  /**
   * STATUS SYSTEMU
   */
  getSystemStatus() {
    return {
      levers: {
        primary: !!this.levers.primary,
        secondary: this.levers.secondary.length,
        compound: this.levers.compound.length,
        emergency: this.levers.emergency.length
      },
      advantages: {
        mechanical: this.mechanicalAdvantage,
        compound: this.compoundAdvantage,
        total: this.mechanicalAdvantage * this.compoundAdvantage
      },
      force: {
        total: this.totalForce,
        perLever: this.totalForce / (1 + this.levers.secondary.length + this.levers.compound.length + this.levers.emergency.length)
      },
      optimization: this.optimizationMetrics
    };
  }

  /**
   * RESETUJ SYSTEM
   */
  resetSystem() {
    this.levers.primary = null;
    this.levers.secondary = [];
    this.levers.compound = [];
    this.levers.emergency = [];
    this.mechanicalAdvantage = 1.0;
    this.compoundAdvantage = 1.0;
    this.totalForce = 0;
    
    console.log('🔄 Leverage System reset');
  }

  async stop() {
    console.log('⏹️ Leverage Engine stopped');
  }

  getStatus() {
    return {
      active: true,
      mechanicalAdvantage: this.mechanicalAdvantage,
      compoundAdvantage: this.compoundAdvantage,
      totalForce: this.totalForce,
      leversCount: {
        primary: this.levers.primary ? 1 : 0,
        secondary: this.levers.secondary.length,
        compound: this.levers.compound.length,
        emergency: this.levers.emergency.length
      }
    };
  }
}

module.exports = LeverageEngine;
