/**
 * ECHO LiveOS 2.0 - Integration Tests
 * 
 * Kompleksowe testy integracyjne całego systemu:
 * - Pełny workflow przetwarzania
 * - Współpraca między modułami
 * - Wydajność i skalowalność
 * - Real-world scenariusze
 */

const EchoLiveOS = require('../src/EchoLiveOS')

class IntegrationTest {
  constructor() {
    this.echo = null
    this.testResults = []
    this.performanceMetrics = []
  }

  async runAllTests() {
    console.log('🔄 Starting Integration Tests...\n')

    try {
      await this.setup()
      await this.testCompleteWorkflow()
      await this.testModuleCollaboration()
      await this.testPerformanceUnderLoad()
      await this.testRealWorldScenarios()
      await this.testSystemResilience()
      await this.testCollectiveLearning()
      await this.cleanup()

      this.printResults()
      this.printPerformanceMetrics()

    } catch (error) {
      console.error('❌ Integration tests failed:', error)
    }
  }

  async setup() {
    console.log('🔄 Setting up integration test environment...')
    this.echo = new EchoLiveOS({
      quantumMode: true,
      ethicalMode: 'strict',
      creativeMode: 'enabled',
      collectiveMode: 'anonymous',
      performanceMode: 'optimized'
    })

    const startup = await this.echo.startup()
    if (!startup.success) {
      throw new Error('Failed to startup ECHO LiveOS for integration tests')
    }

    console.log('✅ Integration test environment ready\n')
  }

  async testCompleteWorkflow() {
    console.log('🔄 Testing Complete Workflow...')

    try {
      const startTime = Date.now()

      // Step 1: Przetwarzanie złożonego zapytania
      const complexRequest = {
        type: 'complex_problem',
        query: 'Jak zoptymalizować rozwój kariery utrzymując równowagę życiową?',
        domain: 'life_optimization',
        context: {
          user_profile: 'young_professional',
          current_challenges: ['burnout', 'time_management'],
          goals: ['career_growth', 'personal_fulfillment']
        },
        constraints: ['ethical', 'practical', 'sustainable']
      }

      const response = await this.echo.processRequest(complexRequest)
      const processingTime = Date.now() - startTime

      // Step 2: Walidacja odpowiedzi
      this.assert(response.success, 'Complex request should succeed')
      this.assert(response.meta.confidence >= 0.7, 'Should have reasonable confidence')
      this.assert(processingTime < 5000, 'Should process within 5 seconds')

      // Step 3: Sprawdź komponenty odpowiedzi
      this.assert(response.response.primary, 'Should have primary response')
      this.assert(response.response.insights, 'Should have insights')
      this.assert(response.meta.quantumCoherence >= 0.7, 'Should maintain quantum coherence')
      this.assert(response.meta.ethicalScore >= 0.8, 'Should have high ethical score')

      // Step 4: Przewidywanie następnego kroku
      const prediction = await this.echo.predictUserFuture('test_user', {
        last_interaction: complexRequest,
        response_quality: response.meta.confidence
      }, 'short_term')

      this.assert(prediction.predictions.length > 0, 'Should generate predictions')

      // Step 5: Wkład w kolektywną inteligencję
      const contribution = await this.echo.contributeToCollective('test_user', {
        type: 'feedback',
        content: 'System provided valuable life optimization insights',
        rating: 0.9
      }, {
        interaction_type: 'complex_query',
        satisfaction: 'high'
      })

      this.assert(contribution.success, 'Should accept collective contribution')

      const totalTime = Date.now() - startTime
      this.performanceMetrics.push({
        test: 'Complete Workflow',
        time: totalTime,
        success: true
      })

      this.addTestResult('Complete Workflow', true, 
        `Time: ${totalTime}ms, Confidence: ${response.meta.confidence.toFixed(3)}`)

    } catch (error) {
      this.addTestResult('Complete Workflow', false, error.message)
    }

    console.log('✅ Complete Workflow test completed\n')
  }

