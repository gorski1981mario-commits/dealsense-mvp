"use strict";

/**
 * QUERY BUILDER PER CATEGORY
 * 
 * Generuje różne queries dla różnych kategorii
 * - Elektronika: mało wariantów (EAN = 1:1)
 * - Moda: dużo wariantów (rozmiary, kolory)
 * - Auto: model + rok + część
 * - itd.
 */

const { getCategoryProfile } = require('./categorySearchProfiles');

/**
 * Parsuj nazwę produktu na komponenty
 */
function parseProductName(productName) {
  const input = String(productName || '').trim();
  
  // Regex patterns
  const brandPattern = /(apple|samsung|sony|lg|philips|bose|nike|adidas|bosch|makita|dewalt|dyson|karcher|garmin|fitbit|lego|bmw|mercedes|audi|volkswagen|vw|ford|toyota|honda)/i;
  const sizePattern = /\b(small|medium|large|xl|xxl|s|m|l|xs|[0-9]{2,3})\b/i;
  const colorPattern = /\b(black|white|red|blue|green|yellow|grey|gray|silver|gold|zwart|wit|rood|blauw|groen|geel|grijs|zilver|goud)\b/i;
  const voltagePattern = /\b([0-9]{1,2}v|[0-9]{1,3}volt)\b/i;
  const powerPattern = /\b([0-9]{1,4}w|[0-9]{1,4}watt)\b/i;
  const yearPattern = /\b(20[0-9]{2}|19[0-9]{2})\b/;
  
  const components = {
    brand: null,
    model: null,
    size: null,
    color: null,
    voltage: null,
    power: null,
    year: null,
    category: null,
    raw: input
  };
  
  // Extract brand
  const brandMatch = input.match(brandPattern);
  if (brandMatch) {
    components.brand = brandMatch[1];
  }
  
  // Extract size
  const sizeMatch = input.match(sizePattern);
  if (sizeMatch) {
    components.size = sizeMatch[1];
  }
  
  // Extract color
  const colorMatch = input.match(colorPattern);
  if (colorMatch) {
    components.color = colorMatch[1];
  }
  
  // Extract voltage
  const voltageMatch = input.match(voltagePattern);
  if (voltageMatch) {
    components.voltage = voltageMatch[1];
  }
  
  // Extract power
  const powerMatch = input.match(powerPattern);
  if (powerMatch) {
    components.power = powerMatch[1];
  }
  
  // Extract year
  const yearMatch = input.match(yearPattern);
  if (yearMatch) {
    components.year = yearMatch[1];
  }
  
  // Model = reszta (bez brand, size, color, etc.)
  let model = input;
  if (components.brand) model = model.replace(new RegExp(components.brand, 'gi'), '').trim();
  if (components.size) model = model.replace(new RegExp(components.size, 'gi'), '').trim();
  if (components.color) model = model.replace(new RegExp(components.color, 'gi'), '').trim();
  if (components.voltage) model = model.replace(new RegExp(components.voltage, 'gi'), '').trim();
  if (components.power) model = model.replace(new RegExp(components.power, 'gi'), '').trim();
  if (components.year) model = model.replace(new RegExp(components.year, 'gi'), '').trim();
  
  components.model = model.trim();
  
  return components;
}

/**
 * Generuj queries dla kategorii
 */
function buildQueriesForCategory(productName, ean, category) {
  const profile = getCategoryProfile(category);
  const components = parseProductName(productName);
  const queries = [];
  
  // PRIMARY QUERY (z template profilu)
  let primaryQuery = profile.queryBuilder.primary;
  
  // Replace placeholders
  primaryQuery = primaryQuery
    .replace('[brand]', components.brand || '')
    .replace('[model]', components.model || '')
    .replace('[specs]', `${components.size || ''} ${components.color || ''}`.trim())
    .replace('[ean]', ean || '')
    .replace('[size]', components.size || '')
    .replace('[color]', components.color || '')
    .replace('[voltage]', components.voltage || '')
    .replace('[torque]', '') // TODO: extract torque
    .replace('[power]', components.power || '')
    .replace('[year]', components.year || '')
    .replace('[age]', '') // TODO: extract age
    .replace('[car_model]', '') // TODO: extract car model
    .replace('[part]', '') // TODO: extract part
    .replace('[category]', components.category || '');
  
  // Clean up (remove multiple spaces)
  primaryQuery = primaryQuery.replace(/\s+/g, ' ').trim();
  
  queries.push({
    query: primaryQuery,
    type: 'primary',
    weight: 100
  });
  
  // FALLBACK QUERY
  let fallbackQuery = profile.queryBuilder.fallback;
  fallbackQuery = fallbackQuery
    .replace('[brand]', components.brand || '')
    .replace('[model]', components.model || '')
    .replace('[specs]', `${components.size || ''} ${components.color || ''}`.trim())
    .replace('[category]', components.category || '')
    .replace('[voltage]', components.voltage || '')
    .replace('[car_model]', '');
  
  fallbackQuery = fallbackQuery.replace(/\s+/g, ' ').trim();
  
  queries.push({
    query: fallbackQuery,
    type: 'fallback',
    weight: 80
  });
  
  // VARIANTS (dla kategorii z dużą liczbą wariantów)
  const maxVariants = profile.queryBuilder.maxVariants || 3;
  
  if (maxVariants > 3) {
    // Dodaj warianty (np. różne rozmiary dla mody)
    if (category === 'fashion' && components.size) {
      // Warianty rozmiarów
      const sizes = ['S', 'M', 'L', 'XL'];
      sizes.forEach(size => {
        if (size !== components.size) {
          const variantQuery = `${components.brand || ''} ${components.model || ''} ${size} ${components.color || ''} NL`.trim();
          queries.push({
            query: variantQuery,
            type: 'variant',
            weight: 60
          });
        }
      });
    }
  }
  
  // Limit do maxVariants
  return queries.slice(0, maxVariants);
}

/**
 * Generuj query dla SERP API (constrained search)
 */
function buildSerpQuery(productName, ean, category) {
  const profile = getCategoryProfile(category);
  const components = parseProductName(productName);
  
  // SERP constrained: site + exact match
  let query = '';
  
  if (profile.searchStrategy.exactMatch) {
    // Exact match (w cudzysłowach)
    query = `"${components.brand || ''} ${components.model || ''}".trim()`;
  } else {
    // Fuzzy match
    query = `${components.brand || ''} ${components.model || ''}`.trim();
  }
  
  // Dodaj EAN jeśli ważny
  if (ean && profile.searchStrategy.eanWeight >= 80) {
    query += ` ${ean}`;
  }
  
  // Dodaj location
  query += ' NL';
  
  return {
    query: query.trim(),
    exactMatch: profile.searchStrategy.exactMatch,
    site: null // TODO: dodać site constraint (np. site:bol.com)
  };
}

module.exports = {
  parseProductName,
  buildQueriesForCategory,
  buildSerpQuery
};
