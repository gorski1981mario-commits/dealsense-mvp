/**
 * PIPELINE ARCHITECTURE - Kompletny System
 * 
 * PIPELINE = Definiowalny proces przetwarzania
 * 
 * FLOW:
 * Input → Regent → Balance → Rotation → Interlocking → Processing → Fact Check → Output
 * 
 * KAŻDY KROK KONTROLOWANY, MIERZONY, OPTYMALIZOWANY
 */

const RegentSystem = require('./RegentSystem');
const BalanceEngine = require('./BalanceEngine');
const InterlockingSystem = require('./InterlockingSystem');
const FactChecker = require('./FactChecker');

class PipelineArchitecture {
  constructor(echoLiveOS) {
    this.echo = echoLiveOS;
    
    // SYSTEMY
    this.regent = new RegentSystem(echoLiveOS.ethicsCore);
    this.balanceEngine = new BalanceEngine(echoLiveOS.ethicsCore);
    this.interlocking = new InterlockingSystem(echoLiveOS.ethicsCore);
    this.factChecker = new FactChecker(echoLiveOS.ethicsCore);
    
    // STATYSTYKI PIPELINE
    this.stats = {
      totalExecutions: 0,
      averageTime: 0,
      averagePerformanceBoost: 1.0,
      successRate: 0
    };
    
    console.log('🔧 PIPELINE ARCHITECTURE initialized');
  }

