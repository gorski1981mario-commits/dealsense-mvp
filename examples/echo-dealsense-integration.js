/**
 * Przykład integracji ECHO LiveOS 2.0 z DealSense
 * Jak używać potężnego AI w aplikacji zakupowej
 * Czas tworzenia: 1 minuta 🚀
 */

const echoBridge = require('../server/echo-bridge');

async function demonstrateEchoIntegration() {
  console.log('🤖 Demonstracja integracji ECHO LiveOS + DealSense\n');

  // 1. Inicjalizacja
  console.log('1️⃣ Inicjalizacja ECHO Bridge...');
  const initialized = await echoBridge.initialize();
  
  if (!initialized) {
    console.log('❌ Nie udało się zainicjalizować ECHO Bridge');
    return;
  }
  
  console.log('✅ ECHO Bridge gotowy do pracy!\n');

  // 2. Przykładowe zapytanie zakupowe
  console.log('2️⃣ Test zapytania zakupowego...');
  const shoppingQuery = await echoBridge.processShoppingQuery(
    'Szukam iPhone 15 Pro, ale nie chcę przepłacać. Co polecasz?',
    {
      userId: 'user123',
      sessionId: 'session456',
      budget: 'medium',
      interests: ['technology', 'apple']
    }
  );
  
  console.log('📝 Odpowiedź ECHO:', shoppingQuery.response);
  console.log('🎯 Pewność:', shoppingQuery.confidence);
  console.log('🛡️ Wynik etyczny:', shoppingQuery.ethicalScore);
  console.log('💡 Sugestie:', shoppingQuery.suggestions);
  console.log('');

  // 3. Predykcja potrzeb użytkownika
  console.log('3️⃣ Predykcja potrzeb...');
  const prediction = await echoBridge.predictUserNeeds('user123', {
    recentSearches: ['iphone', 'laptop', 'headphones'],
    budget: 'medium',
    interests: ['technology', 'apple']
  });
  
  console.log('🔮 Przewidywania:', prediction.predictions);
  console.log('🎯 Następne prawdopodobne wyszukiwanie:', prediction.nextLikelySearch);
  console.log('💡 Rekomendacje:', prediction.recommendations);
  console.log('');

  // 4. Kwantowe scoring ofert
  console.log('4️⃣ Kwantowe analiza ofert...');
  const offers = [
    {
      id: 1,
      title: 'iPhone 15 Pro 256GB',
      price: 1099,
      originalPrice: 1199,
      shop: 'Mediamarkt',
      condition: 'new',
      brand: 'Apple',
      category: 'smartphones'
    },
    {
      id: 2,
      title: 'iPhone 15 Pro 256GB',
      price: 1049,
      originalPrice: 1199,
      shop: 'Coolblue',
      condition: 'new',
      brand: 'Apple',
      category: 'smartphones'
    }
  ];

  const scoredOffers = await echoBridge.quantumScoreOffers(offers, {
    maxBudget: 1200,
    brands: ['Apple'],
    categories: ['smartphones']
  });
  
  console.log('📊 Ocena ofert:', scoredOffers.scoredOffers);
  console.log('🌐 Kwantowe insights:', scoredOffers.quantumInsights);
  console.log('');

  // 5. Kreatywne rekomendacje
  console.log('5️⃣ Kreatywne rekomendacje...');
  const recommendations = await echoBridge.generateCreativeRecommendations(
    {
      userId: 'user123',
      budget: 'medium',
      interests: ['technology', 'apple']
    },
    'iPhone 15 Pro'
  );
  
  console.log('💡 Rekomendacje:', recommendations.recommendations);
  console.log('🎨 Kreatywne insights:', recommendations.creativeInsights);
  console.log('');

  // 6. Wkład do kolektywnej inteligencji
  console.log('6️⃣ Wkład do kolektywnej inteligencji...');
  const contribution = await echoBridge.contributeShoppingInsight('user123', {
    type: 'price_alert',
    content: 'iPhone 15 Pro jest najtańszy w Coolblue podczas wyprzedaży',
    confidence: 0.9
  });
  
  console.log('🤝 Wynik wkładu:', contribution.message);
  console.log('');

  // 7. Status systemu
  console.log('7️⃣ Status systemu ECHO...');
  const status = echoBridge.getSystemStatus();
  console.log('📊 Status:', status.status);
  console.log('🧠 ECHO Status:', status.echo);
  console.log('🌉 Bridge Status:', status.bridge);
  console.log('');

  // 8. Wyłączenie
  console.log('8️⃣ Wyłączanie ECHO Bridge...');
  await echoBridge.shutdown();
  console.log('🔌 ECHO Bridge wyłączony');

  console.log('\n🎉 Integracja ECHO LiveOS + DealSense zakończona sukcesem!');
  console.log('⏱️  Całość zajęła mniej niż 5 minut!');
}

// Uruchom demonstrację
if (require.main === module) {
  demonstrateEchoIntegration().catch(console.error);
}

module.exports = { demonstrateEchoIntegration };
