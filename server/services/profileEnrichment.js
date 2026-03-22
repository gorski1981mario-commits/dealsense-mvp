"use strict";

/**
 * AI PROFILE ENRICHMENT
 * 
 * User podaje 3-4 pola → AI dopowiada resztę
 * 
 * Przykład:
 * Input: { persons: 2, month: 6, style: 'relax' }
 * Output: { persons: 2, month: 6, style: 'relax', budget: 1500, standard: 'medium', preferences: [...] }
 */

/**
 * Budget estimation based on category and input
 */
function estimateBudget(category, input) {
  switch (category) {
    case 'vacation':
      const persons = input.persons || 2;
      const style = input.style || 'relax';
      
      // Base budget per person per week
      const baseBudget = {
        relax: 500,
        city: 400,
        luxury: 1500
      };
      
      return (baseBudget[style] || 500) * persons;
    
    case 'energy':
      const usage = input.usage || 'medium';
      const usageBudget = {
        low: 80,
        medium: 120,
        high: 180
      };
      return usageBudget[usage] || 120;
    
    case 'telecom':
      const dataUsage = input.dataUsage || 'medium';
      const dataBudget = {
        low: 15,
        medium: 25,
        high: 40
      };
      return dataBudget[dataUsage] || 25;
    
    case 'loan':
      const amount = input.amount || 10000;
      // Estimate monthly payment (5 years, 5% interest)
      return Math.round(amount * 0.0188);
    
    case 'mortgage':
      const housePrice = input.amount || 300000;
      // Estimate monthly payment (30 years, 3% interest)
      return Math.round(housePrice * 0.00422);
    
    default:
      return null;
  }
}

/**
 * Standard estimation (low/medium/high)
 */
function estimateStandard(category, input) {
  switch (category) {
    case 'vacation':
      const style = input.style || 'relax';
      if (style === 'luxury') return 'high';
      if (style === 'city') return 'medium';
      return 'medium';
    
    case 'energy':
    case 'telecom':
      return 'medium'; // Most users want medium
    
    case 'insurance':
      const age = input.age || 30;
      if (age > 50) return 'high'; // Older = more coverage
      return 'medium';
    
    default:
      return 'medium';
  }
}

/**
 * Risk estimation (low/medium/high)
 */
function estimateRisk(category, input) {
  switch (category) {
    case 'loan':
    case 'mortgage':
      const income = input.income || 3000;
      const amount = input.amount || 10000;
      const ratio = amount / (income * 12);
      
      if (ratio > 3) return 'high';
      if (ratio > 1.5) return 'medium';
      return 'low';
    
    case 'insurance':
      const age = input.age || 30;
      if (age > 60) return 'high';
      if (age > 40) return 'medium';
      return 'low';
    
    default:
      return 'low';
  }
}

/**
 * Preferences estimation based on category
 */
function estimatePreferences(category, input) {
  switch (category) {
    case 'vacation':
      return {
        beachfront: input.style === 'relax',
        cityCenter: input.style === 'city',
        spa: input.style === 'luxury',
        familyFriendly: (input.persons || 2) > 2,
        allInclusive: input.style === 'relax'
      };
    
    case 'energy':
      return {
        green: true, // Most users prefer green
        fixed: true, // Fixed price preferred
        longTerm: false
      };
    
    case 'telecom':
      return {
        unlimited: (input.dataUsage || 'medium') === 'high',
        international: false,
        fiveG: true
      };
    
    default:
      return {};
  }
}

/**
 * Główna funkcja enrichment
 * 
 * @param {string} category - Kategoria usługi
 * @param {Object} input - Minimal input od usera (3-4 pola)
 * @returns {Object} Enriched profile
 */
function enrichProfile(category, input) {
  const enriched = {
    ...input,
    
    // AI dopowiada
    budget: estimateBudget(category, input),
    standard: estimateStandard(category, input),
    risk: estimateRisk(category, input),
    preferences: estimatePreferences(category, input),
    
    // Metadata
    _enriched: true,
    _enrichedAt: Date.now(),
    _category: category
  };
  
  return enriched;
}

/**
 * Fallback strategy - jeśli AI się myli
 * 
 * Rozszerza kryteria jeśli za mało wyników
 */
function fallbackEnrichment(enrichedProfile, results) {
  const fallback = { ...enrichedProfile };
  
  // Jeśli za mało wyników (< 5) lub niski avg score (< 6.0)
  const needsFallback = results.length < 5 || 
    (results.length > 0 && getAvgScore(results) < 6.0);
  
  if (needsFallback) {
    // Rozszerz budżet o 20%
    if (fallback.budget) {
      fallback.budget = Math.round(fallback.budget * 1.2);
    }
    
    // Obniż standard
    if (fallback.standard === 'high') {
      fallback.standard = 'medium';
    } else if (fallback.standard === 'medium') {
      fallback.standard = 'low';
    }
    
    // Metadata
    fallback._fallback = true;
    fallback._fallbackReason = results.length < 5 ? 'too_few_results' : 'low_quality';
  }
  
  return fallback;
}

/**
 * Helper: oblicza avg score
 */
function getAvgScore(results) {
  if (!results || results.length === 0) return 0;
  
  const scores = results
    .map(r => r._dealScore?.dealScore || 0)
    .filter(s => s > 0);
  
  if (scores.length === 0) return 0;
  
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

module.exports = {
  enrichProfile,
  fallbackEnrichment,
  estimateBudget,
  estimateStandard,
  estimateRisk,
  estimatePreferences
};