  /**
   * GŁÓWNA METODA - Wykonaj Pipeline
   */
  async execute(question, context = {}) {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 PIPELINE EXECUTION START');
    console.log('='.repeat(70));
    console.log(`Question: ${question}`);
    
    const execution = {
      timestamp: Date.now(),
      question: question,
      context: context,
      steps: []
    };
    
    const startTime = Date.now();
    
    try {
      // KROK 1: REGENT - Priorytetyzacja
      console.log('\n📍 STEP 1: REGENT PRIORITIZATION');
      const regentStart = Date.now();
      const regentDecision = await this.regent.analyzeAndDecide(question, context);
      const regentTime = Date.now() - regentStart;
      
      execution.steps.push({
        name: 'Regent',
        time: regentTime,
        result: regentDecision
      });
      
      // KROK 2: BALANCE - Oblicz balans
      console.log('\n📍 STEP 2: BALANCE CALCULATION');
      const balanceStart = Date.now();
      const balance = this.balanceEngine.calculateOptimalBalance(regentDecision);
      const balanceTime = Date.now() - balanceStart;
      
      execution.steps.push({
        name: 'Balance',
        time: balanceTime,
        result: balance
      });
      
      // KROK 3: ROTATION - Wybierz i rotuj moduły
      console.log('\n📍 STEP 3: MODULE ROTATION');
      const rotationStart = Date.now();
      const activeModules = this.selectActiveModules(regentDecision, balance);
      const rotationTime = Date.now() - rotationStart;
      
      execution.steps.push({
        name: 'Rotation',
        time: rotationTime,
        result: { activeModules }
      });
      console.log(`   Active modules: ${activeModules.join(', ')}`);
      
      // KROK 4: INTERLOCKING - Zazębianie
      console.log('\n📍 STEP 4: MODULE INTERLOCKING');
      const interlockingStart = Date.now();
      const interlockingResult = this.interlocking.interlockModules(
        activeModules,
        balance.moduleWeights
      );
      const interlockingTime = Date.now() - interlockingStart;
      
      execution.steps.push({
        name: 'Interlocking',
        time: interlockingTime,
        result: interlockingResult
      });
      
      // KROK 5: PROCESSING - Wykonaj moduły
      console.log('\n📍 STEP 5: MODULE PROCESSING');
      const processingStart = Date.now();
      const processingResult = await this.processModules(
        question,
        activeModules,
        interlockingResult.executionOrder,
        balance,
        regentDecision
      );
      const processingTime = Date.now() - processingStart;
      
      execution.steps.push({
        name: 'Processing',
        time: processingTime,
        result: processingResult
      });
      
      // KROK 6: FACT CHECK - Weryfikacja
      console.log('\n📍 STEP 6: FACT VERIFICATION');
      const factCheckStart = Date.now();
      const verification = this.factChecker.verify(
        processingResult.answer,
        question,
        context
      );
      const factCheckTime = Date.now() - factCheckStart;
      
      execution.steps.push({
        name: 'FactCheck',
        time: factCheckTime,
        result: verification
      });
      
      // KROK 7: FINAL OUTPUT
      const totalTime = Date.now() - startTime;
      
      execution.totalTime = totalTime;
      execution.performanceBoost = interlockingResult.synergyPower;
      execution.success = verification.passed;
      execution.finalAnswer = verification.passed 
        ? processingResult.answer 
        : verification.correctedAnswer;
      
      // UPDATE STATS
      this.updateStats(execution);
      
      // PODSUMOWANIE
      console.log('\n' + '='.repeat(70));
      console.log('✅ PIPELINE EXECUTION COMPLETE');
      console.log('='.repeat(70));
      console.log(`Total time: ${totalTime}ms`);
      console.log(`Performance boost: ${interlockingResult.synergyPower.toFixed(2)}x`);
      console.log(`Verification: ${verification.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
      console.log(`Confidence: ${(verification.confidence * 100).toFixed(1)}%`);
      console.log(`\nFinal answer: ${execution.finalAnswer}`);
      console.log('='.repeat(70));
      
      return execution;
      
    } catch (error) {
      console.error('\n❌ PIPELINE ERROR:', error.message);
      execution.error = error.message;
      execution.success = false;
      return execution;
    }
  }

  /**
   * WYBIERZ AKTYWNE MODUŁY
   */
  selectActiveModules(regentDecision, balance) {
    const modules = [];
    
    // Top 3 moduły z Regent
    const topModules = Object.keys(regentDecision.modulePriorities).slice(0, 3);
    modules.push(...topModules);
    
    // Zawsze dodaj Ethics Core (bezpieczeństwo)
    if (!modules.includes('ethicsCore')) {
      modules.push('ethicsCore');
    }
    
    // Dodaj półkule według balansu
    if (balance.optimized.logic_creativity.logic > 0.5) {
      if (!modules.includes('leftHemisphere')) {
        modules.push('leftHemisphere');
      }
    }
    
    if (balance.optimized.logic_creativity.creativity > 0.5) {
      if (!modules.includes('rightHemisphere')) {
        modules.push('rightHemisphere');
      }
    }
    
    return modules;
  }

  /**
   * PRZETWARZAJ MODUŁY
   */
  async processModules(question, activeModules, executionOrder, balance, regentDecision) {
    console.log(`   Processing ${activeModules.length} modules in order: ${executionOrder.join(' → ')}`);
    
    const results = [];
    
    // Wykonaj moduły w optymalnej kolejności
    for (const moduleName of executionOrder) {
      const moduleResult = await this.executeModule(
        moduleName,
        question,
        balance,
        regentDecision
      );
      
      results.push({
        module: moduleName,
        result: moduleResult
      });
    }
    
    // Syntetyzuj wyniki
    const synthesized = this.synthesizeResults(results, balance);
    
    return {
      moduleResults: results,
      answer: synthesized
    };
  }

  /**
   * WYKONAJ MODUŁ
   */
  async executeModule(moduleName, question, balance, regentDecision) {
    // Symulacja wykonania modułu
    // W prawdziwej implementacji wywołałbyś odpowiedni moduł ECHO
    
    const weight = balance.moduleWeights[moduleName] || 0.5;
    const complexity = regentDecision.complexity;
    
    // Symulacja odpowiedzi
    return {
      module: moduleName,
      weight: weight,
      complexity: complexity,
      response: `Response from ${moduleName} (weight: ${weight.toFixed(2)}, complexity: ${complexity})`
    };
  }

  /**
   * SYNTETYZUJ WYNIKI
   */
  synthesizeResults(results, balance) {
    // Połącz wyniki z różnych modułów
    // Ważone według balance.moduleWeights
    
    let synthesis = `Synthesized answer based on ${results.length} modules:\n`;
    
    for (const result of results) {
      const weight = balance.moduleWeights[result.module] || 0.5;
      synthesis += `- ${result.module} (${(weight * 100).toFixed(0)}%): ${result.result.response}\n`;
    }
    
    return synthesis;
  }

  /**
   * UPDATE STATS
   */
  updateStats(execution) {
    this.stats.totalExecutions++;
    
    // Średni czas
    this.stats.averageTime = 
      (this.stats.averageTime * (this.stats.totalExecutions - 1) + execution.totalTime) 
      / this.stats.totalExecutions;
    
    // Średni performance boost
    this.stats.averagePerformanceBoost = 
      (this.stats.averagePerformanceBoost * (this.stats.totalExecutions - 1) + execution.performanceBoost) 
      / this.stats.totalExecutions;
    
    // Success rate
    const successes = execution.success ? 1 : 0;
    this.stats.successRate = 
      (this.stats.successRate * (this.stats.totalExecutions - 1) + successes) 
      / this.stats.totalExecutions;
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      totalExecutions: this.stats.totalExecutions,
      averageTime: this.stats.averageTime.toFixed(0) + 'ms',
      averagePerformanceBoost: this.stats.averagePerformanceBoost.toFixed(2) + 'x',
      successRate: (this.stats.successRate * 100).toFixed(1) + '%',
      components: {
        regent: this.regent.getStatus(),
        balance: this.balanceEngine.getStatus(),
        interlocking: this.interlocking.getStatus(),
        factChecker: this.factChecker.getStatus()
      }
    };
  }
}

module.exports = PipelineArchitecture;
