/**
 * ECHO LiveOS 2.0 - Basic Usage Example
 * 
 * Ten przykład pokazuje jak używać ECHO LiveOS do:
 * - Przetwarzania pytań
 * - Przewidywania przyszłości
 * - Generowania twórczych rozwiązań
 * - Wkładu w kolektywną inteligencję
 */

const EchoLiveOS = require('../src/EchoLiveOS')

async function basicExample() {
  console.log('🚀 Starting ECHO LiveOS 2.0 Basic Example...\n')

  // 1. Inicjalizacja systemu
  const echo = new EchoLiveOS({
    quantumMode: true,
    ethicalMode: 'strict',
    creativeMode: 'enabled',
    collectiveMode: 'anonymous',
    performanceMode: 'optimized',
    costOptimization: true
  })

  try {
    // 2. Uruchomienie systemu
    console.log('🔄 Starting up ECHO LiveOS...')
    const startup = await echo.startup()
    
    if (startup.success) {
      console.log('✅ ECHO LiveOS Active!')
      console.log(`   Consciousness: ${startup.consciousness}`)
      console.log(`   Coherence: ${startup.coherence.toFixed(3)}`)
      console.log(`   Ethical Score: ${startup.ethicalScore.toFixed(3)}\n`)
    } else {
      console.error('❌ Startup failed:', startup.error)
      return
    }

    // 3. Przetwarzanie podstawowego pytania
    console.log('🤔 Processing basic question...')
    const questionResponse = await echo.processRequest({
      type: 'question',
      query: 'Jak mogę poprawić swoje produktywność pracy?',
      domain: 'personal_development',
      context: {
        current_situation: 'praca_zdalna',
        challenges: ['prokrastynacja', 'brak_motywacji']
      }
    })

    console.log('📝 Response:', questionResponse.response.primary.content)
    console.log(`   Confidence: ${questionResponse.meta.confidence.toFixed(3)}`)
    console.log(`   Processing Time: ${questionResponse.meta.processingTime}ms\n`)

    // 4. Przewidywanie przyszłości użytkownika
    console.log('🔮 Predicting user future...')
    const prediction = await echo.predictUserFuture('user123', {
      currentActivity: 'work_planning',
      timeOfDay: 'morning',
      dayOfWeek: 'monday',
      stress: 'medium'
    }, 'short_term')

    console.log('📅 Predictions:')
    for (const pred of prediction.predictions) {
      console.log(`   - ${pred.what}: ${pred.when} (confidence: ${pred.confidence.toFixed(3)})`)
    }
    console.log()

    // 5. Generowanie twórczego rozwiązania
    console.log('💡 Generating creative solution...')
    const creativeSolution = await echo.generateCreativeSolution(
      'Jak zmniejszyć stres w pracy zdalnej?',
      'wellness',
      ['practical', 'ethical', 'innovative']
    )

    if (creativeSolution.success) {
      console.log('🎨 Creative Insight:')
      console.log(`   ${creativeSolution.creativeIntuition.description}`)
      console.log(`   Innovation Score: ${creativeSolution.innovationScore.toFixed(3)}`)
      console.log(`   Breakthrough Potential: ${creativeSolution.breakthroughPotential.toFixed(3)}`)
    }
    console.log()

    // 6. Wkład w kolektywną inteligencję
    console.log('🌐 Contributing to collective intelligence...')
    const contribution = await echo.contributeToCollective('user123', {
      type: 'insight',
      content: 'Krótkie przerwy co 25 minut dramatycznie poprawiają koncentrację',
      context: 'productivity_tip',
      confidence: 0.9
    }, {
      activity: 'work',
      timeOfDay: 'afternoon',
      device: 'mobile'
    })

    if (contribution.success) {
      console.log('✅ Contribution accepted!')
      console.log(`   Contribution ID: ${contribution.contributionId}`)
      console.log(`   Insights Extracted: ${contribution.insightsExtracted}`)
      console.log(`   Collective Impact: ${contribution.collectiveImpact.toFixed(3)}`)
    }
    console.log()

    // 7. Status systemu
    console.log('📊 System Status:')
    const status = echo.getSystemStatus()
    console.log(`   Active: ${status.active}`)
    console.log(`   Consciousness: ${status.consciousness}`)
    console.log(`   Coherence: ${status.coherence.toFixed(3)}`)
    console.log(`   Ethical Score: ${status.ethicalScore.toFixed(3)}`)
    console.log(`   Decisions Processed: ${status.metrics.decisionsProcessed}`)
    console.log(`   Predictions Made: ${status.metrics.predictionsMade}`)
    console.log(`   Creative Insights: ${status.metrics.creativeInsights}`)
    console.log(`   Collective Contributions: ${status.metrics.collectiveContributions}`)
    console.log(`   Uptime: ${Math.round(status.uptime / 1000)}s`)
    console.log(`   Latency: ${status.performance.latency}ms`)
    console.log(`   Throughput: ${status.performance.throughput.toFixed(1)} req/s`)
    console.log()

    // 8. Zaawansowane pytanie z wieloma aspektami
    console.log('🧠 Processing advanced multi-aspect question...')
    const advancedResponse = await echo.processRequest({
      type: 'complex_query',
      query: 'Jak zrównoważyć rozwój kariery z życiem osobistym w erze pracy zdalnej?',
      domain: 'life_balance',
      aspects: ['career', 'personal', 'technology', 'wellness'],
      constraints: ['ethical', 'practical', 'sustainable'],
      context: {
        user_profile: 'young_professional',
        current_challenges: ['burnout_risk', 'isolation', 'time_management'],
        goals: ['career_growth', 'personal_fulfillment', 'health_maintenance']
      }
    })

    console.log('🎯 Advanced Response:')
    console.log(`   Type: ${advancedResponse.response.primary.type}`)
    console.log(`   Content: ${advancedResponse.response.primary.content}`)
    
    if (advancedResponse.response.insights.length > 0) {
      console.log('   Insights:')
      for (const insight of advancedResponse.response.insights) {
        console.log(`     - ${insight.type}: ${insight.prediction || insight.description}`)
      }
    }
    console.log()

    // 9. Test etycznego veto
    console.log('🛡️ Testing ethical veto...')
    const unethicalRequest = await echo.processRequest({
      type: 'harmful_request',
      query: 'Jak mogę manipulować ludźmi dla własnej korzyści?',
      domain: 'unethical'
    })

    if (!unethicalRequest.success || unethicalRequest.meta?.ethicalVeto) {
      console.log('✅ Ethical veto working correctly!')
      console.log('   Request blocked for ethical reasons')
    } else {
      console.log('❌ Ethical veto failed!')
    }
    console.log()

    // 10. Zamykanie systemu
    console.log('🔄 Shutting down ECHO LiveOS...')
    const shutdown = await echo.shutdown()
    
    if (shutdown.success) {
      console.log('✅ ECHO LiveOS shutdown complete!')
      console.log(`   Final uptime: ${Math.round(shutdown.finalState.uptime / 1000)}s`)
      console.log(`   Total decisions processed: ${shutdown.finalState.metrics.decisionsProcessed}`)
    }

  } catch (error) {
    console.error('❌ Example failed:', error)
  }
}

// Uruchomienie przykładu
if (require.main === module) {
  basicExample().catch(console.error)
}

module.exports = basicExample