  async testModuleCollaboration() {
    console.log('🤝 Testing Module Collaboration...')

    try {
      // Test 1: Ethics + Quantum collaboration
      const ethicalQuantumTest = await this.echo.processRequest({
        type: 'ethical_quantum_test',
        query: 'Rozwiąż problem etycznie używając optymalizacji kwantowej',
        ethicalConstraints: ['no_harm', 'truthful'],
        quantumFeatures: ['entanglement', 'superposition']
      })

      this.assert(ethicalQuantumTest.success, 'Ethical-Quantum collaboration should work')
      this.assert(ethicalQuantumTest.meta.ethicalScore >= 0.8, 'Should maintain ethics')
      this.assert(ethicalQuantumTest.meta.quantumCoherence >= 0.7, 'Should maintain coherence')

      // Test 2: Prediction + Creative collaboration
      const creativePredictionTest = await this.echo.processRequest({
        type: 'creative_prediction',
        query: 'Przewidź innowacyjne rozwiązania problemu',
        predictionHorizon: 'short_term',
        creativeDomain: 'technological'
      })

      this.assert(creativePredictionTest.success, 'Prediction-Creative collaboration should work')
      this.assert(creativePredictionTest.response.predictions, 'Should have predictions')
      this.assert(creativePredictionTest.response.creative, 'Should have creative insights')

      // Test 3: Collective + Learning collaboration
      const collectiveLearningTest = await this.echo.processRequest({
        type: 'collective_learning',
        query: 'Naucz się z doświadczeń innych',
        collectiveContext: 'global_wisdom',
        learningMode: 'meta_learning'
      })

      this.assert(collectiveLearningTest.success, 'Collective-Learning collaboration should work')

      // Test 4: All modules collaboration
      const fullCollaborationTest = await this.echo.processRequest({
        type: 'full_collaboration',
        query: 'Rozwiąż złożony problem używając wszystkich możliwości systemu',
        useAllModules: true,
        optimizeFor: ['ethical', 'creative', 'predictive', 'collective']
      })

      this.assert(fullCollaborationTest.success, 'Full module collaboration should work')
      this.assert(fullCollaborationTest.response.primary, 'Should have integrated response')

      this.addTestResult('Module Collaboration', true, 'All module combinations working')

    } catch (error) {
      this.addTestResult('Module Collaboration', false, error.message)
    }

    console.log('✅ Module Collaboration test completed\n')
  }

  async testPerformanceUnderLoad() {
    console.log('⚡ Testing Performance Under Load...')

    try {
      const concurrentRequests = 10
      const requests = []

      const startTime = Date.now()

      // Generuj równoczesne żądania
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(this.echo.processRequest({
          type: 'load_test',
          query: `Test request ${i}`,
          requestId: i,
          timestamp: Date.now()
        }))
      }

      // Czekaj na wszystkie odpowiedzi
      const responses = await Promise.all(requests)
      const totalTime = Date.now() - startTime

      // Analiza wyników
      const successfulResponses = responses.filter(r => r.success)
      const averageLatency = totalTime / concurrentRequests
      const successRate = successfulResponses.length / concurrentRequests

      this.assert(successRate >= 0.9, 'Success rate should be >= 90%')
      this.assert(averageLatency < 1000, 'Average latency should be < 1s per request')

      // Sprawdź spójność systemu pod obciążeniem
      const finalStatus = this.echo.getSystemStatus()
      this.assert(finalStatus.coherence >= 0.7, 'System should maintain coherence under load')
      this.assert(finalStatus.ethicalScore >= 0.8, 'System should maintain ethics under load')

      this.performanceMetrics.push({
        test: 'Performance Under Load',
        time: totalTime,
        requests: concurrentRequests,
        successRate,
        averageLatency
      })

      this.addTestResult('Performance Under Load', true, 
        `${concurrentRequests} requests in ${totalTime}ms, Success: ${(successRate * 100).toFixed(1)}%`)

    } catch (error) {
      this.addTestResult('Performance Under Load', false, error.message)
    }

