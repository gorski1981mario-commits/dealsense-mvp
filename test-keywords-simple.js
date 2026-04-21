/**
 * TEST KEYWORDS - Czy Router rozpoznaje general queries
 */

const keywords = {
  products: ['produkt', 'koop', 'kopen', 'scanner', 'prijs', 'cena', 'price', 'kost', 'wat kost', 'iphone', 'samsung', 'tv', 'dyson', 'sony', 'koptelefoon', 'telefoon', 'laptop', 'tablet', 'stofzuiger', 'vergelijk'],
  vacation: ['vakantie', 'reis', 'hotel', 'vlucht', 'wakacje', 'urlop', 'barcelona', 'spanje', 'griekenland', 'bestemming'],
  insurance: ['verzekering', 'ubezpieczenie', 'polis', 'schade', 'autoverzekering'],
  telecom: ['mobiel', 'abonnement', 'telefon', 'sim', 'data', 'bellen'],
  energy: ['energie', 'stroom', 'gas', 'energia', 'prąd', 'contract'],
  mortgage: ['hypotheek', 'huis', 'woning', 'hipoteka', 'dom'],
  loan: ['lening', 'krediet', 'pożyczka', 'loan'],
  creditcard: ['creditcard', 'karta', 'card'],
  subscriptions: ['abonnement', 'subskrypcja', 'subscription'],
  general: ['werkt', 'hoe werkt', 'strategie', 'help', 'dealsense', 'pakket', 'plus', 'pro', 'finance', 'verschil', 'wat is', 'leg uit', 'uitleg']
};

function detectIntent(message) {
  const lower = message.toLowerCase();
  
  for (const [intent, words] of Object.entries(keywords)) {
    if (words.some(word => lower.includes(word))) {
      return intent;
    }
  }
  
  return 'general'; // default
}

const tests = [
  'Hoe werkt DealSense?',
  'Wat is het verschil tussen PLUS en PRO pakket?',
  'Wat kost iPhone 15 Pro?',
  'Help me met strategie'
];

console.log('🔍 TESTING KEYWORD MATCHING\n');
console.log('='.repeat(60));

tests.forEach(message => {
  const intent = detectIntent(message);
  console.log(`\n"${message}"`);
  console.log(`  → Intent: ${intent}`);
});

console.log('\n' + '='.repeat(60));
