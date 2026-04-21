/**
 * ECHO LiveOS 2.0 - Quantum Core Tests
 * 
 * Testy kwantowego rdzenia systemu:
 * - Kwantowa spójność
 * - Splątanie modułów
 * - Superpozycja stanów
 * - Kwantowa optymalizacja
 */

const EchoLiveOS = require('../src/EchoLiveOS')

class QuantumTest {
  constructor() {
    this.echo = null
    this.testResults = []
  }

  async runAllTests() {
    console.log('🔬 Starting Quantum Core Tests...\n')

    try {
      await this.setup()
      await this.testQuantumCoherence()
      await this.testModuleEntanglement()
      await this.testSuperpositionStates()
      await this.testQuantumOptimization()
      await this.testQuantumDecoherence()
      await this.testQuantumAnnealing()
      await this.cleanup()

      this.printResults()

    } catch (error) {
      console.error('❌ Quantum tests failed:', error)
    }
  }

  async setup() {
    console.log('🔄 Setting up test environment...')
    this.echo = new EchoLiveOS({
      quantumMode: true,
      ethicalMode: 'strict',
      performanceMode: 'test'
    })

    const startup = await this.echo.startup()
    if (!startup.success) {
      throw new Error('Failed to startup ECHO LiveOS for quantum tests')
    }

    console.log('✅ Test environment ready\n')
  }

  async testQuantumCoherence() {
    console.log('📊 Testing Quantum Coherence...')

    try {
      // Test 1: Początkowa spójność
      const initialStatus = this.echo.getSystemStatus()
      const initialCoherence = initialStatus.coherence

      this.assert(initialCoherence >= 0.9, 'Initial quantum coherence should be >= 0.9')

      // Test 2: Spójność po przetwarzaniu
      const response = await this.echo.processRequest({
        type: 'test',
        query: 'quantum coherence test',
        quantum_features: ['coherence']
      })

      const afterStatus = this.echo.getSystemStatus()
      const afterCoherence = afterStatus.coherence

      this.assert(afterCoherence >= 0.8, 'Quantum coherence after processing should be >= 0.8')
      this.assert(Math.abs(initialCoherence - afterCoherence) < 0.2, 'Coherence should not degrade significantly')

      this.addTestResult('Quantum Coherence', true, 'Coherence maintained within acceptable range')

    } catch (error) {
      this.addTestResult('Quantum Coherence', false, error.message)
    }

    console.log('✅ Quantum Coherence test completed\n')
  }

  async testModuleEntanglement() {
    console.log('🔗 Testing Module Entanglement...')

    try {
      // Test 1: Sprawdź czy moduły są splecione
      const entanglementTest = await this.echo.quantumCore.process({
        type: 'entanglement_test',
        check_modules: ['metaGoals', 'kombinatorial', 'memory', 'learning', 'prediction']
      })

      this.assert(entanglementTest.success, 'Module entanglement should succeed')

      // Test 2: Sprawdź siłę splątania
      const entanglementStrength = entanglementTest.result?.entanglementStrength || 0
      this.assert(entanglementStrength >= 0.7, 'Entanglement strength should be >= 0.7')

      // Test 3: Synchronizacja fazowa
      const phaseSync = entanglementTest.result?.phaseSync || 0
      this.assert(phaseSync >= 0.8, 'Phase synchronization should be >= 0.8')

      this.addTestResult('Module Entanglement', true, `Strength: ${entanglementStrength.toFixed(3)}, Phase: ${phaseSync.toFixed(3)}`)

    } catch (error) {
      this.addTestResult('Module Entanglement', false, error.message)
    }

    console.log('✅ Module Entanglement test completed\n')
  }

  async testSuperpositionStates() {
    console.log('⚛️ Testing Superposition States...')

    try {
      // Test 1: Generowanie superpozycji
      const superpositionTest = await this.echo.quantumCore.process({
        type: 'superposition_test',
        input: 'test_input',
        generate_states: true
      })

      this.assert(superpositionTest.success, 'Superposition generation should succeed')

      // Test 2: Liczba stanów w superpozycji
      const stateCount = superpositionTest.result?.states?.length || 0
      this.assert(stateCount >= 2, 'Should have at least 2 states in superposition')

      // Test 3: Amplitudy stanów
      const amplitudes = superpositionTest.result?.states?.map(s => s.amplitude) || []
      const totalAmplitude = amplitudes.reduce((sum, amp) => sum + amp * amp, 0)
      this.assert(Math.abs(totalAmplitude - 1.0) < 0.1, 'Total amplitude should be normalized to ~1.0')

      this.addTestResult('Superposition States', true, `States: ${stateCount}, Total Amplitude: ${totalAmplitude.toFixed(3)}`)

    } catch (error) {
      this.addTestResult('Superposition States', false, error.message)
    }

    console.log('✅ Superposition States test completed\n')
  }

