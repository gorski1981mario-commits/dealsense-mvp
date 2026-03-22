"use strict";

// Test ładowania .env.test BEZ cache
delete require.cache[require.resolve('dotenv')];

const fs = require('fs');
const path = require('path');

console.log('\n🔍 TEST: Bezpośrednie czytanie .env.test\n');

const envTestPath = path.join(__dirname, '.env.test');
const content = fs.readFileSync(envTestPath, 'utf8');

console.log('Zawartość .env.test:');
console.log('---');
const lines = content.split('\n').filter(line => line.includes('GOOGLE_SHOPPING_API_KEY'));
lines.forEach(line => console.log(line));
console.log('---\n');

// Teraz załaduj przez dotenv
require('dotenv').config({ path: envTestPath });

const key = process.env.GOOGLE_SHOPPING_API_KEY;
console.log('Klucz załadowany przez dotenv:', key);
console.log('Długość:', key?.length);
console.log('Czy to prawdziwy klucz?', key === 'TxZ91oHM53qcbiMvcWpD8vVQ');
