/**
 * ECHO CLOUD - Example Usage
 * 
 * Demonstrates how to use ECHO Cloud in production
 */

const EchoCloud = require('./echo-cloud');

async function main() {
  // Initialize
  const echo = new EchoCloud();
  await echo.initialize();
  
  console.log('🚀 ECHO Cloud ready!\n');
  
  // ========================================================================
  // EXAMPLE 1: Simple Mathematical Question
  // ========================================================================
  
  console.log('EXAMPLE 1: Mathematical Question');
  console.log('-'.repeat(70));
  
  const result1 = await echo.answer(
    'Calculate the optimal price for a product that costs €50 to make, with 30% margin',
    { domain: 'business' }
  );
  
  console.log('Answer:', result1.answer);
  console.log('Cost:', result1.cost);
  console.log('Time:', result1.time + 'ms');
  console.log('Specialists:', result1.specialists.join(', '));
  console.log('Gear Shift:', result1.gearShift);
  console.log();
  
  // ========================================================================
  // EXAMPLE 2: Creative Question (triggers CREATIVE GEAR)
  // ========================================================================
  
  console.log('EXAMPLE 2: Creative Question (GEAR SHIFT expected)');
  console.log('-'.repeat(70));
  
  const result2 = await echo.answer(
    'Invent a revolutionary new feature for DealSense that uses AI to predict future price drops',
    { domain: 'innovation', creativity: 0.9 }
  );
  
  console.log('Answer:', result2.answer.substring(0, 200) + '...');
  console.log('Cost:', result2.cost);
  console.log('Time:', result2.time + 'ms');
  console.log('Specialists:', result2.specialists.join(', '));
  console.log('Gear Shift:', result2.gearShift, '← Should be CREATIVE!');
  console.log();
  
  // ========================================================================
  // EXAMPLE 3: Complex Strategic Question (triggers ANALYTICAL GEAR)
  // ========================================================================
  
  console.log('EXAMPLE 3: Complex Strategic Question (GEAR SHIFT expected)');
  console.log('-'.repeat(70));
  
  const result3 = await echo.answer(
    'Develop a comprehensive multi-year strategy to scale DealSense from 10K to 1M users while maintaining profitability and ethical standards',
    { domain: 'strategy', complexity: 5 }
  );
  
  console.log('Answer:', result3.answer.substring(0, 200) + '...');
  console.log('Cost:', result3.cost);
  console.log('Time:', result3.time + 'ms');
  console.log('Specialists:', result3.specialists.join(', '));
  console.log('Gear Shift:', result3.gearShift, '← Should be ANALYTICAL!');
  console.log();
  
  // ========================================================================
  // EXAMPLE 4: Balanced Question (triggers BALANCE GEAR)
  // ========================================================================
  
  console.log('EXAMPLE 4: Balanced Question (GEAR SHIFT expected)');
  console.log('-'.repeat(70));
  
  const result4 = await echo.answer(
    'How can we balance user privacy with personalized recommendations in DealSense?',
    { domain: 'ethics', balance: true }
  );
  
  console.log('Answer:', result4.answer.substring(0, 200) + '...');
  console.log('Cost:', result4.cost);
  console.log('Time:', result4.time + 'ms');
  console.log('Specialists:', result4.specialists.join(', '));
  console.log('Gear Shift:', result4.gearShift, '← Should be BALANCE!');
  console.log();
  
  // ========================================================================
  // STATUS
  // ========================================================================
  
  console.log('='.repeat(70));
  console.log('📊 ECHO CLOUD STATUS');
  console.log('='.repeat(70));
  
  const status = echo.getStatus();
  console.log('Total answers:', status.totalAnswers);
  console.log('Total cost:', '€' + status.totalCost);
  console.log('Avg cost per answer:', '€' + status.avgCost);
  console.log('Avg response time:', status.avgResponseTime + 'ms');
  console.log('Gear shift rate:', status.gearShiftRate);
  console.log();
  
  // Shutdown
  await echo.shutdown();
}

main().catch(console.error);
