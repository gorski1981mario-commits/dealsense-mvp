const { getTrustScore } = require('./scoring/trustEngine');

const offers = [
  {seller: 'bol.com', url: 'https://bol.com/test', price: 100},
  {seller: 'iZi Deals', url: 'https://izideals.nl/test', price: 90},
  {seller: 'DavidTelecom.NL', url: 'https://davidtelecom.nl/test', price: 95},
  {seller: 'Coolblue', url: 'https://coolblue.nl/test', price: 105},
  {seller: 'MediaMarkt', url: 'https://mediamarkt.nl/test', price: 110}
];

console.log('TRUST SCORES (threshold: 25):');
console.log('='.repeat(50));
offers.forEach(o => {
  const trust = getTrustScore(o);
  const passed = trust >= 25 ? '✅' : '❌';
  console.log(`${passed} ${o.seller.padEnd(20)} trust=${trust}`);
});