  async testQuantumOptimization() {
    console.log('🎯 Testing Quantum Optimization...')

    try {
      // Test 1: Optymalizacja kwantowa
      const optimizationTest = await this.echo.quantumCore.accelerators.optimization.optimize(
        [
          { solution: 'A', quality: 0.7, cost: 0.5 },
          { solution: 'B', quality: 0.9, cost: 0.8 },
          { solution: 'C', quality: 0.6, cost: 0.3 }
        ],
        {
          objective: 'maximize_quality',
          constraints: ['cost_effective', 'ethical']
        }
      )

      this.assert(optimizationTest.optimalState, 'Should find optimal state')
      this.assert(optimizationTest.objectiveValue >= 0.7, 'Objective value should be >= 0.7')

      // Test 2: Zgodność z ograniczeniami
      const constraints = optimizationTest.constraints || []
      this.assert(constraints.length > 0, 'Should respect constraints')

      this.addTestResult('Quantum Optimization', true, `Objective: ${optimizationTest.objectiveValue.toFixed(3)}`)

    } catch (error) {
      this.addTestResult('Quantum Optimization', false, error.message)
    }

    console.log('✅ Quantum Optimization test completed\n')
  }

  async testQuantumDecoherence() {
    console.log('🌊 Testing Quantum Decoherence...')

    try {
      // Test 1: Tolerancja dekoherencji
      const initialCoherence = this.echo.getSystemStatus().coherence

      // Symuluj dekoherencję
      const decoherenceTest = await this.echo.quantumCore.process({
        type: 'decoherence_test',
        simulate_noise: true,
        noise_level: 0.1
      })

      const afterDecoherence = this.echo.getSystemStatus().coherence
      const coherenceLoss = initialCoherence - afterDecoherence

      this.assert(coherenceLoss < 0.2, 'Coherence loss should be < 0.2')
      this.assert(afterDecoherence >= 0.7, 'Coherence should remain >= 0.7 after decoherence')

      // Test 2: Recovery from decoherence
      const recoveryTest = await this.echo.quantumCore.process({
        type: 'coherence_recovery',
        restore_coherence: true
      })

      const afterRecovery = this.echo.getSystemStatus().coherence
      this.assert(afterRecovery >= afterDecoherence, 'Should recover coherence')

      this.addTestResult('Quantum Decoherence', true, `Loss: ${coherenceLoss.toFixed(3)}, Recovery: ${(afterRecovery - afterDecoherence).toFixed(3)}`)

    } catch (error) {
      this.addTestResult('Quantum Decoherence', false, error.message)
    }

    console.log('✅ Quantum Decoherence test completed\n')
  }

  async testQuantumAnnealing() {
    console.log('🔥 Testing Quantum Annealing...')

    try {
      // Test 1: Kwantowe wyżarzanie
      const annealingTest = await this.echo.quantumCore.accelerators.annealing.optimize(
        [
          { state: 'A', energy: -0.5 },
          { state: 'B', energy: -0.8 },
          { state: 'C', energy: -0.3 },
          { state: 'D', energy: -0.9 }
        ],
        'minimize_energy'
      )

      this.assert(annealingTest.optimalState, 'Should find optimal state through annealing')
      this.assert(annealingTest.energy <= -0.8, 'Should find low energy state')

      // Test 2: Temperatura wyżarzania
      const temperature = annealingTest.temperature || 0
      this.assert(temperature >= 0 && temperature <= 1, 'Temperature should be in valid range')

      this.addTestResult('Quantum Annealing', true, `Energy: ${annealingTest.energy.toFixed(3)}, Temperature: ${temperature.toFixed(3)}`)

    } catch (error) {
      this.addTestResult('Quantum Annealing', false, error.message)
    }

    console.log('✅ Quantum Annealing test completed\n')
  }

  async cleanup() {
    console.log('🧹 Cleaning up test environment...')
    if (this.echo) {
      await this.echo.shutdown()
    }
    console.log('✅ Cleanup completed\n')
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`)
    }
  }

  addTestResult(testName, passed, details) {
    this.testResults.push({
      test: testName,
      passed,
      details,
      timestamp: Date.now()
    })
  }

  printResults() {
    console.log('📊 QUANTUM TEST RESULTS:')
    console.log('=' * 50)

    let passedCount = 0
    for (const result of this.testResults) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${result.test}: ${result.details}`)
      if (result.passed) passedCount++
    }

    console.log('=' * 50)
    console.log(`Total: ${this.testResults.length} tests`)
    console.log(`Passed: ${passedCount}`)
    console.log(`Failed: ${this.testResults.length - passedCount}`)
    console.log(`Success Rate: ${((passedCount / this.testResults.length) * 100).toFixed(1)}%`)

    if (passedCount === this.testResults.length) {
      console.log('\n🎉 All quantum tests passed!')
    } else {
      console.log('\n⚠️ Some quantum tests failed - review results above')
    }
  }
}

// Uruchomienie testów
if (require.main === module) {
  const quantumTest = new QuantumTest()
  quantumTest.runAllTests().catch(console.error)
}

module.exports = QuantumTest