    console.log('✅ Performance Under Load test completed\n')
  }

  async testRealWorldScenarios() {
    console.log('🌍 Testing Real-World Scenarios...')

    try {
      const scenarios = [
        {
          name: 'Business Decision',
          request: {
            type: 'business_consultation',
            query: 'Czy powinienem zainwestować w rozwój AI w mojej firmie?',
            domain: 'business',
            context: { company_size: 'small', industry: 'technology', budget: 'limited' }
          }
        },
        {
          name: 'Personal Development',
          request: {
            type: 'personal_advice',
            query: 'Jak rozwijać nowe umiejętności w wieku 30 lat?',
            domain: 'personal_development',
            context: { current_skills: ['programming'], interests: ['AI', 'ethics'] }
          }
        },
        {
          name: 'Ethical Dilemma',
          request: {
            type: 'ethical_dilemma',
            query: 'Czy etyczne jest używanie AI do zastępowania miejsc pracy?',
            domain: 'ethics',
            context: { stakeholder: 'manager', industry: 'technology' }
          }
        },
        {
          name: 'Creative Problem',
          request: {
            type: 'creative_challenge',
            query: 'Jak stworzyć innowacyjny produkt edukacyjny?',
            domain: 'education',
            context: { target_audience: 'adults', budget: 'medium', timeline: '6_months' }
          }
        }
      ]

      let passedScenarios = 0

      for (const scenario of scenarios) {
        const response = await this.echo.processRequest(scenario.request)
        
        if (response.success && 
            response.meta.confidence >= 0.6 && 
            response.meta.ethicalScore >= 0.7) {
          passedScenarios++
        }
      }

      this.assert(passedScenarios >= scenarios.length * 0.75, 'At least 75% of scenarios should pass')

      this.addTestResult('Real-World Scenarios', true, 
        `${passedScenarios}/${scenarios.length} scenarios handled successfully`)

    } catch (error) {
      this.addTestResult('Real-World Scenarios', false, error.message)
    }

    console.log('✅ Real-World Scenarios test completed\n')
  }

  async testSystemResilience() {
    console.log('🛡️ Testing System Resilience...')

    try {
      // Test 1: Odzyskiwanie po błędach
      const errorRecoveryTest = await this.echo.processRequest({
        type: 'error_injection',
        query: 'Test error handling',
        simulateError: true
      })

      this.assert(errorRecoveryTest.success, 'Should recover from errors gracefully')

      // Test 2: Przetwarzanie niekompletnych danych
      const incompleteDataTest = await this.echo.processRequest({
        type: 'incomplete_data',
        query: 'Test with incomplete data',
        partial_data: true
      })

      this.assert(incompleteDataTest.success, 'Should handle incomplete data')

      // Test 3: Ekstremalne zapytania
      const extremeQueryTest = await this.echo.processRequest({
        type: 'extreme_query',
        query: 'a'.repeat(10000), // Bardzo długie zapytanie
        complexity: 'maximum'
      })

      this.assert(extremeQueryTest.success, 'Should handle extreme queries')

      // Test 4: Sprawdź integralność systemu
      const integrityCheck = this.echo.getSystemStatus()
      this.assert(integrityCheck.coherence >= 0.6, 'System should maintain integrity')
      this.assert(integrityCheck.active, 'System should remain active')

      this.addTestResult('System Resilience', true, 'All resilience tests passed')

    } catch (error) {
      this.addTestResult('System Resilience', false, error.message)
    }

    console.log('✅ System Resilience test completed\n')
  }

  async testCollectiveLearning() {
    console.log('🌐 Testing Collective Learning...')

    try {
      // Test 1: Wiele wkładów od różnych użytkowników
      const contributions = []
      for (let i = 0; i < 5; i++) {
        const contribution = await this.echo.contributeToCollective(
          `user${i}`,
          {
            type: 'insight',
            content: `Insight from user ${i}`,
            domain: 'test_learning'
          },
          {
            timestamp: Date.now(),
            context: 'collective_test'
          }
        )
        contributions.push(contribution)
      }

      const successfulContributions = contributions.filter(c => c.success)
      this.assert(successfulContributions.length >= 4, 'Most contributions should succeed')

      // Test 2: Uczenie się z kolektywnej wiedzy
      const learningTest = await this.echo.processRequest({
        type: 'collective_learning_query',
        query: 'Naucz się z wkładów innych użytkowników',
        context: 'test_learning'
      })

      this.assert(learningTest.success, 'Should learn from collective contributions')
      this.assert(learningTest.response.wisdom, 'Should access collective wisdom')

      // Test 3: Poprawa jakości z czasem
      const initialQuality = this.echo.getSystemStatus().metrics.performance.accuracy
      
      // Dodaj więcej wkładów
      for (let i = 5; i < 10; i++) {
        await this.echo.contributeToCollective(
          `user${i}`,
          {
            type: 'feedback',
            content: `Quality feedback ${i}`,
            rating: 0.9
          },
          { context: 'quality_improvement' }
        )
      }

      const finalQuality = this.echo.getSystemStatus().metrics.performance.accuracy
      this.assert(finalQuality >= initialQuality, 'Quality should improve with collective learning')

      this.addTestResult('Collective Learning', true, 
        `${successfulContributions.length}/5 contributions successful, Quality improved`)

    } catch (error) {
      this.addTestResult('Collective Learning', false, error.message)
    }

    console.log('✅ Collective Learning test completed\n')
  }

  async cleanup() {
    console.log('🧹 Cleaning up integration test environment...')
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
    console.log('📊 INTEGRATION TEST RESULTS:')
    console.log('=' * 60)

    let passedCount = 0
    for (const result of this.testResults) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${result.test}: ${result.details}`)
      if (result.passed) passedCount++
    }

    console.log('=' * 60)
    console.log(`Total: ${this.testResults.length} tests`)
    console.log(`Passed: ${passedCount}`)
    console.log(`Failed: ${this.testResults.length - passedCount}`)
    console.log(`Success Rate: ${((passedCount / this.testResults.length) * 100).toFixed(1)}%`)

    if (passedCount === this.testResults.length) {
      console.log('\n🎉 All integration tests passed - System is ready for production!')
    } else {
      console.log('\n⚠️ Some integration tests failed - review system integration')
    }
  }

  printPerformanceMetrics() {
    console.log('\n📈 PERFORMANCE METRICS:')
    console.log('=' * 60)

    for (const metric of this.performanceMetrics) {
      console.log(`🔸 ${metric.test}:`)
      console.log(`   Time: ${metric.time}ms`)
      if (metric.requests) {
        console.log(`   Requests: ${metric.requests}`)
        console.log(`   Success Rate: ${(metric.successRate * 100).toFixed(1)}%`)
        console.log(`   Avg Latency: ${metric.averageLatency.toFixed(1)}ms`)
      }
      console.log(`   Status: ${metric.success ? '✅' : '❌'}`)
      console.log()
    }
  }
}

// Uruchomienie testów
if (require.main === module) {
  const integrationTest = new IntegrationTest()
  integrationTest.runAllTests().catch(console.error)
}

module.exports = IntegrationTest
