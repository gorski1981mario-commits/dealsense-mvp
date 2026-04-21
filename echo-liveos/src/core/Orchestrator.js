/**
 * ORCHESTRATOR - CENTRALNY DYRYGENT ECHO LiveOS
 * 
 * Koordynuje wszystkie moduły:
 * - Dwie półkule mózgu (Lewa/Prawa)
 * - Rubik Cube Engine
 * - 1000 Mózgów
 * - Pętla Möbiusa
 * - Quantum Annealing
 * 
 * ZAWSZE sprawdza Ethics Core przed każdą decyzją
 */

class Orchestrator {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore
    
    // MODUŁY SYSTEMU
    this.modules = {
      leftHemisphere: null,   // Lewa półkula (logika)
      rightHemisphere: null,  // Prawa półkula (kreatywność)
      rubikCube: null,        // Rubik Cube Engine
      thousandBrains: null,   // 1000 Mózgów
      mobiusLoop: null,       // Pętla Möbiusa
      quantumAnnealing: null  // Quantum Annealing
    }
    
    // STAN ORKIESTRATORA
    this.state = {
      active: false,
      currentTask: null,
      performance: {
        tasksProcessed: 0,
        averageTime: 0,
        successRate: 0
      }
    }
    
    // STRATEGIA PRZETWARZANIA
    this.strategy = {
      mode: 'balanced',  // 'logical', 'creative', 'balanced'
      priority: 'performance',  // 'performance', 'accuracy', 'speed'
      parallelism: true  // Czy przetwarzać równolegle
    }
  }

  /**
   * INICJALIZACJA ORKIESTRATORA
   */
  async initialize(modules) {
    console.log('🎼 Initializing Orchestrator...')
    
    // Przypisz moduły
    this.modules = { ...this.modules, ...modules }
    
    // Sprawdź czy wszystkie moduły są dostępne
    const requiredModules = ['leftHemisphere', 'rightHemisphere', 'rubikCube']
    for (const moduleName of requiredModules) {
      if (!this.modules[moduleName]) {
        console.warn(`⚠️ Module ${moduleName} not available`)
      }
    }
    
    this.state.active = true
    console.log('✅ Orchestrator initialized')
    
    return {
      success: true,
      modulesLoaded: Object.keys(this.modules).filter(k => this.modules[k] !== null)
    }
  }

  /**
   * GŁÓWNA METODA - Przetwarzanie problemu
   */
  async processTask(task) {
    const startTime = Date.now()
    
    try {
      // 1. ETYCZNA WALIDACJA (ZAWSZE NAJPIERW!)
      const ethicalCheck = await this.ethicsCore.validateDecision({
        type: 'task_processing',
        task: task.description,
        complexity: task.complexity || 0.5,
        creativity: task.requiresCreativity || 0.5
      })
      
      if (!ethicalCheck.approved) {
        console.warn('❌ Task rejected by Ethics Core:', ethicalCheck.reasoning)
        return {
          success: false,
          reason: 'ethical_veto',
          details: ethicalCheck
        }
      }
      
      // 2. WYBÓR STRATEGII
      const strategy = this.selectStrategy(task)
      console.log(`🎯 Strategy selected: ${strategy.mode}`)
      
      // 3. WYBÓR PÓŁKULI
      const hemisphere = this.selectHemisphere(task, strategy)
      console.log(`🧠 Hemisphere selected: ${hemisphere}`)
      
      // 4. PRZETWARZANIE PRZEZ WYBRANE MODUŁY
      const result = await this.executeStrategy(task, strategy, hemisphere)
      
      // 5. AKTUALIZACJA STATYSTYK
      this.updatePerformance(startTime, result.success)
      
      return {
        success: true,
        result,
        strategy,
        hemisphere,
        processingTime: Date.now() - startTime,
        ethicalScore: ethicalCheck.ethicalScore
      }
      
    } catch (error) {
      console.error('❌ Orchestrator error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * WYBÓR STRATEGII na podstawie zadania
   */
  selectStrategy(task) {
    // Analiza zadania
    const requiresLogic = task.requiresLogic || task.complexity > 0.7
    const requiresCreativity = task.requiresCreativity || task.novelty > 0.7
    const requiresSpeed = task.urgent || task.deadline
    
    // Wybór trybu
    let mode = 'balanced'
    if (requiresLogic && !requiresCreativity) {
      mode = 'logical'
    } else if (requiresCreativity && !requiresLogic) {
      mode = 'creative'
    }
    
    // Wybór priorytetu
    let priority = 'performance'
    if (requiresSpeed) {
      priority = 'speed'
    } else if (task.accuracy > 0.8) {
      priority = 'accuracy'
    }
    
    return {
      mode,
      priority,
      parallelism: !requiresSpeed  // Jeśli pilne, nie równolegle
    }
  }

  /**
   * WYBÓR PÓŁKULI na podstawie strategii
   */
  selectHemisphere(task, strategy) {
    switch (strategy.mode) {
      case 'logical':
        return 'left'
      case 'creative':
        return 'right'
      case 'balanced':
        return 'both'
      default:
        return 'both'
    }
  }

  /**
   * WYKONANIE STRATEGII
   */
  async executeStrategy(task, strategy, hemisphere) {
    const results = {}
    
    // Przetwarzanie przez półkule
    if (hemisphere === 'left' || hemisphere === 'both') {
      if (this.modules.leftHemisphere) {
        results.left = await this.modules.leftHemisphere.process(task)
      }
    }
    
    if (hemisphere === 'right' || hemisphere === 'both') {
      if (this.modules.rightHemisphere) {
        results.right = await this.modules.rightHemisphere.process(task)
      }
    }
    
    // Przetwarzanie przez Rubik Cube (jeśli dostępny)
    if (this.modules.rubikCube) {
      results.rubikCube = await this.modules.rubikCube.processWithCube(task, results)
    }
    
    // Agregacja wyników
    return this.aggregateResults(results, strategy)
  }

  /**
   * AGREGACJA WYNIKÓW z różnych modułów
   */
  aggregateResults(results, strategy) {
    // Jeśli tylko jedna półkula
    if (results.left && !results.right) {
      return results.left
    }
    if (results.right && !results.left) {
      return results.right
    }
    
    // Jeśli obie półkule - agreguj
    if (results.left && results.right) {
      return {
        type: 'aggregated',
        logical: results.left,
        creative: results.right,
        rubikCube: results.rubikCube || null,
        combined: this.combineResults(results.left, results.right, strategy)
      }
    }
    
    return results
  }

  /**
   * KOMBINACJA WYNIKÓW z lewej i prawej półkuli
   */
  combineResults(leftResult, rightResult, strategy) {
    // Wagi dla różnych strategii
    const weights = {
      logical: { left: 0.8, right: 0.2 },
      creative: { left: 0.2, right: 0.8 },
      balanced: { left: 0.5, right: 0.5 }
    }
    
    const w = weights[strategy.mode] || weights.balanced
    
    return {
      confidence: leftResult.confidence * w.left + rightResult.confidence * w.right,
      solution: strategy.mode === 'logical' ? leftResult.solution : rightResult.solution,
      reasoning: [...(leftResult.reasoning || []), ...(rightResult.reasoning || [])]
    }
  }

  /**
   * AKTUALIZACJA STATYSTYK
   */
  updatePerformance(startTime, success) {
    const processingTime = Date.now() - startTime
    
    this.state.performance.tasksProcessed++
    
    // Średni czas (moving average)
    const alpha = 0.1  // Waga dla nowych pomiarów
    this.state.performance.averageTime = 
      this.state.performance.averageTime * (1 - alpha) + processingTime * alpha
    
    // Success rate (moving average)
    const successValue = success ? 1.0 : 0.0
    this.state.performance.successRate = 
      this.state.performance.successRate * (1 - alpha) + successValue * alpha
  }

  /**
   * POBIERZ STATUS ORKIESTRATORA
   */
  getStatus() {
    return {
      active: this.state.active,
      currentTask: this.state.currentTask,
      performance: this.state.performance,
      strategy: this.strategy,
      modules: Object.keys(this.modules).reduce((acc, key) => {
        acc[key] = this.modules[key] !== null
        return acc
      }, {})
    }
  }
}

module.exports = Orchestrator
