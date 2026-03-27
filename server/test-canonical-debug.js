/**
 * TEST CANONICAL PRODUCT ENGINE - CO ZWRACA?
 */

const { createCanonicalProduct } = require('./lib/canonicalProductEngine');

const products = [
  { name: 'iPhone 15 Pro 128GB', ean: '0195949038488' },
  { name: 'Samsung Galaxy S24 Ultra 256GB', ean: '8806095334790' },
  { name: 'Sony WH-1000XM5 Headphones', ean: '4548736134447' },
  { name: 'Nintendo Switch OLED', ean: '0045496882747' },
  { name: 'Dyson V12 Detect Slim', ean: '5025155088203' },
  { name: 'Garmin Forerunner 255', ean: '0753759298920' }
];

console.log('🔍 TESTING CANONICAL PRODUCT ENGINE\n');

products.forEach(product => {
  console.log('='.repeat(80));
  console.log(`INPUT: ${product.name}`);
  console.log(`EAN: ${product.ean}`);
  
  const canonical = createCanonicalProduct(product.name, product.ean, null);
  
  console.log('\nOUTPUT:');
  console.log(`  Canonical ID: ${canonical.canonicalId}`);
  console.log(`  Brand: ${canonical.brand}`);
  console.log(`  Model: ${canonical.model}`);
  console.log(`  Variant: ${canonical.variant}`);
  console.log(`  Color: ${canonical.color}`);
  console.log(`  Raw: ${canonical.raw}`);
  console.log(`  Normalized: ${canonical.normalized}`);
  console.log('');
});
