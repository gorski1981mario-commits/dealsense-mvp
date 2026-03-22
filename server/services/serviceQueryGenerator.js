"use strict";

/**
 * SMART QUERY GENERATOR (dla usług)
 * 
 * Zamiast 20 zapytań → tylko 1-3!
 * Sprytnie generowane na podstawie enriched profile
 */

const { getMaxQueries } = require('./categoryConfig');

/**
 * Query templates per kategoria
 */
const QUERY_TEMPLATES = {
  vacation: [
    '{destination} all inclusive {month} {persons} personen',
    '{destination} goedkoop {month} vakantie',
    'last minute {destination} {month}',
    '{destination} {style} hotel {month}'
  ],
  energy: [
    'goedkope energie vergelijken',
    'groene energie {usage}',
    'vaste energiecontract'
  ],
  telecom: [
    'goedkoop mobiel abonnement {data}GB',
    'onbeperkt bellen {data}GB',
    'sim only {data}GB goedkoop'
  ],
  insurance: [
    '{type} verzekering vergelijken',
    'goedkope {type} verzekering',
    '{type} verzekering {age} jaar'
  ],
  leasing: [
    'zakelijke lease {type}',
    'goedkope lease auto',
    'operational lease vergelijken'
  ],
  loan: [
    'persoonlijke lening {amount} euro',
    'goedkope lening vergelijken',
    'lening laagste rente'
  ],
  mortgage: [
    'hypotheek {amount} euro',
    'goedkope hypotheek vergelijken',
    'hypotheek laagste rente'
  ],
  creditcard: [
    'creditcard vergelijken',
    'gratis creditcard',
    'creditcard cashback'
  ],
  subscriptions: [
    '{platform} abonnement goedkoop',
    'streaming diensten vergelijken',
    '{platform} aanbieding'
  ]
};

/**
 * Generuje queries na podstawie enriched profile
 * 
 * @param {string} category - Kategoria usługi
 * @param {Object} enrichedProfile - Enriched profile
 * @returns {string[]} Array of queries (1-3 max)
 */
function generateServiceQueries(category, enrichedProfile) {
  const templates = QUERY_TEMPLATES[category] || [];
  const maxQueries = getMaxQueries(category);
  
  if (templates.length === 0) {
    // Fallback: generic query
    return [category + ' vergelijken'];
  }
  
  // Fill templates with profile data
  const queries = templates
    .slice(0, maxQueries)
    .map(template => fillTemplate(template, enrichedProfile, category))
    .filter(q => q && q.length > 0);
  
  // Deduplicate
  return [...new Set(queries)];
}

/**
 * Wypełnia template danymi z profile
 */
function fillTemplate(template, profile, category) {
  let query = template;
  
  // Replace placeholders
  const replacements = getReplacements(profile, category);
  
  Object.entries(replacements).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    if (value) {
      query = query.replace(placeholder, value);
    } else {
      // Remove placeholder if no value
      query = query.replace(placeholder, '').trim();
    }
  });
  
  // Clean up multiple spaces
  query = query.replace(/\s+/g, ' ').trim();
  
  return query;
}

/**
 * Pobiera replacements z profile
 */
function getReplacements(profile, category) {
  const replacements = {};
  
  switch (category) {
    case 'vacation':
      replacements.destination = profile.destination || 'Spanje';
      replacements.month = getMonthName(profile.month);
      replacements.persons = profile.persons || 2;
      replacements.style = profile.style || 'relax';
      break;
    
    case 'energy':
      replacements.usage = profile.usage || 'gemiddeld';
      break;
    
    case 'telecom':
      replacements.data = profile.dataGB || 10;
      break;
    
    case 'insurance':
      replacements.type = profile.type || 'zorg';
      replacements.age = profile.age || 30;
      break;
    
    case 'leasing':
      replacements.type = profile.vehicleType || 'auto';
      break;
    
    case 'loan':
    case 'mortgage':
      replacements.amount = profile.amount || 10000;
      break;
    
    case 'subscriptions':
      replacements.platform = profile.platform || 'streaming';
      break;
  }
  
  return replacements;
}

/**
 * Helper: month number → name
 */
function getMonthName(monthNumber) {
  const months = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];
  
  if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
    return 'juni'; // Default
  }
  
  return months[monthNumber - 1];
}

/**
 * Generuje alternative queries (dla exploration)
 * 
 * Używane jeśli pierwsze queries dały słabe wyniki
 */
function generateAlternativeQueries(category, enrichedProfile) {
  const alternatives = {
    vacation: [
      'goedkope vakantie {month}',
      'last minute deals {destination}',
      'all inclusive aanbieding'
    ],
    energy: [
      'energie vergelijken cashback',
      'groene energie goedkoop'
    ],
    telecom: [
      'sim only deals',
      'mobiel abonnement aanbieding'
    ]
  };
  
  const templates = alternatives[category] || [];
  
  return templates
    .map(template => fillTemplate(template, enrichedProfile, category))
    .filter(q => q && q.length > 0);
}

module.exports = {
  generateServiceQueries,
  generateAlternativeQueries,
  QUERY_TEMPLATES
};
